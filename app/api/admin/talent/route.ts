import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/talent
 * Returns a paginated, searchable, filterable list of creative talent specialists
 * with specialized profile data, portfolio status, and proposal counts.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("users.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const skill = searchParams.get("skill")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const isVerified = searchParams.get("isVerified")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const availability = searchParams.get("availability")?.trim() || "";
    const minExp = searchParams.get("minExp");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ["u.account_type = 'talent'"];
    const params: any[] = [];

    if (search) {
      whereClauses.push("(u.full_name ILIKE ? OR u.email ILIKE ? OR t.headline ILIKE ? OR t.location ILIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (skill) {
      whereClauses.push("t.skills::text ILIKE ?");
      params.push(`%${skill}%`);
    }

    if (location) {
      whereClauses.push("t.location ILIKE ?");
      params.push(`%${location}%`);
    }

    if (isVerified === "true" || isVerified === "false") {
      whereClauses.push("u.is_verified = ?");
      params.push(isVerified === "true");
    }

    if (status && ["active", "suspended", "deactivated"].includes(status)) {
      whereClauses.push("u.status = ?");
      params.push(status);
    }

    if (availability) {
      whereClauses.push("t.availability ILIKE ?");
      params.push(`%${availability}%`);
    }

    if (minExp && !isNaN(Number(minExp))) {
      whereClauses.push("t.years_experience >= ?");
      params.push(Number(minExp));
    }

    const whereSql = whereClauses.join(" AND ");

    // 1. Fetch filtered talent
    const query = `
      SELECT 
        u.id, u.email, u.full_name, u.avatar_url, u.is_verified, u.status, u.created_at,
        t.headline, t.bio, t.location, t.years_experience, t.hourly_rate, t.skills, t.availability, t.portfolio_url,
        (SELECT count(*) FROM project_applications a WHERE a.talent_user_id = u.id) as applications_count,
        (SELECT count(*) FROM user_shortlists s WHERE s.talent_profile_id = u.id) as shortlisted_count
      FROM user_profiles u
      JOIN talent_profiles t ON u.id = t.user_id
      WHERE ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const talent = (await db.prepare(query).all(...params, limit, offset)) as any[];

    // 2. Fetch total count
    const countQuery = `
      SELECT count(*) as count
      FROM user_profiles u
      JOIN talent_profiles t ON u.id = t.user_id
      WHERE ${whereSql}
    `;
    const countRow = (await db.prepare(countQuery).get(...params)) as { count?: string | number } | undefined;
    const total = Number(countRow?.count || 0);

    // 3. Compute talent-specific aggregate metrics
    const statsQuery = `
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE u.is_verified = TRUE) as verified_count,
        count(*) FILTER (WHERE u.status = 'active') as active_count,
        count(*) FILTER (WHERE u.status = 'suspended') as suspended_count,
        count(*) FILTER (WHERE t.headline IS NOT NULL AND t.headline != '') as completed_profiles
      FROM user_profiles u
      JOIN talent_profiles t ON u.id = t.user_id
      WHERE u.account_type = 'talent'
    `;
    const statsRow = (await db.prepare(statsQuery).get()) as any;

    const metrics = {
      total: Number(statsRow?.total || 0),
      verified: Number(statsRow?.verified_count || 0),
      active: Number(statsRow?.active_count || 0),
      suspended: Number(statsRow?.suspended_count || 0),
      completedProfiles: Number(statsRow?.completed_profiles || 0),
    };

    return NextResponse.json({
      success: true,
      talent,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      metrics,
    });
  } catch (error: any) {
    console.error("GET /api/admin/talent error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve talent specialists" },
      { status: 500 }
    );
  }
}
