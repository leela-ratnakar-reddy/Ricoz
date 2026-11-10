import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("support.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let query = `
      SELECT 
        st.id, st.ticket_ref, st.client_id, st.customer_name, st.customer_email,
        st.category, st.subject, st.description, st.priority, st.status,
        st.assigned_user_id, st.resolved_at, st.resolution_notes, st.created_at, st.updated_at,
        c.name as client_name,
        u.full_name as assigned_user_name,
        (SELECT count(*) FROM ticket_responses tr WHERE tr.ticket_id = st.id) as responses_count
      FROM support_tickets st
      LEFT JOIN clients c ON st.client_id = c.id
      LEFT JOIN admin_users u ON st.assigned_user_id = u.id
      WHERE 1=1
    `;

    const params: (string | number | null)[] = [];

    if (status) {
      query += " AND st.status = ?";
      params.push(status);
    }

    if (priority) {
      query += " AND st.priority = ?";
      params.push(priority);
    }

    if (category) {
      query += " AND st.category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (LOWER(st.ticket_ref) LIKE ? OR LOWER(st.subject) LIKE ? OR LOWER(st.customer_name) LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY 
      CASE st.priority 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        ELSE 4 
      END, 
      st.created_at DESC`;

    const tickets = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Support tickets GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("support.create", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const body = await req.json();
    const { clientId, customerName, customerEmail, category, subject, description, priority, assignedUserId } = body;

    if (!customerName || !customerEmail || !category || !subject || !description) {
      return NextResponse.json({ success: false, error: "Customer name, email, category, subject, and description are required." }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();
    const ticketId = `tkt-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

    // Generate unique sequential reference
    const countRow = db.prepare("SELECT count(*) as count FROM support_tickets").get() as { count: number };
    const nextNum = (countRow?.count || 0) + 1;
    const ticketRef = `REF-2026-${String(nextNum).padStart(3, "0")}`;

    db.prepare(`
      INSERT INTO support_tickets (
        id, ticket_ref, client_id, customer_name, customer_email, category,
        subject, description, priority, status, assigned_user_id,
        resolved_at, resolution_notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, NULL, NULL, ?, ?)
    `).run(
      ticketId,
      ticketRef,
      clientId || null,
      customerName.trim(),
      customerEmail.trim(),
      category,
      subject.trim(),
      description.trim(),
      priority || "medium",
      assignedUserId || user.id,
      now,
      now
    );

    recordAuditLog({
      actor: user,
      action: "TICKET_CREATED",
      entityType: "support_ticket",
      entityId: ticketId,
      changeSummary: `Created ticket ${ticketRef}: "${subject}" (${priority})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    if (priority === "critical") {
      // Trigger notification for Ops Lead
      const opsAdmin = db.prepare("SELECT id FROM admin_users WHERE role = 'ops_admin' LIMIT 1").get() as { id: string } | undefined;
      if (opsAdmin) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
          VALUES (?, ?, 'Critical Support Incident', ?, 'ticket_escalated', ?, 0, ?)
        `).run(
          `ntf-${Date.now()}`,
          opsAdmin.id,
          `Critical Ticket ${ticketRef} reported: "${subject}"`,
          `/admin/support?ref=${ticketRef}`,
          now
        );
      }
    }

    return NextResponse.json({ success: true, ticketId, ticketRef, message: "Ticket opened successfully." });
  } catch (error) {
    console.error("Support ticket POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to open ticket" }, { status: 500 });
  }
}
