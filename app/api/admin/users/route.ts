import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Returns a paginated, searchable, filterable list of public platform users (talent & companies)
 * with associated profile and mandate statistics.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("users.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const accountType = searchParams.get("accountType")?.trim() || "";
    const isVerified = searchParams.get("isVerified")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    // Build WHERE clauses
    const whereClauses: string[] = ["1=1"];
    const params: any[] = [];

    if (search) {
      whereClauses.push("(u.full_name ILIKE ? OR u.email ILIKE ? OR c.company_name ILIKE ? OR t.headline ILIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (accountType && (accountType === "talent" || accountType === "company")) {
      whereClauses.push("u.account_type = ?");
      params.push(accountType);
    }

    if (isVerified === "true" || isVerified === "false") {
      whereClauses.push("u.is_verified = ?");
      params.push(isVerified === "true");
    }

    if (status && ["active", "suspended", "deactivated"].includes(status)) {
      whereClauses.push("u.status = ?");
      params.push(status);
    }

    const whereSql = whereClauses.join(" AND ");

    // 1. Fetch filtered users
    const query = `
      SELECT 
        u.id, u.email, u.full_name, u.account_type, u.avatar_url, u.is_verified, u.status, u.created_at,
        t.headline, t.location as talent_location, t.hourly_rate, t.availability,
        c.company_name, c.industry, c.company_size,
        (SELECT count(*) FROM client_projects cp WHERE cp.company_user_id = u.id) as project_count,
        (SELECT count(*) FROM project_applications pa WHERE pa.talent_user_id = u.id) as application_count
      FROM user_profiles u
      LEFT JOIN talent_profiles t ON u.id = t.user_id AND u.account_type = 'talent'
      LEFT JOIN company_profiles c ON u.id = c.user_id AND u.account_type = 'company'
      WHERE ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const users = (await db.prepare(query).all(...params, limit, offset)) as any[];

    // 2. Fetch total count for pagination
    const countQuery = `
      SELECT count(*) as count
      FROM user_profiles u
      LEFT JOIN talent_profiles t ON u.id = t.user_id AND u.account_type = 'talent'
      LEFT JOIN company_profiles c ON u.id = c.user_id AND u.account_type = 'company'
      WHERE ${whereSql}
    `;
    const countRow = (await db.prepare(countQuery).get(...params)) as { count?: string | number } | undefined;
    const total = Number(countRow?.count || 0);

    // 3. Compute high-level platform user statistics
    const statsQuery = `
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE account_type = 'talent') as talent_count,
        count(*) FILTER (WHERE account_type = 'company') as company_count,
        count(*) FILTER (WHERE is_verified = TRUE) as verified_count,
        count(*) FILTER (WHERE is_verified = FALSE) as unverified_count,
        count(*) FILTER (WHERE status = 'active') as active_count,
        count(*) FILTER (WHERE status = 'suspended') as suspended_count,
        count(*) FILTER (WHERE status = 'deactivated') as deactivated_count
      FROM user_profiles
    `;
    const statsRow = (await db.prepare(statsQuery).get()) as any;

    const metrics = {
      total: Number(statsRow?.total || 0),
      talent: Number(statsRow?.talent_count || 0),
      company: Number(statsRow?.company_count || 0),
      verified: Number(statsRow?.verified_count || 0),
      pendingVerification: Number(statsRow?.unverified_count || 0),
      active: Number(statsRow?.active_count || 0),
      suspended: Number(statsRow?.suspended_count || 0),
      deactivated: Number(statsRow?.deactivated_count || 0),
    };

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      metrics,
    });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve platform users" },
      { status: 500 }
    );
  }
}
