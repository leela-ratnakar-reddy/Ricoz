import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/incidents
 * Retrieves incidents and active platform emergency escalations.
 * Seamlessly integrates live task escalations and dedicated incident records.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("tasks.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();

    // Check if dedicated admin_incidents table exists in PostgreSQL
    const tableCheck = await db.prepare(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admin_incidents'
      ) as exists;
    `).get() as { exists: boolean } | null;

    const tableExists = Boolean(tableCheck?.exists);
    let incidents: any[] = [];

    if (tableExists) {
      incidents = await db.prepare(`
        SELECT 
          i.id, i.incident_ref, i.title, i.description, i.severity, i.category,
          i.status, i.assigned_admin_id, i.resolution_notes, i.resolved_at,
          i.created_at, i.updated_at,
          u.full_name as assigned_admin_name
        FROM admin_incidents i
        LEFT JOIN admin_users u ON i.assigned_admin_id = u.id
        ORDER BY 
          CASE WHEN i.severity = 'critical' THEN 1 WHEN i.severity = 'high' THEN 2 ELSE 3 END,
          i.created_at DESC
      `).all() as any[];
    } else {
      // Query live platform escalations from tasks and critical support tickets
      const [escalatedTasks, criticalTickets] = await Promise.all([
        db.prepare(`
          SELECT 
            t.id, t.title, t.description, t.priority, t.status, t.blocker_note,
            t.due_date, t.created_at, t.updated_at,
            u.full_name as assignee_name
          FROM tasks t
          LEFT JOIN admin_users u ON t.assignee_id = u.id
          WHERE t.is_escalated = TRUE OR t.status = 'blocked'
          ORDER BY t.created_at DESC
        `).all() as Promise<any[]>,

        db.prepare(`
          SELECT 
            id, ticket_ref, customer_name, category, subject, description,
            priority, status, created_at, updated_at
          FROM support_tickets
          WHERE priority = 'critical' AND status != 'resolved' AND status != 'closed'
          ORDER BY created_at DESC
        `).all() as Promise<any[]>,
      ]);

      const taskIncidents = (await escalatedTasks).map((t: any) => ({
        id: t.id,
        incident_ref: `ESC-${t.id.slice(0, 6).toUpperCase()}`,
        title: t.title,
        description: t.blocker_note || t.description || "Task flagged with critical impediment.",
        severity: t.priority === "urgent" ? "critical" : "high",
        category: "platform_sla",
        status: t.status === "blocked" ? "investigating" : "in_progress",
        assigned_admin_name: t.assignee_name || "Unassigned",
        created_at: t.created_at,
        updated_at: t.updated_at,
        origin: "task",
      }));

      const ticketIncidents = (await criticalTickets).map((tk: any) => ({
        id: tk.id,
        incident_ref: tk.ticket_ref,
        title: `Support Escalation: ${tk.subject}`,
        description: tk.description,
        severity: "critical",
        category: tk.category === "billing" ? "billing" : "infrastructure",
        status: tk.status === "open" ? "open" : "investigating",
        assigned_admin_name: "Support Desk",
        created_at: tk.created_at,
        updated_at: tk.updated_at,
        origin: "ticket",
      }));

      incidents = [...taskIncidents, ...ticketIncidents];
    }

    const criticalCount = incidents.filter((i) => i.severity === "critical").length;
    const highCount = incidents.filter((i) => i.severity === "high").length;
    const mediumCount = incidents.filter((i) => i.severity === "medium").length;
    const lowCount = incidents.filter((i) => i.severity === "low").length;
    const openCount = incidents.filter((i) => i.status === "open" || i.status === "investigating" || i.status === "in_progress").length;
    const resolvedCount = incidents.filter((i) => i.status === "resolved" || i.status === "closed").length;

    return NextResponse.json({
      success: true,
      incidents,
      metrics: {
        total: incidents.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        open: openCount,
        resolved: resolvedCount,
      },
      tablePendingMigration: !tableExists,
      migrationScript: !tableExists ? "lib/admin/migrations/002_incident_war_room.sql" : undefined,
    });
  } catch (error: any) {
    console.error("GET /api/admin/incidents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load incident war room data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/incidents
 * Declares a new operational incident with audit logging.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("tasks.create", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const body = await req.json();
    const { title, description, severity, category, assigneeId } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if table exists
    const tableCheck = await db.prepare(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admin_incidents'
      ) as exists;
    `).get() as { exists: boolean } | null;

    const tableExists = Boolean(tableCheck?.exists);
    const incidentRef = `INC-${Date.now().toString(36).toUpperCase()}`;

    if (tableExists) {
      const res = await db.prepare(`
        INSERT INTO admin_incidents (
          incident_ref, title, description, severity, category, status, assigned_admin_id
        ) VALUES (?, ?, ?, ?, ?, 'open', ?)
        RETURNING id
      `).get(
        incidentRef,
        title.trim(),
        description.trim(),
        severity || "high",
        category || "platform_sla",
        assigneeId || null
      ) as { id: string };

      if (res?.id) {
        await db.prepare(`
          INSERT INTO admin_incident_updates (incident_id, admin_id, update_note, new_status)
          VALUES (?, ?, ?, 'open')
        `).run(res.id, user.id, `Incident declared by ${user.fullName}`);
      }
    } else {
      // Create escalated task in tasks table to guarantee persistence
      const dept = (await db.prepare("SELECT id FROM departments LIMIT 1").get()) as { id: string } | null;
      await db.prepare(`
        INSERT INTO tasks (
          title, description, department_id, assignee_id, creator_id,
          priority, status, blocker_note, is_escalated, due_date
        ) VALUES (?, ?, ?, ?, ?, 'urgent', 'blocked', ?, TRUE, CURRENT_DATE + INTERVAL '1 day')
      `).run(
        `[${incidentRef}] ${title.trim()}`,
        description.trim(),
        dept?.id || null,
        assigneeId || user.id,
        user.id,
        `INCIDENT: ${description.trim()}`
      );
    }

    // Immutable Audit Log entry
    await recordAuditLog({
      actor: user,
      action: "INCIDENT_DECLARED",
      entityType: "incident",
      entityId: incidentRef,
      changeSummary: `Declared ${severity?.toUpperCase() || "HIGH"} severity incident: "${title}" (${category})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: `Incident ${incidentRef} successfully declared and recorded.`,
      incidentRef,
    });
  } catch (error: any) {
    console.error("POST /api/admin/incidents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to declare incident" },
      { status: 500 }
    );
  }
}
