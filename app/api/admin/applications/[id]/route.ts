import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/applications/[id]
 * Retrieves specific project proposal and application details.
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

    const application = (await db.prepare(`
      SELECT 
        pa.id, pa.project_id, pa.talent_user_id, pa.pitch, pa.proposed_rate, pa.status, pa.created_at, pa.updated_at,
        cp.title as project_title, cp.company_name, cp.industry as project_industry, cp.budget_tier, cp.budget_range,
        cp.timeline, cp.project_brief, cp.status as project_status,
        u.email as talent_email, u.full_name as talent_name, u.avatar_url as talent_avatar, u.is_verified as talent_verified,
        tp.headline as talent_headline, tp.location as talent_location, tp.portfolio_url as talent_portfolio,
        tp.years_experience as talent_experience, tp.skills as talent_skills
      FROM project_applications pa
      LEFT JOIN client_projects cp ON pa.project_id = cp.id
      LEFT JOIN user_profiles u ON pa.talent_user_id = u.id
      LEFT JOIN talent_profiles tp ON pa.talent_user_id = tp.user_id
      WHERE pa.id = ?
    `).get(id)) as any;

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application / proposal not found" },
        { status: 404 }
      );
    }

    // Parse skills if string
    let parsedSkills = application.talent_skills;
    if (typeof parsedSkills === "string") {
      try {
        parsedSkills = JSON.parse(parsedSkills);
      } catch {
        parsedSkills = [];
      }
    }

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        talent_skills: parsedSkills,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/applications/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve application details" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/applications/[id]
 * Updates application status:
 * - "pending"
 * - "reviewed"
 * - "shortlisted"
 * - "accepted"
 * - "declined"
 * Automatically writes to audit_logs and notifies talent user.
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
      SELECT 
        pa.id, pa.status, pa.talent_user_id, pa.project_id,
        cp.title as project_title,
        u.full_name as talent_name, u.email as talent_email
      FROM project_applications pa
      LEFT JOIN client_projects cp ON pa.project_id = cp.id
      LEFT JOIN user_profiles u ON pa.talent_user_id = u.id
      WHERE pa.id = ?
    `).get(id)) as any;

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    const updates: string[] = [];
    const paramsList: any[] = [];
    const changeSummaries: string[] = [];

    const allowedStatuses = ["pending", "reviewed", "shortlisted", "accepted", "declined"];

    if (body.status !== undefined) {
      const newStatus = String(body.status).toLowerCase().trim();
      if (!allowedStatuses.includes(newStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}` },
          { status: 400 }
        );
      }
      if (newStatus !== existing.status?.toLowerCase()) {
        updates.push("status = ?");
        paramsList.push(newStatus);
        changeSummaries.push(`Status changed from '${existing.status}' to '${newStatus}'`);
      }
    }

    if (body.proposed_rate !== undefined && !isNaN(Number(body.proposed_rate))) {
      const rate = Number(body.proposed_rate);
      updates.push("proposed_rate = ?");
      paramsList.push(rate);
      changeSummaries.push(`Proposed rate adjusted to $${rate}`);
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
      UPDATE project_applications
      SET ${updates.join(", ")}
      WHERE id = ?
    `).run(...paramsList);

    // Record audit log
    await recordAuditLog({
      actor: auth.user,
      action: "PLATFORM_APPLICATION_MODIFIED",
      entityType: "project_application",
      entityId: id,
      changeSummary: `Application for '${existing.project_title || "Mandate"}' by '${existing.talent_name}' updated: ${changeSummaries.join("; ")}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    // Notify the talent user
    try {
      const notifId = crypto.randomUUID();
      const newStatus = body.status ? String(body.status).toLowerCase().trim() : existing.status;
      let statusTitle = "Application Updated";
      let statusMsg = `Your application for '${existing.project_title || "a project"}' has been updated to ${newStatus}.`;

      if (newStatus === "accepted") {
        statusTitle = "Application Accepted!";
        statusMsg = `Congratulations! Your proposal for '${existing.project_title || "the project"}' has been accepted.`;
      } else if (newStatus === "shortlisted") {
        statusTitle = "Proposal Shortlisted";
        statusMsg = `Your proposal for '${existing.project_title || "the project"}' has been shortlisted by the evaluation team.`;
      } else if (newStatus === "declined") {
        statusTitle = "Application Status Update";
        statusMsg = `Your application for '${existing.project_title || "the project"}' was not selected at this time.`;
      }

      await db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())
      `).run(
        notifId,
        existing.talent_user_id,
        statusTitle,
        statusMsg,
        "application_status",
        "/talent/applications"
      );
    } catch (notifErr) {
      console.warn("Failed to generate notification for talent user:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
      changes: changeSummaries,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/applications/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}
