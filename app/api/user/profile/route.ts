import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserSession, getFullUserProfile } from "@/lib/auth/userAuth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

function formatProfileResponse(profile: any) {
  if (!profile) return null;
  const isTalent = profile.account_type === "talent";
  const isCompany = profile.account_type === "company";
  const details = profile.details || {};

  return {
    ...profile,
    fullName: profile.full_name,
    accountType: profile.account_type,
    avatarUrl: profile.avatar_url,
    isVerified: profile.is_verified,
    createdAt: profile.created_at,
    details,
    talentProfile: isTalent ? {
      ...details,
      headline: details.headline,
      bio: details.bio,
      location: details.location,
      yearsExperience: details.years_experience,
      years_experience: details.years_experience,
      hourlyRate: details.hourly_rate,
      hourly_rate: details.hourly_rate,
      portfolioUrl: details.portfolio_url,
      portfolio_url: details.portfolio_url,
      skills: Array.isArray(details.skills) ? details.skills : [],
      availability: details.availability,
    } : null,
    companyProfile: isCompany ? {
      ...details,
      companyName: details.company_name,
      company_name: details.company_name,
      contactName: details.contact_name,
      contact_name: details.contact_name,
      businessEmail: details.business_email,
      business_email: details.business_email,
      industry: details.industry,
      companySize: details.company_size,
      company_size: details.company_size,
      websiteUrl: details.website_url,
      website_url: details.website_url,
      billingCountry: details.billing_country,
      billing_country: details.billing_country,
    } : null,
  };
}

/**
 * GET /api/user/profile
 * Returns the currently authenticated user's full profile
 */
export async function GET() {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const profile = await getFullUserProfile(session.userId, { allowSelfHealing: true });
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: formatProfileResponse(profile),
    });
  } catch (error: any) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve user profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Updates the currently authenticated user's profile details.
 * Prevents account_type changes, privilege escalation, or cross-user writes.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      fullName,
      avatarUrl,
      headline,
      bio,
      location,
      yearsExperience,
      hourlyRate,
      portfolioUrl,
      skills,
      availability,
      companyName,
      contactName,
      industry,
      companySize,
      websiteUrl,
      billingCountry,
    } = body;

    // Security Check: Attempting to modify account_type, status, or admin roles is rejected
    if (body.account_type || body.accountType || body.role || body.is_admin || body.status) {
      return NextResponse.json(
        { success: false, error: "Security Violation: Account type, status, and administrative roles cannot be altered." },
        { status: 403 }
      );
    }

    const db = getDb();

    // 1. Update base user_profiles
    if (fullName || avatarUrl !== undefined) {
      await db.prepare(`
        UPDATE public.user_profiles
        SET full_name = COALESCE(?, full_name),
            avatar_url = COALESCE(?, avatar_url),
            updated_at = NOW()
        WHERE id = ?
      `).run(fullName ? String(fullName).trim() : null, avatarUrl !== undefined ? String(avatarUrl).trim() : null, session.userId);
    }

    // 2. Update specialized profile based on verified session accountType
    if (session.accountType === "talent") {
      await db.prepare(`
        UPDATE public.talent_profiles
        SET headline = COALESCE(?, headline),
            bio = COALESCE(?, bio),
            location = COALESCE(?, location),
            years_experience = COALESCE(?, years_experience),
            hourly_rate = COALESCE(?, hourly_rate),
            portfolio_url = COALESCE(?, portfolio_url),
            skills = COALESCE(?::jsonb, skills),
            availability = COALESCE(?, availability),
            updated_at = NOW()
        WHERE user_id = ?
      `).run(
        headline !== undefined ? String(headline).trim() : null,
        bio !== undefined ? String(bio).trim() : null,
        location !== undefined ? String(location).trim() : null,
        yearsExperience !== undefined ? Number(yearsExperience) : null,
        hourlyRate !== undefined ? String(hourlyRate).trim() : null,
        portfolioUrl !== undefined ? String(portfolioUrl).trim() : null,
        skills !== undefined ? JSON.stringify(skills) : null,
        availability !== undefined ? String(availability).trim() : null,
        session.userId
      );
    } else if (session.accountType === "company") {
      await db.prepare(`
        UPDATE public.company_profiles
        SET company_name = COALESCE(?, company_name),
            contact_name = COALESCE(?, contact_name),
            industry = COALESCE(?, industry),
            company_size = COALESCE(?, company_size),
            website_url = COALESCE(?, website_url),
            billing_country = COALESCE(?, billing_country),
            updated_at = NOW()
        WHERE user_id = ?
      `).run(
        companyName !== undefined ? String(companyName).trim() : null,
        contactName !== undefined ? String(contactName).trim() : null,
        industry !== undefined ? String(industry).trim() : null,
        companySize !== undefined ? String(companySize).trim() : null,
        websiteUrl !== undefined ? String(websiteUrl).trim() : null,
        billingCountry !== undefined ? String(billingCountry).trim() : null,
        session.userId
      );
    }

    const updatedProfile = await getFullUserProfile(session.userId);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: formatProfileResponse(updatedProfile),
    });
  } catch (error: any) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
