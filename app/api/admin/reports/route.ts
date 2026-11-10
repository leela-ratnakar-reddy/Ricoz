import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("reports.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const range = searchParams.get("range") || "30d";
    const today = new Date().toISOString().split("T")[0];

    const deptFilter = departmentId ? "AND department_id = ?" : "";
    const deptParams = departmentId ? [departmentId] : [];

    // 1. Task Delivery Velocity
    const totalTasks = (db.prepare(`SELECT count(*) as count FROM tasks WHERE 1=1 ${deptFilter}`).get(...deptParams) as { count: number })?.count || 0;
    const completedTasks = (db.prepare(`SELECT count(*) as count FROM tasks WHERE status = 'completed' ${deptFilter}`).get(...deptParams) as { count: number })?.count || 0;
    const overdueTasks = (db.prepare(`SELECT count(*) as count FROM tasks WHERE status != 'completed' AND due_date < ? ${deptFilter}`).get(today, ...deptParams) as { count: number })?.count || 0;
    const blockedTasks = (db.prepare(`SELECT count(*) as count FROM tasks WHERE status = 'blocked' ${deptFilter}`).get(...deptParams) as { count: number })?.count || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    // 2. Department Breakdown
    const deptStats = db.prepare(`
      SELECT 
        d.id, d.name,
        (SELECT count(*) FROM tasks t WHERE t.department_id = d.id) as total_tasks,
        (SELECT count(*) FROM tasks t WHERE t.department_id = d.id AND t.status = 'completed') as completed_tasks,
        (SELECT count(*) FROM tasks t WHERE t.department_id = d.id AND t.status != 'completed' AND t.due_date < ?) as overdue_tasks,
        (SELECT count(*) FROM tasks t WHERE t.department_id = d.id AND t.status = 'blocked') as blocked_tasks
      FROM departments d
      ORDER BY total_tasks DESC
    `).all(today);

    // 3. Client Onboarding Velocity
    const clientStages = db.prepare(`
      SELECT onboarding_stage, count(*) as count
      FROM clients
      GROUP BY onboarding_stage
    `).all();

    // 4. Vendor Vetting Compliance
    const vendorStatus = db.prepare(`
      SELECT verification_status, count(*) as count
      FROM vendors
      GROUP BY verification_status
    `).all();

    // 5. Support SLA Performance
    const totalTickets = (db.prepare("SELECT count(*) as count FROM support_tickets").get() as { count: number })?.count || 0;
    const resolvedTickets = (db.prepare("SELECT count(*) as count FROM support_tickets WHERE status = 'resolved'").get() as { count: number })?.count || 0;
    const criticalTickets = (db.prepare("SELECT count(*) as count FROM support_tickets WHERE priority = 'critical'").get() as { count: number })?.count || 0;
    const ticketsByCategory = db.prepare(`
      SELECT category, count(*) as count
      FROM support_tickets
      GROUP BY category
    `).all();

    return NextResponse.json({
      success: true,
      reports: {
        taskVelocity: {
          totalTasks,
          completedTasks,
          overdueTasks,
          blockedTasks,
          completionRate,
        },
        deptStats,
        clientStages,
        vendorStatus,
        supportSLA: {
          totalTickets,
          resolvedTickets,
          criticalTickets,
          slaRate: totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100,
          categories: ticketsByCategory,
        },
      },
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate reports" }, { status: 500 });
  }
}
