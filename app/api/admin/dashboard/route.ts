import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("dashboard.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const dateRange = searchParams.get("range") || "30d";

    const today = new Date().toISOString().split("T")[0];

    // Compute date cutoff
    let dateCutoff = "";
    if (dateRange === "7d") {
      dateCutoff = new Date(Date.now() - 7 * 86400000).toISOString();
    } else if (dateRange === "30d") {
      dateCutoff = new Date(Date.now() - 30 * 86400000).toISOString();
    } else if (dateRange === "90d") {
      dateCutoff = new Date(Date.now() - 90 * 86400000).toISOString();
    }

    // Base query constraints for department filter
    const deptTaskFilter = departmentId ? "AND department_id = ?" : "";
    const deptTaskParams = departmentId ? [departmentId] : [];

    // 1. Task Metrics
    const totalTasks = (db.prepare(`SELECT count(*) as count FROM tasks WHERE 1=1 ${deptTaskFilter}`).get(...deptTaskParams) as { count: number })?.count || 0;
    const completedTasks = (db.prepare(`SELECT count(*) as count FROM tasks WHERE status = 'completed' ${deptTaskFilter}`).get(...deptTaskParams) as { count: number })?.count || 0;
    const pendingTasks = (db.prepare(`SELECT count(*) as count FROM tasks WHERE status IN ('todo', 'in_progress', 'blocked', 'in_review') ${deptTaskFilter}`).get(...deptTaskParams) as { count: number })?.count || 0;
    
    const overdueTasks = (db.prepare(`
      SELECT count(*) as count FROM tasks 
      WHERE status != 'completed' AND due_date < ? ${deptTaskFilter}
    `).get(today, ...deptTaskParams) as { count: number })?.count || 0;

    const blockedTasks = (db.prepare(`SELECT count(*) as count FROM tasks WHERE status = 'blocked' ${deptTaskFilter}`).get(...deptTaskParams) as { count: number })?.count || 0;

    // 2. Client Metrics
    const activeClients = (db.prepare("SELECT count(*) as count FROM clients WHERE onboarding_stage = 'active'").get() as { count: number })?.count || 0;
    const onboardingClients = (db.prepare("SELECT count(*) as count FROM clients WHERE onboarding_stage IN ('inquiry', 'contract_review', 'kickoff')").get() as { count: number })?.count || 0;
    const totalClients = (db.prepare("SELECT count(*) as count FROM clients").get() as { count: number })?.count || 0;

    // 3. Vendor Metrics
    const verifiedVendors = (db.prepare("SELECT count(*) as count FROM vendors WHERE verification_status = 'verified'").get() as { count: number })?.count || 0;
    const pendingVendors = (db.prepare("SELECT count(*) as count FROM vendors WHERE verification_status = 'pending_review'").get() as { count: number })?.count || 0;
    const totalVendors = (db.prepare("SELECT count(*) as count FROM vendors").get() as { count: number })?.count || 0;

    // 4. Support Ticket Metrics
    const openTickets = (db.prepare("SELECT count(*) as count FROM support_tickets WHERE status IN ('open', 'pending')").get() as { count: number })?.count || 0;
    const criticalTickets = (db.prepare("SELECT count(*) as count FROM support_tickets WHERE priority = 'critical' AND status != 'resolved'").get() as { count: number })?.count || 0;
    const resolvedTickets = (db.prepare("SELECT count(*) as count FROM support_tickets WHERE status = 'resolved'").get() as { count: number })?.count || 0;
    const totalTickets = (db.prepare("SELECT count(*) as count FROM support_tickets").get() as { count: number })?.count || 0;
    const resolvedRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;

    // 5. Critical Issues & Overdue Tasks List
    const urgentTasks = db.prepare(`
      SELECT 
        t.id, t.title, t.priority, t.status, t.due_date, t.blocker_note, t.is_escalated,
        d.name as department_name,
        u.full_name as assignee_name
      FROM tasks t
      JOIN departments d ON t.department_id = d.id
      LEFT JOIN admin_users u ON t.assignee_id = u.id
      WHERE (t.status = 'blocked' OR t.is_escalated = 1 OR (t.status != 'completed' AND t.due_date < ?))
      ${deptTaskFilter}
      ORDER BY t.priority = 'urgent' DESC, t.due_date ASC
      LIMIT 5
    `).all(today, ...deptTaskParams);

    // 6. Pending Vendor Approvals List
    const pendingVendorList = db.prepare(`
      SELECT 
        v.id, v.name, v.service_category, v.onboarding_stage, v.verification_status,
        u.full_name as coordinator_name,
        (SELECT count(*) FROM vendor_documents vd WHERE vd.vendor_id = v.id AND vd.is_verified = 1) as verified_docs_count,
        (SELECT count(*) FROM vendor_documents vd WHERE vd.vendor_id = v.id) as total_docs_count
      FROM vendors v
      LEFT JOIN admin_users u ON v.assigned_coordinator_id = u.id
      WHERE v.verification_status != 'verified'
      ORDER BY v.created_at DESC
      LIMIT 5
    `).all();

    // 7. Department Workload Summary
    const deptWorkloads = db.prepare(`
      SELECT 
        d.id, d.name, d.slug,
        (SELECT count(*) FROM tasks t WHERE t.department_id = d.id AND t.status != 'completed') as active_tasks,
        (SELECT count(*) FROM tasks t WHERE t.department_id = d.id AND t.status = 'completed') as completed_tasks,
        (SELECT count(*) FROM tasks t WHERE t.department_id = d.id AND t.status != 'completed' AND t.due_date < ?) as overdue_tasks,
        (SELECT count(*) FROM admin_users u WHERE u.department_id = d.id) as member_count
      FROM departments d
      ORDER BY active_tasks DESC
    `).all(today);

    // 8. Recent Operational Activity Stream (from audit_logs)
    const recentActivity = db.prepare(`
      SELECT id, actor_name, actor_role, action, entity_type, entity_id, change_summary, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 8
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalTasks,
          pendingTasks,
          completedTasks,
          overdueTasks,
          blockedTasks,
          activeClients,
          onboardingClients,
          totalClients,
          verifiedVendors,
          pendingVendors,
          totalVendors,
          openTickets,
          criticalTickets,
          resolvedTickets,
          resolvedTicketsRate: resolvedRate,
        },
        urgentTasks,
        pendingVendorList,
        deptWorkloads,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ success: false, error: "Failed to load operations dashboard data" }, { status: 500 });
  }
}
