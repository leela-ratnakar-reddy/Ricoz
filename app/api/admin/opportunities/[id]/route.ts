import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/opportunities/[id]
 * Retrieves opportunity brief details along with received proposals and applicants.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("tasks.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { id } = await params;
    const db = getDb();

    const opportunity = (await db.prepare(`
      SELECT 
        cp.*,
        u.email as company_email, u.full_name as company_owner_name,
        c.website_url, c.company_size, c.business_email
      FROM client_projects cp
      LEFT JOIN user_profiles u ON cp.company_user_id = u.id
      LEFT JOIN company_profiles c ON cp.company_user_id = c.user_id
      WHERE cp.id = ?
    `).get(id)) as any;

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: "Opportunity / project mandate not found" },
        { status: 404 }
      );
    }

    // Applications submitted for this opportunity
    const applications = (await db.prepare(`
      SELECT 
        pa.id, pa.project_id, pa.talent_user_id, pa.pitch, pa.proposed_rate, pa.status, pa.created_at, pa.updated_at,
        u.email as talent_email, u.full_name as talent_name, u.avatar_url as talent_avatar,
        t.headline as talent_headline, t.location as talent_location, t.hourly_rate as talent_rate, t.skills as talent_skills
      FROM project_applications pa
      LEFT JOIN user_profiles u ON pa.talent_user_id = u.id
      LEFT JOIN talent_profiles t ON pa.talent_user_id = t.user_id
      WHERE pa.project_id = ?
      ORDER BY pa.created_at DESC
    `).all(id)) as any[];

    return NextResponse.json({
      success: true,
      opportunity: {
        ...opportunity,
        applications,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/opportunities/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve opportunity details" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/opportunities/[id]
 * Updates opportunity status, timeline, or brief attributes.
 * Automatically writes to audit_logs.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("tasks.edit", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { id } = await params;
    const db = getDb();
    const body = await req.json();

    const existing = (await db.prepare(`
      SELECT id, title, status, budget_tier, timeline
      FROM client_projects
      WHERE id = ?
    `).get(id)) as any;

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found" },
        { status: 404 }
      );
    }

    const updates: string[] = [];
    const paramsList: any[] = [];
    const changeSummaries: string[] = [];

    if (body.status !== undefined) {
      const status = String(body.status).trim();
      if (status !== existing.status) {
        updates.push("status = ?");
        paramsList.push(status);
        changeSummaries.push(`Status changed from '${existing.status}' to '${status}'`);
      }
    }

    if (body.budget_tier !== undefined) {
      const tier = String(body.budget_tier).trim();
      if (tier !== existing.budget_tier) {
        updates.push("budget_tier = ?");
        paramsList.push(tier);
        changeSummaries.push(`Budget tier changed to '${tier}'`);
      }
    }

    if (body.timeline !== undefined) {
      const tl = String(body.timeline).trim();
      if (tl !== existing.timeline) {
        updates.push("timeline = ?");
        paramsList.push(tl);
        changeSummaries.push(`Timeline changed to '${tl}'`);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
      });
    }

    updates.push("updated_at = NOW()");
    paramsList.push(id);

    await db.prepare(`
      UPDATE client_projects
      SET ${updates.join(", ")}
      WHERE id = ?
    `).run(...paramsList);

    // Record audit log
    await recordAuditLog({
      actor: auth.user,
      action: "PLATFORM_OPPORTUNITY_MODIFIED",
      entityType: "client_project",
      entityId: id,
      changeSummary: `Opportunity '${existing.title}' updated: ${changeSummaries.join("; ")}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Opportunity updated successfully",
      changes: changeSummaries,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/opportunities/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update opportunity" },
      { status: 500 }
    );
  }
}
