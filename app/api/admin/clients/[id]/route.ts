import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest, hasPermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const client = db.prepare(`
      SELECT 
        c.id, c.name, c.industry, c.contact_name, c.contact_email, c.phone, c.company_size,
        c.onboarding_stage, c.assigned_owner_id, c.notes, c.next_follow_up, c.created_at, c.updated_at,
        u.full_name as assigned_owner_name
      FROM clients c
      LEFT JOIN admin_users u ON c.assigned_owner_id = u.id
      WHERE c.id = ?
    `).get(id);

    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const checklist = db.prepare(`
      SELECT 
        coi.id, coi.client_id, coi.title, coi.category, coi.is_completed, coi.completed_at,
        u.full_name as completed_by_user_name
      FROM client_onboarding_items coi
      LEFT JOIN admin_users u ON coi.completed_by_user_id = u.id
      WHERE coi.client_id = ?
      ORDER BY coi.category ASC
    `).all(id);

    return NextResponse.json({
      success: true,
      client,
      checklist,
    });
  } catch (error) {
    console.error("Client detail GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch client details" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    if (!hasPermission(user.role, "edit_clients")) {
      return NextResponse.json({ success: false, error: "Permission denied." }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT * FROM clients WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    const stage = body.onboardingStage !== undefined ? body.onboardingStage : existing.onboarding_stage;
    const notes = body.notes !== undefined ? body.notes : existing.notes;
    const assignedOwnerId = body.assignedOwnerId !== undefined ? body.assignedOwnerId : existing.assigned_owner_id;
    const nextFollowUp = body.nextFollowUp !== undefined ? body.nextFollowUp : existing.next_follow_up;
    const phone = body.phone !== undefined ? body.phone : existing.phone;
    const contactName = body.contactName !== undefined ? body.contactName : existing.contact_name;
    const contactEmail = body.contactEmail !== undefined ? body.contactEmail : existing.contact_email;

    db.prepare(`
      UPDATE clients SET
        onboarding_stage = ?,
        notes = ?,
        assigned_owner_id = ?,
        next_follow_up = ?,
        phone = ?,
        contact_name = ?,
        contact_email = ?,
        updated_at = ?
      WHERE id = ?
    `).run(stage, notes, assignedOwnerId, nextFollowUp, phone, contactName, contactEmail, now, id);

    // If checklist item toggle was sent
    if (body.toggleChecklistId !== undefined) {
      const isCompleted = body.isCompleted ? 1 : 0;
      db.prepare(`
        UPDATE client_onboarding_items SET
          is_completed = ?,
          completed_at = ?,
          completed_by_user_id = ?
        WHERE id = ? AND client_id = ?
      `).run(
        isCompleted,
        isCompleted ? now : null,
        isCompleted ? user.id : null,
        body.toggleChecklistId,
        id
      );
    }

    recordAuditLog({
      actor: user,
      action: "CLIENT_UPDATED",
      entityType: "client",
      entityId: id,
      changeSummary: `Updated client ${existing.name}: stage=${stage}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Client updated successfully." });
  } catch (error) {
    console.error("Client PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update client" }, { status: 500 });
  }
}
