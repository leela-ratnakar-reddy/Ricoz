import { NextResponse } from "next/server";
import { getCurrentUserSession, getFullUserProfile } from "@/lib/auth/userAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUserSession();

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        profile: null,
        accountType: null,
      });
    }

    const profile = await getFullUserProfile(session.userId, { allowSelfHealing: true });

    const isTalent = profile?.account_type === "talent";
    const isCompany = profile?.account_type === "company";
    const details = profile?.details || {};

    const formattedProfile = profile
      ? {
          ...profile,
          fullName: profile.full_name,
          accountType: profile.account_type,
          avatarUrl: profile.avatar_url,
          isVerified: profile.is_verified,
          createdAt: profile.created_at,
          details,
          talentProfile: isTalent
            ? {
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
              }
            : null,
          companyProfile: isCompany
            ? {
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
              }
            : null,
        }
      : null;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        fullName: session.fullName,
        accountType: session.accountType,
      },
      profile: formattedProfile,
      accountType: session.accountType,
    });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      profile: null,
      accountType: null,
    });
  }
}
