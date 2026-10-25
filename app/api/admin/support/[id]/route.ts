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

    const ticket = db.prepare(`
      SELECT 
        st.id, st.ticket_ref, st.client_id, st.customer_name, st.customer_email,
        st.category, st.subject, st.description, st.priority, st.status,
        st.assigned_user_id, st.resolved_at, st.resolution_notes, st.created_at, st.updated_at,
        c.name as client_name,
        u.full_name as assigned_user_name
      FROM support_tickets st
      LEFT JOIN clients c ON st.client_id = c.id
      LEFT JOIN admin_users u ON st.assigned_user_id = u.id
      WHERE st.id = ? OR st.ticket_ref = ?
    `).get(id, id);

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    const responses = db.prepare(`
      SELECT 
        tr.id, tr.ticket_id, tr.user_id, tr.message, tr.is_internal_note, tr.created_at,
        u.full_name as user_name, u.role as user_role
      FROM ticket_responses tr
      JOIN admin_users u ON tr.user_id = u.id
      WHERE tr.ticket_id = ?
      ORDER BY tr.created_at ASC
    `).all((ticket as any).id);

    return NextResponse.json({
      success: true,
      ticket,
      responses,
    });
  } catch (error) {
    console.error("Ticket detail error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch ticket" }, { status: 500 });
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

    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT * FROM support_tickets WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    const newStatus = String(body.status !== undefined ? body.status : existing.status);
    const newPriority = String(body.priority !== undefined ? body.priority : existing.priority);
    const newAssignedUserId = body.assignedUserId !== undefined ? (body.assignedUserId ? String(body.assignedUserId) : null) : (existing.assigned_user_id ? String(existing.assigned_user_id) : null);
    const resolutionNotes = body.resolutionNotes !== undefined ? (body.resolutionNotes ? String(body.resolutionNotes) : null) : (existing.resolution_notes ? String(existing.resolution_notes) : null);

    const resolvedAt = newStatus === "resolved" && existing.status !== "resolved"
      ? now
      : newStatus !== "resolved"
      ? null
      : existing.resolved_at ? String(existing.resolved_at) : null;

    db.prepare(`
      UPDATE support_tickets SET
        status = ?,
        priority = ?,
        assigned_user_id = ?,
        resolution_notes = ?,
        resolved_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(newStatus, newPriority, newAssignedUserId, resolutionNotes, resolvedAt, now, id);

    recordAuditLog({
      actor: user,
      action: "TICKET_UPDATED",
      entityType: "support_ticket",
      entityId: id,
      changeSummary: `Updated ticket ${existing.ticket_ref}: status=${newStatus}, priority=${newPriority}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Ticket updated successfully." });
  } catch (error) {
    console.error("Ticket PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update ticket" }, { status: 500 });
  }
}
