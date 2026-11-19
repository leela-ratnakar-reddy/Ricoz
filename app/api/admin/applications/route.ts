import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/applications
 * Returns a paginated, searchable, filterable list of project applications / proposals
 * joined with project brief attributes and talent applicant details.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("tasks.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const projectId = searchParams.get("projectId")?.trim() || "";
    const talentUserId = searchParams.get("talentUserId")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ["1=1"];
    const params: any[] = [];

    if (search) {
      whereClauses.push("(cp.title ILIKE ? OR cp.company_name ILIKE ? OR u.full_name ILIKE ? OR u.email ILIKE ? OR pa.pitch ILIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    if (status) {
      whereClauses.push("pa.status ILIKE ?");
      params.push(status);
    }

    if (projectId) {
      whereClauses.push("pa.project_id = ?");
      params.push(projectId);
    }

    if (talentUserId) {
      whereClauses.push("pa.talent_user_id = ?");
      params.push(talentUserId);
    }

    const whereSql = whereClauses.join(" AND ");

    // 1. Fetch applications
    const query = `
      SELECT 
        pa.id, pa.project_id, pa.talent_user_id, pa.pitch, pa.proposed_rate, pa.status, pa.created_at, pa.updated_at,
        cp.title as project_title, cp.company_name, cp.industry as project_industry, cp.budget_tier, cp.status as project_status,
        u.email as talent_email, u.full_name as talent_name, u.avatar_url as talent_avatar, u.is_verified as talent_verified,
        tp.headline as talent_headline, tp.location as talent_location, tp.hourly_rate as talent_profile_rate,
        tp.portfolio_url as talent_portfolio
      FROM project_applications pa
      LEFT JOIN client_projects cp ON pa.project_id = cp.id
      LEFT JOIN user_profiles u ON pa.talent_user_id = u.id
      LEFT JOIN talent_profiles tp ON pa.talent_user_id = tp.user_id
      WHERE ${whereSql}
      ORDER BY pa.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const applications = (await db.prepare(query).all(...params, limit, offset)) as any[];

    // 2. Fetch total count
    const countQuery = `
      SELECT count(*) as count
      FROM project_applications pa
      LEFT JOIN client_projects cp ON pa.project_id = cp.id
      LEFT JOIN user_profiles u ON pa.talent_user_id = u.id
      WHERE ${whereSql}
    `;
    const countRow = (await db.prepare(countQuery).get(...params)) as { count?: string | number } | undefined;
    const total = Number(countRow?.count || 0);

    // 3. Compute application status metrics
    const statsQuery = `
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE status ILIKE 'pending') as pending_count,
        count(*) FILTER (WHERE status ILIKE 'reviewed') as reviewed_count,
        count(*) FILTER (WHERE status ILIKE 'shortlisted') as shortlisted_count,
        count(*) FILTER (WHERE status ILIKE 'accepted') as accepted_count,
        count(*) FILTER (WHERE status ILIKE 'declined') as declined_count,
        round(COALESCE(avg(proposed_rate), 0), 2) as avg_proposed_rate
      FROM project_applications
    `;
    const statsRow = (await db.prepare(statsQuery).get()) as any;

    const metrics = {
      total: Number(statsRow?.total || 0),
      pending: Number(statsRow?.pending_count || 0),
      reviewed: Number(statsRow?.reviewed_count || 0),
      shortlisted: Number(statsRow?.shortlisted_count || 0),
      accepted: Number(statsRow?.accepted_count || 0),
      declined: Number(statsRow?.declined_count || 0),
      avgProposedRate: Number(statsRow?.avg_proposed_rate || 0),
    };

    return NextResponse.json({
      success: true,
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      metrics,
    });
  } catch (error: any) {
    console.error("GET /api/admin/applications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve project applications" },
      { status: 500 }
    );
  }
}
