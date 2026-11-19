import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserSession, getFullUserProfile } from "@/lib/auth/userAuth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUserSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const isOwnProfile = session.userId === id;
    // Client-supplied IDs must NEVER create or modify another user's profile records
    const requestedProfile = await getFullUserProfile(id, { allowSelfHealing: isOwnProfile });
    if (!requestedProfile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Cross-Account Privacy Enforcement:
    // 1. If accessing own profile, return full profile details
    if (isOwnProfile) {
      return NextResponse.json({
        success: true,
        profile: requestedProfile,
      });
    }

    // 2. If target profile is a COMPANY:
    // Only the company owner (or admin) can access company-only profile data.
    // Other companies and talent users are forbidden from viewing company internal records.
    if (requestedProfile.account_type === "company") {
      return NextResponse.json(
        {
          success: false,
          error: "Access Denied: You do not have permission to view this enterprise company profile.",
        },
        { status: 403 }
      );
    }

    // 3. If target profile is a TALENT:
    // If a company is browsing talent, return public portfolio fields only, redacting private contact info.
    // If another talent is trying to inspect private talent records, redact private fields.
    const publicTalentView = {
      id: requestedProfile.id,
      account_type: requestedProfile.account_type,
      accountType: requestedProfile.account_type,
      full_name: requestedProfile.full_name,
      fullName: requestedProfile.full_name,
      avatar_url: requestedProfile.avatar_url,
      avatarUrl: requestedProfile.avatar_url,
      is_verified: requestedProfile.is_verified,
      isVerified: requestedProfile.is_verified,
      details: {
        headline: requestedProfile.details?.headline,
        bio: requestedProfile.details?.bio,
        location: requestedProfile.details?.location,
        years_experience: requestedProfile.details?.years_experience,
        yearsExperience: requestedProfile.details?.years_experience,
        skills: requestedProfile.details?.skills,
        availability: requestedProfile.details?.availability,
      },
      talentProfile: {
        headline: requestedProfile.details?.headline,
        bio: requestedProfile.details?.bio,
        location: requestedProfile.details?.location,
        years_experience: requestedProfile.details?.years_experience,
        yearsExperience: requestedProfile.details?.years_experience,
        skills: requestedProfile.details?.skills,
        availability: requestedProfile.details?.availability,
      },
    };

    return NextResponse.json({
      success: true,
      profile: publicTalentView,
    });
  } catch (error: any) {
    console.error("GET /api/user/profile/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve profile." },
      { status: 500 }
    );
  }
}
