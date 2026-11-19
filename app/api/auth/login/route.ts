import { NextRequest, NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge";
import { getDb } from "@/lib/admin/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { setUserSessionCookies, getFullUserProfile } from "@/lib/auth/userAuth";
import { createAdminSession, SESSION_COOKIE_NAME, SESSION_MAX_LIFETIME_HOURS } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 10 login attempts per 5 minutes per IP
    const rateLimit = await checkRateLimit("public_login", clientIp, 10, 300);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateLimit.resetInSeconds} seconds before retrying.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.resetInSeconds) },
        }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!cleanEmail || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter both your work email and password." },
        { status: 400 }
      );
    }

    // Call InsForge Auth SDK
    const insforge = getInsforgeClient();
    const signInResult = await insforge.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signInResult.error) {
      console.warn("Public sign-in error for", cleanEmail, signInResult.error.message);
      // Check if email verification is required (HTTP 403)
      if (signInResult.error.statusCode === 403 || signInResult.error.message?.includes("verify your email")) {
        return NextResponse.json(
          {
            success: false,
            requireEmailVerification: true,
            email: cleanEmail,
            error: "Email verification required. Please enter the 6-digit verification code sent to your email.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    const user = signInResult.data?.user;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unable to complete sign in at this time. Please try again." },
        { status: 500 }
      );
    }

    // Query existing base profile
    const db = getDb();

    // Check if the authenticated user is an authorized Admin account in PostgreSQL admin_users
    const adminUserRow = (await db.prepare(
      "SELECT id, email, full_name, role, status FROM admin_users WHERE (id = ? OR LOWER(email) = ?) AND status = 'active'"
    ).get(user.id, cleanEmail)) as {
      id: string;
      email: string;
      full_name: string;
      role: string;
      status: string;
    } | undefined;

    if (adminUserRow) {
      const userAgent = req.headers.get("user-agent") || "browser";
      const { token: adminToken } = await createAdminSession(adminUserRow.id, clientIp, userAgent);

      await recordAuditLog({
        actor: {
          id: adminUserRow.id,
          email: adminUserRow.email,
          fullName: adminUserRow.full_name,
          role: adminUserRow.role as any,
        } as any,
        action: "USER_LOGIN",
        entityType: "admin_user",
        entityId: adminUserRow.id,
        changeSummary: `Admin ${adminUserRow.full_name} (${adminUserRow.role}) signed in via public login.`,
        ipAddress: clientIp,
      });

      // If they also have a base profile, issue user session cookies as well
      const baseProfile = (await db.prepare(
        "SELECT id, account_type, email, full_name, avatar_url, is_verified, status FROM public.user_profiles WHERE id = ?"
      ).get(user.id)) as any;

      if (baseProfile) {
        const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
        await setUserSessionCookies(
          {
            userId: user.id,
            email: cleanEmail,
            accountType: baseProfile.account_type,
            fullName: baseProfile.full_name || cleanEmail,
            avatarUrl: baseProfile.avatar_url || "",
            exp,
          },
          signInResult.data?.accessToken,
          null
        );
      }

      const response = NextResponse.json({
        success: true,
        message: "Successfully signed in as administrator.",
        user: {
          id: adminUserRow.id,
          email: cleanEmail,
          fullName: adminUserRow.full_name,
          role: adminUserRow.role,
        },
        profile: baseProfile || null,
        accountType: "admin",
        isAdmin: true,
        redirectUrl: "/admin",
      });

      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: adminToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_LIFETIME_HOURS * 3600,
        path: "/",
      });

      return response;
    }

    let baseProfile = (await db.prepare(
      "SELECT id, account_type, email, full_name, avatar_url, is_verified, status FROM public.user_profiles WHERE id = ?"
    ).get(user.id)) as {
      id: string;
      account_type: "talent" | "company";
      email: string;
      full_name: string;
      avatar_url: string;
      is_verified: boolean;
      status: "active" | "suspended" | "deactivated";
    } | undefined;

    // STATE A: No base profile exists
    if (!baseProfile) {
      const existingTalent = await db.prepare("SELECT id FROM public.talent_profiles WHERE user_id = ?").get(user.id);
      const existingCompany = await db.prepare("SELECT id FROM public.company_profiles WHERE user_id = ?").get(user.id);

      let resolvedAccountType: "talent" | "company" | null = null;
      // Handle single or conflicting/duplicate specialized profiles safely
      if (existingTalent && !existingCompany) {
        resolvedAccountType = "talent";
      } else if (existingCompany && !existingTalent) {
        resolvedAccountType = "company";
      } else {
        // Conflicting or neither specialized profile exists: query authoritative registration metadata from auth.users
        const authUserRow = (await db.prepare(
          "SELECT metadata FROM auth.users WHERE id = ?"
        ).get(user.id)) as { metadata?: any } | undefined;

        const metadataAccountType = authUserRow?.metadata?.account_type;
        if (metadataAccountType === "talent" || metadataAccountType === "company") {
          resolvedAccountType = metadataAccountType;
        }
      }

      // If account type cannot be established reliably from trusted records or metadata, fail safely
      if (!resolvedAccountType) {
        console.error("Sign-in profile recovery failed: unable to establish trusted account type for user", user.id);
        return NextResponse.json(
          {
            success: false,
            error: "Your account profile setup is incomplete and cannot be resolved automatically. Please contact concierge@ricoz.io for account resolution.",
          },
          { status: 403 }
        );
      }

      const userName = (user as any).profile?.name || (user as any).name || cleanEmail.split("@")[0] || "RICOZ Member";

      await db.prepare(`
        INSERT INTO public.user_profiles (id, account_type, email, full_name, avatar_url, is_verified, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, '', true, 'active', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `).run(user.id, resolvedAccountType, cleanEmail, userName);

      if (resolvedAccountType === "talent") {
        await db.prepare(`
          INSERT INTO public.talent_profiles (id, user_id, headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability, created_at, updated_at)
          VALUES (?, ?, 'Creative Director & Brand Specialist', '', '', 5, '$150/hr', '', '[]'::jsonb, 'Available now', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `).run(user.id, user.id);
      } else {
        await db.prepare(`
          INSERT INTO public.company_profiles (id, user_id, company_name, contact_name, business_email, industry, company_size, website_url, billing_country, created_at, updated_at)
          VALUES (?, ?, 'Enterprise Client', ?, ?, 'Technology & Innovation', '10-50', '', '', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `).run(user.id, user.id, userName, cleanEmail);
      }

      baseProfile = (await db.prepare(
        "SELECT id, account_type, email, full_name, avatar_url, is_verified, status FROM public.user_profiles WHERE id = ?"
      ).get(user.id)) as typeof baseProfile;
    }

    if (!baseProfile) {
      console.error("Sign-in failed: base profile still missing after recovery for user", user.id);
      return NextResponse.json(
        {
          success: false,
          error: "Your account profile setup is incomplete. Please contact concierge@ricoz.io for assistance.",
        },
        { status: 500 }
      );
    }

    // STATE B & C: Base profile exists; check and recover specialized profile if missing (State B)
    let details: any = null;
    if (baseProfile.account_type === "talent") {
      details = await db.prepare(
        "SELECT headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability FROM public.talent_profiles WHERE user_id = ?"
      ).get(user.id);

      // State B for talent: base profile exists, specialized talent profile is missing
      if (!details) {
        await db.prepare(`
          INSERT INTO public.talent_profiles (
            id, user_id, headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability, created_at, updated_at
          ) VALUES (?, ?, 'Creative Director & Brand Specialist', '', '', 5, '$150/hr', '', '[]'::jsonb, 'Available now', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `).run(user.id, user.id);

        details = await db.prepare(
          "SELECT headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability FROM public.talent_profiles WHERE user_id = ?"
        ).get(user.id);
      }
    } else if (baseProfile.account_type === "company") {
      details = await db.prepare(
        "SELECT company_name, contact_name, business_email, industry, company_size, website_url, billing_country FROM public.company_profiles WHERE user_id = ?"
      ).get(user.id);

      // State B for company: base profile exists, specialized company profile is missing
      if (!details) {
        await db.prepare(`
          INSERT INTO public.company_profiles (
            id, user_id, company_name, contact_name, business_email, industry, company_size, website_url, billing_country, created_at, updated_at
          ) VALUES (?, ?, 'Enterprise Client', ?, ?, 'Technology & Innovation', '10-50', '', '', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `).run(user.id, user.id, baseProfile.full_name || "Enterprise Contact", baseProfile.email);

        details = await db.prepare(
          "SELECT company_name, contact_name, business_email, industry, company_size, website_url, billing_country FROM public.company_profiles WHERE user_id = ?"
        ).get(user.id);
      }
    }

    // Verify the recovered profile before issuing the session
    if (!details) {
      console.error("Login recovery failed: unable to verify specialized profile for user", user.id);
      return NextResponse.json(
        {
          success: false,
          error: "Your account profile could not be fully loaded. Please contact concierge@ricoz.io for assistance.",
        },
        { status: 500 }
      );
    }

    const profile = {
      ...baseProfile,
      details,
    };

    // Verify account status
    if (profile?.status === "suspended") {
      return NextResponse.json(
        {
          success: false,
          error: "Your account has been suspended. Please contact concierge@ricoz.io for assistance.",
        },
        { status: 403 }
      );
    }

    if (profile?.status === "deactivated") {
      return NextResponse.json(
        {
          success: false,
          error: "This account has been deactivated.",
        },
        { status: 403 }
      );
    }

    const accountType = profile.account_type;
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days

    // Set secure user session cookies
    await setUserSessionCookies(
      {
        userId: user.id,
        email: cleanEmail,
        accountType,
        fullName: profile?.full_name || cleanEmail,
        avatarUrl: profile?.avatar_url || "",
        exp,
      },
      signInResult.data?.accessToken,
      null
    );

    const redirectUrl = accountType === "talent" ? "/dashboard/designer" : "/dashboard/company";

    return NextResponse.json({
      success: true,
      message: "Successfully signed in.",
      user: {
        id: user.id,
        email: cleanEmail,
      },
      profile,
      accountType,
      redirectUrl,
    });
  } catch (error: any) {
    console.error("Public sign-in exception:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during sign in. Please try again." },
      { status: 500 }
    );
  }
}
