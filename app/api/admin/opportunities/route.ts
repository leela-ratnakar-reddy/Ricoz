import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/opportunities
 * Returns a paginated, searchable, filterable list of client project mandates / opportunities
 * with applicant counts and company profile information.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("tasks.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const budgetTier = searchParams.get("budgetTier")?.trim() || "";
    const companyId = searchParams.get("companyId")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ["1=1"];
    const params: any[] = [];

    if (search) {
      whereClauses.push("(cp.title ILIKE ? OR cp.company_name ILIKE ? OR cp.industry ILIKE ? OR cp.project_brief ILIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status) {
      whereClauses.push("cp.status ILIKE ?");
      params.push(status);
    }

    if (budgetTier) {
      whereClauses.push("cp.budget_tier ILIKE ?");
      params.push(budgetTier);
    }

    if (companyId) {
      whereClauses.push("cp.company_user_id = ?");
      params.push(companyId);
    }

    const whereSql = whereClauses.join(" AND ");

    // 1. Fetch filtered opportunities
    const query = `
      SELECT 
        cp.id, cp.company_user_id, cp.title, cp.company_name, cp.industry, cp.status,
        cp.timeline, cp.start_date, cp.budget_range, cp.budget_tier,
        cp.rebranding_goals, cp.target_audience, cp.brand_personality,
        cp.required_services, cp.preferred_styles, cp.availability_requirement,
        cp.project_brief, cp.created_at, cp.updated_at,
        u.email as company_email, u.full_name as company_owner_name,
        c.website_url, c.company_size,
        (SELECT count(*) FROM project_applications pa WHERE pa.project_id = cp.id) as applications_count,
        (SELECT count(*) FROM project_applications pa WHERE pa.project_id = cp.id AND pa.status = 'accepted') as accepted_count
      FROM client_projects cp
      LEFT JOIN user_profiles u ON cp.company_user_id = u.id
      LEFT JOIN company_profiles c ON cp.company_user_id = c.user_id
      WHERE ${whereSql}
      ORDER BY cp.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const opportunities = (await db.prepare(query).all(...params, limit, offset)) as any[];

    // 2. Fetch total count
    const countQuery = `
      SELECT count(*) as count
      FROM client_projects cp
      WHERE ${whereSql}
    `;
    const countRow = (await db.prepare(countQuery).get(...params)) as { count?: string | number } | undefined;
    const total = Number(countRow?.count || 0);

    // 3. Compute opportunity metrics
    const statsQuery = `
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE status ILIKE 'discovery') as discovery_count,
        count(*) FILTER (WHERE status ILIKE 'matching') as matching_count,
        count(*) FILTER (WHERE status ILIKE 'active') as active_count,
        count(*) FILTER (WHERE status ILIKE 'closed') as closed_count,
        (SELECT count(*) FROM project_applications) as total_applications
      FROM client_projects
    `;
    const statsRow = (await db.prepare(statsQuery).get()) as any;

    const metrics = {
      total: Number(statsRow?.total || 0),
      discovery: Number(statsRow?.discovery_count || 0),
      matching: Number(statsRow?.matching_count || 0),
      active: Number(statsRow?.active_count || 0),
      closed: Number(statsRow?.closed_count || 0),
      totalApplications: Number(statsRow?.total_applications || 0),
    };

    return NextResponse.json({
      success: true,
      opportunities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      metrics,
    });
  } catch (error: any) {
    console.error("GET /api/admin/opportunities error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve platform opportunities" },
      { status: 500 }
    );
  }
}
