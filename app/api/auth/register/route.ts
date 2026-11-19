import { NextRequest, NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge";
import { getDb } from "@/lib/admin/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { setUserSessionCookies } from "@/lib/auth/userAuth";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 5 registration attempts per 10 minutes per IP
    const rateLimit = await checkRateLimit("public_register", clientIp, 5, 600);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Please wait ${rateLimit.resetInSeconds} seconds before retrying.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.resetInSeconds) },
        }
      );
    }

    const body = await req.json();
    const {
      accountType,
      email,
      password,
      fullName,
      companyName,
      contactName,
      acceptTerms,
    } = body;

    // 1. Account type validation: MUST be exactly 'talent' or 'company'
    if (accountType !== "talent" && accountType !== "company") {
      return NextResponse.json(
        { success: false, error: "Invalid account type. Please select either Talent or Company." },
        { status: 400 }
      );
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid corporate or professional email address." },
        { status: 400 }
      );
    }

    // 3. Password validation (min 8 characters)
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters in length." },
        { status: 400 }
      );
    }

    // 4. Terms acceptance check
    if (!acceptTerms) {
      return NextResponse.json(
        { success: false, error: "You must accept the Terms of Service and Privacy Notice to register." },
        { status: 400 }
      );
    }

    // 5. Profile fields validation based on account type
    let resolvedName = "";
    if (accountType === "talent") {
      if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Please provide your full legal or professional name." },
          { status: 400 }
        );
      }
      resolvedName = fullName.trim();
    } else {
      if (!companyName || typeof companyName !== "string" || companyName.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Please provide your enterprise organization or company name." },
          { status: 400 }
        );
      }
      if (!contactName || typeof contactName !== "string" || contactName.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Please provide the primary contact person's name." },
          { status: 400 }
        );
      }
      resolvedName = contactName.trim();
    }

    // 6. Check existing user in database
    const db = getDb();
    const existing = await db.prepare(
      "SELECT id FROM auth.users WHERE email = ? LIMIT 1"
    ).get(cleanEmail);

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // 7. Register user via InsForge Auth SDK
    const insforge = getInsforgeClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ricoz-six.vercel.app";
    const signUpResult = await insforge.auth.signUp({
      email: cleanEmail,
      password,
      name: resolvedName,
      redirectTo: `${siteUrl}/login`,
    });

    if (signUpResult.error) {
      console.warn("InsForge signUp error code:", signUpResult.error.statusCode, "message:", signUpResult.error.message);
      const isDuplicate =
        signUpResult.error.statusCode === 409 ||
        signUpResult.error.message?.toLowerCase().includes("already registered") ||
        signUpResult.error.message?.toLowerCase().includes("already exists");

      if (isDuplicate) {
        return NextResponse.json(
          { success: false, error: "An account with this email address already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      // Map known failures to safe, sanitized user messages; never return raw InsForge/DB strings
      const errorMsgLower = signUpResult.error.message?.toLowerCase() || "";
      let safeMsg = "Registration could not be completed. Please check your details and try again.";
      if (errorMsgLower.includes("password")) {
        safeMsg = "Password does not meet security requirements. Please use at least 8 characters.";
      } else if (errorMsgLower.includes("email") || errorMsgLower.includes("invalid")) {
        safeMsg = "Please provide a valid corporate or professional email address.";
      } else if (signUpResult.error.statusCode === 429) {
        safeMsg = "Too many registration attempts. Please wait a few minutes before trying again.";
      }

      return NextResponse.json(
        { success: false, error: safeMsg },
        { status: signUpResult.error.statusCode || 400 }
      );
    }

    // Retrieve the created user ID from response data or query auth.users
    let userId = signUpResult.data?.user?.id;
    if (!userId) {
      const createdUser = (await db.prepare(
        "SELECT id FROM auth.users WHERE email = ? LIMIT 1"
      ).get(cleanEmail)) as { id: string } | undefined;
      userId = createdUser?.id;
    }

    if (!userId) {
      throw new Error("User record was not found after registration.");
    }

    // 7b. Check existing metadata on auth.users to ensure an existing user's role is never overwritten
    const authUserRow = (await db.prepare(
      "SELECT id, metadata FROM auth.users WHERE id = ?"
    ).get(userId)) as { id: string; metadata?: any } | undefined;

    const existingMetaType = authUserRow?.metadata?.account_type;
    if (existingMetaType && existingMetaType !== accountType) {
      console.warn("Registration rejected: user already registered with different account_type:", existingMetaType);
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    // Persist trusted registration metadata into auth.users reliably using RETURNING clause
    // Fails safely if metadata cannot be updated, ensuring incomplete registrations are not silently treated as successful
    let updatedUserRow: { id: string; metadata?: any } | null = null;
    try {
      updatedUserRow = (await db.prepare(`
        UPDATE auth.users
        SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{account_type}', to_jsonb(?::text), true)
        WHERE id = ? AND (metadata->>'account_type' IS NULL OR metadata->>'account_type' = ? OR metadata->>'account_type' = '')
        RETURNING id, metadata
      `).get(accountType, userId, accountType)) as { id: string; metadata?: any } | null;
    } catch (metaErr: any) {
      console.error("Critical: Database error updating auth.users metadata:", metaErr?.message || metaErr);
      return NextResponse.json(
        {
          success: false,
          error: "Registration service encountered a temporary error while securing your account credentials. Please try again.",
        },
        { status: 500 }
      );
    }

    // Verify that exactly the intended user record was updated and persisted metadata matches validated accountType
    if (!updatedUserRow || updatedUserRow.id !== userId || updatedUserRow.metadata?.account_type !== accountType) {
      console.error("Critical: Metadata persistence verification failed for user:", userId, "result:", updatedUserRow);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify registration profile credentials. Please try again or sign in.",
        },
        { status: 500 }
      );
    }

    // 8. Create corresponding Public User Profile (safe against duplicates/retries)
    await db.prepare(`
      INSERT INTO public.user_profiles (
        id, account_type, email, full_name, avatar_url, is_verified, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, '', false, 'active', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `).run(userId, accountType, cleanEmail, resolvedName);

    // 9. Create specialized profile (only the requested accountType is created)
    if (accountType === "talent") {
      await db.prepare(`
        INSERT INTO public.talent_profiles (
          id, user_id, headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability, created_at, updated_at
        ) VALUES (?, ?, 'Creative Director & Brand Specialist', '', '', 5, '$150/hr', '', '[]'::jsonb, 'Available now', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `).run(userId, userId);
    } else {
      await db.prepare(`
        INSERT INTO public.company_profiles (
          id, user_id, company_name, contact_name, business_email, industry, company_size, website_url, billing_country, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'Technology & Innovation', '10-50', '', '', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `).run(userId, userId, (companyName as string).trim(), resolvedName, cleanEmail);
    }

    // Inspect whether email verification is explicitly confirmed as complete by InsForge
    const isExplicitlyVerified = Boolean(
      (signUpResult.data?.user as any)?.emailVerified ||
      (signUpResult.data?.user as any)?.email_confirmed_at
    );

    // If InsForge explicitly confirms the user is already verified (e.g. pre-verified OAuth or test config)
    if (isExplicitlyVerified && signUpResult.data?.accessToken) {
      await db.prepare(
        "UPDATE public.user_profiles SET is_verified = true, updated_at = NOW() WHERE id = ?"
      ).run(userId);

      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
      await setUserSessionCookies(
        {
          userId,
          email: cleanEmail,
          accountType,
          fullName: resolvedName,
          status: "active",
          exp,
        },
        signUpResult.data.accessToken,
        signUpResult.data.refreshToken || null
      );

      const redirectUrl = accountType === "talent" ? "/dashboard/designer" : "/dashboard/company";

      return NextResponse.json(
        {
          success: true,
          message: "Registration completed successfully.",
          requireEmailVerification: false,
          redirectUrl,
          email: cleanEmail,
          accountType,
          userId,
        },
        { status: 201 }
      );
    }

    // Standard flow: email verification required
    return NextResponse.json(
      {
        success: true,
        message: "Registration initiated successfully. Please enter the verification code sent to your email.",
        requireEmailVerification: true,
        email: cleanEmail,
        accountType,
        userId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Public registration exception:", error?.message || error);

    // Keep configuration error details on the server console; do not expose internal variable names to clients
    return NextResponse.json(
      { success: false, error: "Unable to process registration at this time. Please try again later." },
      { status: 500 }
    );
  }
}
