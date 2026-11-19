import { NextRequest, NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge";
import { getDb } from "@/lib/admin/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { setUserSessionCookies, getFullUserProfile } from "@/lib/auth/userAuth";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 10 verification attempts per 5 minutes per IP
    const rateLimit = await checkRateLimit("public_verify_otp", clientIp, 10, 300);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many verification attempts. Please wait ${rateLimit.resetInSeconds} seconds before retrying.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.resetInSeconds) },
        }
      );
    }

    const body = await req.json();
    const { email, otp } = body;

    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanOtp = typeof otp === "string" ? otp.trim() : "";

    if (!cleanEmail || !cleanOtp || cleanOtp.length < 4) {
      return NextResponse.json(
        { success: false, error: "Please provide both your registered email and the verification code." },
        { status: 400 }
      );
    }

    // Call InsForge SDK verifyEmail
    const insforge = getInsforgeClient();
    const verifyResult = await insforge.auth.verifyEmail({
      email: cleanEmail,
      otp: cleanOtp,
    });

    if (verifyResult.error) {
      console.warn("InsForge verifyEmail rejected code for", cleanEmail, verifyResult.error.message);
      const isExpired = verifyResult.error.message?.toLowerCase().includes("expired");
      const safeErrorMsg = isExpired
        ? "Verification code has expired. Please request a new code."
        : "Invalid verification code. Please check the code sent to your email.";
      return NextResponse.json(
        { success: false, error: safeErrorMsg },
        { status: verifyResult.error.statusCode || 400 }
      );
    }

    const user = verifyResult.data?.user;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unable to complete verification at this time. Please try again." },
        { status: 500 }
      );
    }

    // Safe, idempotent profile verification & recovery
    const db = getDb();
    const existingProfile = (await db.prepare(
      "SELECT id, account_type FROM public.user_profiles WHERE id = ?"
    ).get(user.id)) as { id: string; account_type: "talent" | "company" } | undefined;

    let accountType = existingProfile?.account_type;

    if (existingProfile) {
      // Profile exists: update verification status safely without altering account type or data
      await db.prepare(`
        UPDATE public.user_profiles
        SET is_verified = true, updated_at = NOW()
        WHERE id = ?
      `).run(user.id);
    } else {
      // Partial-registration recovery: user verified OTP successfully via InsForge
      // Retrieve the original account type from trusted registration metadata or existing specialized records.
      // NEVER trust or accept a client-supplied accountType.
      const existingTalent = await db.prepare("SELECT id FROM public.talent_profiles WHERE user_id = ?").get(user.id);
      const existingCompany = await db.prepare("SELECT id FROM public.company_profiles WHERE user_id = ?").get(user.id);

      // Handle conflicting or single specialized profiles cleanly
      if (existingTalent && !existingCompany) {
        accountType = "talent";
      } else if (existingCompany && !existingTalent) {
        accountType = "company";
      } else {
        // Query trusted registration metadata from auth.users (resolves conflicts or unprovisioned profiles)
        const authUserRow = (await db.prepare(
          "SELECT metadata FROM auth.users WHERE id = ?"
        ).get(user.id)) as { metadata?: any } | undefined;

        const metadataAccountType = authUserRow?.metadata?.account_type;
        if (metadataAccountType === "talent" || metadataAccountType === "company") {
          accountType = metadataAccountType;
        }
      }

      // Fail safely if trusted account type cannot be established
      if (!accountType) {
        console.error("OTP verification recovery failed: unable to establish trusted account type for user", user.id);
        return NextResponse.json(
          {
            success: false,
            error: "Account verification succeeded, but your account type could not be established from trusted records. Please contact concierge@ricoz.io for assistance.",
          },
          { status: 422 }
        );
      }

      const resolvedName = (user as any).name || (user as any).profile?.name || cleanEmail.split("@")[0] || "RICOZ Member";

      await db.prepare(`
        INSERT INTO public.user_profiles (
          id, account_type, email, full_name, avatar_url, is_verified, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, '', true, 'active', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET is_verified = true, updated_at = NOW()
      `).run(user.id, accountType, cleanEmail, resolvedName);

      if (accountType === "talent") {
        await db.prepare(`
          INSERT INTO public.talent_profiles (
            id, user_id, headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability, created_at, updated_at
          ) VALUES (?, ?, 'Creative Director & Brand Specialist', '', '', 5, '$150/hr', '', '[]'::jsonb, 'Available now', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `).run(user.id, user.id);
      } else {
        await db.prepare(`
          INSERT INTO public.company_profiles (
            id, user_id, company_name, contact_name, business_email, industry, company_size, website_url, billing_country, created_at, updated_at
          ) VALUES (?, ?, 'Enterprise Client', ?, ?, 'Technology & Innovation', '10-50', '', '', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `).run(user.id, user.id, resolvedName, cleanEmail);
      }
    }

    // Fetch full profile (with self-healing enabled for authenticated user)
    const profile = await getFullUserProfile(user.id, { allowSelfHealing: true });
    const resolvedAccountType = profile?.account_type || accountType;

    if (!resolvedAccountType) {
      return NextResponse.json(
        {
          success: false,
          error: "Account profile recovery could not be completed. Please contact concierge@ricoz.io.",
        },
        { status: 500 }
      );
    }

    // Set secure user session cookies
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
    await setUserSessionCookies(
      {
        userId: user.id,
        email: cleanEmail,
        accountType: resolvedAccountType,
        fullName: profile?.full_name || cleanEmail,
        avatarUrl: profile?.avatar_url || "",
        exp,
      },
      verifyResult.data?.accessToken,
      null
    );

    const redirectUrl = resolvedAccountType === "talent" ? "/dashboard/designer" : "/dashboard/company";

    return NextResponse.json({
      success: true,
      message: "Email successfully verified and authenticated.",
      user,
      profile,
      accountType: resolvedAccountType,
      redirectUrl,
    });
  } catch (error: any) {
    console.error("Public verifyEmail error:", error?.message || error);
    if (error?.name === "ProfileRecoveryError") {
      return NextResponse.json(
        {
          success: false,
          error: "Email verification succeeded, but your account profile setup could not be completed. Please contact concierge@ricoz.io for assistance.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}
