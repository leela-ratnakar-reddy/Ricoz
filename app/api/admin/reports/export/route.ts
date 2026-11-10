import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("reports.export", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "tasks";
    const db = getDb();
    let csvData = "";
    let fileName = `ricoz_export_${type}_${new Date().toISOString().split("T")[0]}.csv`;

    if (type === "tasks") {
      const rows = db.prepare(`
        SELECT 
          t.id, t.title, d.name as department, u.full_name as assignee,
          t.priority, t.status, t.due_date, t.completed_at, t.blocker_note, t.is_escalated, t.created_at
        FROM tasks t
        JOIN departments d ON t.department_id = d.id
        LEFT JOIN admin_users u ON t.assignee_id = u.id
        ORDER BY t.due_date ASC
      `).all() as Record<string, unknown>[];

      const headers = ["ID", "Title", "Department", "Assignee", "Priority", "Status", "DueDate", "CompletedAt", "Blocker", "Escalated", "CreatedAt"];
      csvData = headers.join(",") + "\n" + rows.map((r) => [
        escapeCSV(r.id),
        escapeCSV(r.title),
        escapeCSV(r.department),
        escapeCSV(r.assignee || "Unassigned"),
        escapeCSV(r.priority),
        escapeCSV(r.status),
        escapeCSV(r.due_date),
        escapeCSV(r.completed_at || ""),
        escapeCSV(r.blocker_note || ""),
        escapeCSV(r.is_escalated ? "Yes" : "No"),
        escapeCSV(r.created_at),
      ].join(",")).join("\n");
    } else if (type === "clients") {
      const rows = db.prepare(`
        SELECT 
          c.id, c.name, c.industry, c.contact_name, c.contact_email, c.phone,
          c.company_size, c.onboarding_stage, u.full_name as owner, c.next_follow_up, c.created_at
        FROM clients c
        LEFT JOIN admin_users u ON c.assigned_owner_id = u.id
        ORDER BY c.name ASC
      `).all() as Record<string, unknown>[];

      const headers = ["ID", "Company", "Industry", "ContactName", "ContactEmail", "Phone", "Size", "Stage", "AccountLead", "NextFollowUp", "CreatedAt"];
      csvData = headers.join(",") + "\n" + rows.map((r) => [
        escapeCSV(r.id),
        escapeCSV(r.name),
        escapeCSV(r.industry),
        escapeCSV(r.contact_name),
        escapeCSV(r.contact_email),
        escapeCSV(r.phone),
        escapeCSV(r.company_size),
        escapeCSV(r.onboarding_stage),
        escapeCSV(r.owner || "Unassigned"),
        escapeCSV(r.next_follow_up || ""),
        escapeCSV(r.created_at),
      ].join(",")).join("\n");
    } else if (type === "vendors") {
      const rows = db.prepare(`
        SELECT 
          v.id, v.name, v.service_category, v.contact_name, v.contact_email, v.phone,
          v.onboarding_stage, v.verification_status, u.full_name as coordinator, v.created_at
        FROM vendors v
        LEFT JOIN admin_users u ON v.assigned_coordinator_id = u.id
        ORDER BY v.name ASC
      `).all() as Record<string, unknown>[];

      const headers = ["ID", "VendorName", "Category", "ContactName", "ContactEmail", "Phone", "Stage", "VerificationStatus", "Coordinator", "CreatedAt"];
      csvData = headers.join(",") + "\n" + rows.map((r) => [
        escapeCSV(r.id),
        escapeCSV(r.name),
        escapeCSV(r.service_category),
        escapeCSV(r.contact_name),
        escapeCSV(r.contact_email),
        escapeCSV(r.phone),
        escapeCSV(r.onboarding_stage),
        escapeCSV(r.verification_status),
        escapeCSV(r.coordinator || "Unassigned"),
        escapeCSV(r.created_at),
      ].join(",")).join("\n");
    } else if (type === "tickets") {
      const rows = db.prepare(`
        SELECT 
          st.ticket_ref, c.name as client, st.customer_name, st.customer_email,
          st.category, st.priority, st.status, u.full_name as assignee, st.resolved_at, st.created_at
        FROM support_tickets st
        LEFT JOIN clients c ON st.client_id = c.id
        LEFT JOIN admin_users u ON st.assigned_user_id = u.id
        ORDER BY st.created_at DESC
      `).all() as Record<string, unknown>[];

      const headers = ["TicketRef", "Client", "CustomerName", "CustomerEmail", "Category", "Priority", "Status", "Assignee", "ResolvedAt", "CreatedAt"];
      csvData = headers.join(",") + "\n" + rows.map((r) => [
        escapeCSV(r.ticket_ref),
        escapeCSV(r.client || "Direct"),
        escapeCSV(r.customer_name),
        escapeCSV(r.customer_email),
        escapeCSV(r.category),
        escapeCSV(r.priority),
        escapeCSV(r.status),
        escapeCSV(r.assignee || "Unassigned"),
        escapeCSV(r.resolved_at || ""),
        escapeCSV(r.created_at),
      ].join(",")).join("\n");
    } else {
      return NextResponse.json({ success: false, error: "Invalid export type" }, { status: 400 });
    }

    recordAuditLog({
      actor: user,
      action: "DATA_EXPORTED_CSV",
      entityType: "reports",
      entityId: type,
      changeSummary: `Exported ${type} dataset as CSV`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return new Response(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Export CSV error:", error);
    return NextResponse.json({ success: false, error: "Failed to export CSV" }, { status: 500 });
  }
}
