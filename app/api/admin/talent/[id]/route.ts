import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/talent/[id]
 * Retrieves comprehensive profile, portfolio, applications, and shortlists for a specific talent user.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("users.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { id } = await params;
    const db = getDb();

    // Fetch user and talent profile
    const talent = (await db.prepare(`
      SELECT 
        u.id, u.email, u.full_name, u.account_type, u.avatar_url, u.is_verified, u.status, u.created_at, u.updated_at,
        t.id as talent_profile_id, t.headline, t.bio, t.location, t.years_experience, t.hourly_rate, 
        t.skills, t.availability, t.portfolio_url
      FROM user_profiles u
      LEFT JOIN talent_profiles t ON u.id = t.user_id
      WHERE u.id = ? AND u.account_type = 'talent'
    `).get(id)) as any;

    if (!talent) {
      return NextResponse.json(
        { success: false, error: "Creative talent specialist not found" },
        { status: 404 }
      );
    }

    // Parse skills if string
    let parsedSkills = talent.skills;
    if (typeof parsedSkills === "string") {
      try {
        parsedSkills = JSON.parse(parsedSkills);
      } catch {
        parsedSkills = [];
      }
    }

    // Applications submitted by this talent
    const applications = (await db.prepare(`
      SELECT 
        pa.id, pa.project_id, pa.pitch, pa.proposed_rate, pa.status, pa.created_at,
        cp.title as project_title, cp.company_name, cp.budget_range, cp.budget_tier
      FROM project_applications pa
      LEFT JOIN client_projects cp ON pa.project_id = cp.id
      WHERE pa.talent_user_id = ?
      ORDER BY pa.created_at DESC
      LIMIT 20
    `).all(id)) as any[];

    // Shortlist count
    const shortlistRow = (await db.prepare(`
      SELECT count(*) as count
      FROM user_shortlists
      WHERE talent_profile_id = ?
    `).get(id)) as { count?: string | number } | undefined;
    const shortlistedCount = Number(shortlistRow?.count || 0);

    return NextResponse.json({
      success: true,
      talent: {
        ...talent,
        skills: parsedSkills,
        applications,
        shortlistedCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/talent/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve talent specialist details" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/talent/[id]
 * Updates talent administrative attributes:
 * - status ("active", "suspended", "deactivated")
 * - is_verified (boolean)
 * - availability (string)
 * - hourly_rate (numeric)
 * Automatically writes to audit_logs.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("users.manage", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { id } = await params;
    const db = getDb();
    const body = await req.json();

    // Verify talent exists
    const existing = (await db.prepare(`
      SELECT u.id, u.email, u.full_name, u.status, u.is_verified,
             t.hourly_rate, t.availability
      FROM user_profiles u
      LEFT JOIN talent_profiles t ON u.id = t.user_id
      WHERE u.id = ? AND u.account_type = 'talent'
    `).get(id)) as any;

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Creative talent specialist not found" },
        { status: 404 }
      );
    }

    const updatesUser: string[] = [];
    const paramsUser: any[] = [];
    const changeSummaries: string[] = [];

    // 1. Status change
    if (body.status !== undefined) {
      if (!["active", "suspended", "deactivated"].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status value" },
          { status: 400 }
        );
      }
      if (body.status !== existing.status) {
        updatesUser.push("status = ?");
        paramsUser.push(body.status);
        changeSummaries.push(`Status changed from '${existing.status}' to '${body.status}'`);
      }
    }

    // 2. Verification change
    if (body.is_verified !== undefined) {
      const isVerified = Boolean(body.is_verified);
      if (isVerified !== existing.is_verified) {
        updatesUser.push("is_verified = ?");
        paramsUser.push(isVerified);
        changeSummaries.push(`Verification status set to ${isVerified ? "VERIFIED" : "UNVERIFIED"}`);
      }
    }

    if (updatesUser.length > 0) {
      updatesUser.push("updated_at = NOW()");
      paramsUser.push(id);
      await db.prepare(`
        UPDATE user_profiles
        SET ${updatesUser.join(", ")}
        WHERE id = ?
      `).run(...paramsUser);
    }

    // 3. Talent profile updates
    const updatesTalent: string[] = [];
    const paramsTalent: any[] = [];

    if (body.hourly_rate !== undefined && !isNaN(Number(body.hourly_rate))) {
      const rate = Number(body.hourly_rate);
      if (rate !== existing.hourly_rate) {
        updatesTalent.push("hourly_rate = ?");
        paramsTalent.push(rate);
        changeSummaries.push(`Hourly rate updated to $${rate}/hr`);
      }
    }

    if (body.availability !== undefined) {
      const avail = String(body.availability).trim();
      if (avail !== existing.availability) {
        updatesTalent.push("availability = ?");
        paramsTalent.push(avail);
        changeSummaries.push(`Availability updated to '${avail}'`);
      }
    }

    if (updatesTalent.length > 0) {
      updatesTalent.push("updated_at = NOW()");
      paramsTalent.push(id);
      await db.prepare(`
        UPDATE talent_profiles
        SET ${updatesTalent.join(", ")}
        WHERE user_id = ?
      `).run(...paramsTalent);
    }

    if (changeSummaries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
      });
    }

    // Record audit log
    await recordAuditLog({
      actor: auth.user,
      action: "PLATFORM_TALENT_MODIFIED",
      entityType: "talent_profile",
      entityId: id,
      changeSummary: `Talent specialist '${existing.full_name}' (${existing.email}) updated: ${changeSummaries.join("; ")}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Talent specialist updated successfully",
      changes: changeSummaries,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/talent/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update talent specialist" },
      { status: 500 }
    );
  }
}
