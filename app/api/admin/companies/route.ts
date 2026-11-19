import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/companies
 * Returns a paginated, searchable, filterable list of enterprise client accounts
 * with profile attributes, posted opportunities count, and proposal statistics.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("users.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const industry = searchParams.get("industry")?.trim() || "";
    const companySize = searchParams.get("companySize")?.trim() || "";
    const isVerified = searchParams.get("isVerified")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ["u.account_type = 'company'"];
    const params: any[] = [];

    if (search) {
      whereClauses.push("(u.full_name ILIKE ? OR u.email ILIKE ? OR c.company_name ILIKE ? OR c.contact_name ILIKE ? OR c.business_email ILIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    if (industry) {
      whereClauses.push("c.industry ILIKE ?");
      params.push(`%${industry}%`);
    }

    if (companySize) {
      whereClauses.push("c.company_size ILIKE ?");
      params.push(`%${companySize}%`);
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

    // 1. Fetch filtered companies
    const query = `
      SELECT 
        u.id, u.email, u.full_name, u.avatar_url, u.is_verified, u.status, u.created_at,
        c.id as company_profile_id, c.company_name, c.contact_name, c.business_email,
        c.industry, c.company_size, c.website_url, c.billing_country,
        (SELECT count(*) FROM client_projects cp WHERE cp.company_user_id = u.id) as projects_count,
        (SELECT count(*) FROM project_applications pa JOIN client_projects cp2 ON pa.project_id = cp2.id WHERE cp2.company_user_id = u.id) as received_applications_count
      FROM user_profiles u
      LEFT JOIN company_profiles c ON u.id = c.user_id
      WHERE ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const companies = (await db.prepare(query).all(...params, limit, offset)) as any[];

    // 2. Fetch total count
    const countQuery = `
      SELECT count(*) as count
      FROM user_profiles u
      LEFT JOIN company_profiles c ON u.id = c.user_id
      WHERE ${whereSql}
    `;
    const countRow = (await db.prepare(countQuery).get(...params)) as { count?: string | number } | undefined;
    const total = Number(countRow?.count || 0);

    // 3. Compute company aggregate metrics
    const statsQuery = `
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE u.is_verified = TRUE) as verified_count,
        count(*) FILTER (WHERE u.status = 'active') as active_count,
        count(*) FILTER (WHERE u.status = 'suspended') as suspended_count,
        count(DISTINCT cp.company_user_id) as companies_with_projects
      FROM user_profiles u
      LEFT JOIN client_projects cp ON u.id = cp.company_user_id
      WHERE u.account_type = 'company'
    `;
    const statsRow = (await db.prepare(statsQuery).get()) as any;

    const metrics = {
      total: Number(statsRow?.total || 0),
      verified: Number(statsRow?.verified_count || 0),
      active: Number(statsRow?.active_count || 0),
      suspended: Number(statsRow?.suspended_count || 0),
      companiesWithProjects: Number(statsRow?.companies_with_projects || 0),
    };

    return NextResponse.json({
      success: true,
      companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      metrics,
    });
  } catch (error: any) {
    console.error("GET /api/admin/companies error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve enterprise companies" },
      { status: 500 }
    );
  }
}
