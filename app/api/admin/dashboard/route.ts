import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("dashboard.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (departmentId && !UUID_REGEX.test(departmentId)) {
      return NextResponse.json({ success: false, error: "Invalid departmentId format." }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Base query constraints for department filter
    const deptTaskFilter = departmentId ? "AND department_id = ?" : "";
    const deptTaskParams = departmentId ? [departmentId] : [];

    // 1. Task Metrics
    const totalTasksRow = (await db.prepare(`SELECT count(*) as count FROM tasks WHERE 1=1 ${deptTaskFilter}`).get(...deptTaskParams)) as { count: string | number } | undefined;
    const totalTasks = Number(totalTasksRow?.count || 0);

    const completedTasksRow = (await db.prepare(`SELECT count(*) as count FROM tasks WHERE status = 'completed' ${deptTaskFilter}`).get(...deptTaskParams)) as { count: string | number } | undefined;
    const completedTasks = Number(completedTasksRow?.count || 0);

    const pendingTasksRow = (await db.prepare(`SELECT count(*) as count FROM tasks WHERE status IN ('todo', 'in_progress', 'blocked', 'in_review') ${deptTaskFilter}`).get(...deptTaskParams)) as { count: string | number } | undefined;
    const pendingTasks = Number(pendingTasksRow?.count || 0);
    
    const overdueTasksRow = (await db.prepare(`
      SELECT count(*) as count FROM tasks 
      WHERE status != 'completed' AND due_date < ? ${deptTaskFilter}
    `).get(today, ...deptTaskParams)) as { count: string | number } | undefined;
    const overdueTasks = Number(overdueTasksRow?.count || 0);

    const blockedTasksRow = (await db.prepare(`SELECT count(*) as count FROM tasks WHERE status = 'blocked' ${deptTaskFilter}`).get(...deptTaskParams)) as { count: string | number } | undefined;
    const blockedTasks = Number(blockedTasksRow?.count || 0);

    // 2. Client Metrics
    const activeClientsRow = (await db.prepare("SELECT count(*) as count FROM clients WHERE onboarding_stage = 'active'").get()) as { count: string | number } | undefined;
    const activeClients = Number(activeClientsRow?.count || 0);

    const onboardingClientsRow = (await db.prepare("SELECT count(*) as count FROM clients WHERE onboarding_stage IN ('inquiry', 'contract_review', 'kickoff')").get()) as { count: string | number } | undefined;
    const onboardingClients = Number(onboardingClientsRow?.count || 0);

    const totalClientsRow = (await db.prepare("SELECT count(*) as count FROM clients").get()) as { count: string | number } | undefined;
    const totalClients = Number(totalClientsRow?.count || 0);

    // 3. Vendor Metrics
    const verifiedVendorsRow = (await db.prepare("SELECT count(*) as count FROM vendors WHERE verification_status = 'verified'").get()) as { count: string | number } | undefined;
    const verifiedVendors = Number(verifiedVendorsRow?.count || 0);

    const pendingVendorsRow = (await db.prepare("SELECT count(*) as count FROM vendors WHERE verification_status = 'pending_review'").get()) as { count: string | number } | undefined;
    const pendingVendors = Number(pendingVendorsRow?.count || 0);

    const totalVendorsRow = (await db.prepare("SELECT count(*) as count FROM vendors").get()) as { count: string | number } | undefined;
    const totalVendors = Number(totalVendorsRow?.count || 0);

    // 4. Support Ticket Metrics
    const openTicketsRow = (await db.prepare("SELECT count(*) as count FROM support_tickets WHERE status IN ('open', 'pending')").get()) as { count: string | number } | undefined;
    const openTickets = Number(openTicketsRow?.count || 0);

    const criticalTicketsRow = (await db.prepare("SELECT count(*) as count FROM support_tickets WHERE priority = 'critical' AND status != 'resolved'").get()) as { count: string | number } | undefined;
    const criticalTickets = Number(criticalTicketsRow?.count || 0);

    const resolvedTicketsRow = (await db.prepare("SELECT count(*) as count FROM support_tickets WHERE status = 'resolved'").get()) as { count: string | number } | undefined;
    const resolvedTickets = Number(resolvedTicketsRow?.count || 0);

    const totalTicketsRow = (await db.prepare("SELECT count(*) as count FROM support_tickets").get()) as { count: string | number } | undefined;
    const totalTickets = Number(totalTicketsRow?.count || 0);
    const resolvedRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;

    // 4b. Platform Public User & Enquiry Metrics (from user_profiles & website_enquiries)
    let totalUsers = 0;
    let activeUsers = 0;
    let suspendedUsers = 0;
    let deactivatedUsers = 0;
    let talentUsers = 0;
    let companyUsers = 0;
    let verifiedUsers = 0;
    let pendingVerificationUsers = 0;
    let totalProjects = 0;
    let totalEnquiries = 0;
    let newEnquiries = 0;
    let recentRegistrations: any[] = [];

    try {
      const totalUsersRow = (await db.prepare("SELECT count(*) as count FROM user_profiles").get()) as { count: string | number } | undefined;
      totalUsers = Number(totalUsersRow?.count || 0);

      const activeUsersRow = (await db.prepare("SELECT count(*) as count FROM user_profiles WHERE status = 'active'").get()) as { count: string | number } | undefined;
      activeUsers = Number(activeUsersRow?.count || 0);

      const suspendedUsersRow = (await db.prepare("SELECT count(*) as count FROM user_profiles WHERE status = 'suspended'").get()) as { count: string | number } | undefined;
      suspendedUsers = Number(suspendedUsersRow?.count || 0);

      const deactivatedUsersRow = (await db.prepare("SELECT count(*) as count FROM user_profiles WHERE status = 'deactivated'").get()) as { count: string | number } | undefined;
      deactivatedUsers = Number(deactivatedUsersRow?.count || 0);

      const talentUsersRow = (await db.prepare("SELECT count(*) as count FROM user_profiles WHERE account_type = 'talent'").get()) as { count: string | number } | undefined;
      talentUsers = Number(talentUsersRow?.count || 0);

      const companyUsersRow = (await db.prepare("SELECT count(*) as count FROM user_profiles WHERE account_type = 'company'").get()) as { count: string | number } | undefined;
      companyUsers = Number(companyUsersRow?.count || 0);

      const verifiedUsersRow = (await db.prepare("SELECT count(*) as count FROM user_profiles WHERE is_verified = TRUE").get()) as { count: string | number } | undefined;
      verifiedUsers = Number(verifiedUsersRow?.count || 0);

      const pendingVerificationUsersRow = (await db.prepare("SELECT count(*) as count FROM user_profiles WHERE is_verified = FALSE").get()) as { count: string | number } | undefined;
      pendingVerificationUsers = Number(pendingVerificationUsersRow?.count || 0);

      const totalProjectsRow = (await db.prepare("SELECT count(*) as count FROM client_projects").get()) as { count: string | number } | undefined;
      totalProjects = Number(totalProjectsRow?.count || 0);

      const totalEnquiriesRow = (await db.prepare("SELECT count(*) as count FROM website_enquiries").get()) as { count: string | number } | undefined;
      totalEnquiries = Number(totalEnquiriesRow?.count || 0);

      const newEnquiriesRow = (await db.prepare("SELECT count(*) as count FROM website_enquiries WHERE status = 'new'").get()) as { count: string | number } | undefined;
      newEnquiries = Number(newEnquiriesRow?.count || 0);

      recentRegistrations = (await db.prepare(`
        SELECT u.id, u.full_name, u.email, u.account_type, u.is_verified, u.status, u.created_at,
               COALESCE(t.headline, c.company_name, '') as subtitle
        FROM user_profiles u
        LEFT JOIN talent_profiles t ON u.id = t.user_id AND u.account_type = 'talent'
        LEFT JOIN company_profiles c ON u.id = c.user_id AND u.account_type = 'company'
        ORDER BY u.created_at DESC
        LIMIT 5
      `).all()) as any[];
    } catch (metricErr) {
      console.warn("Could not load user_profiles or website_enquiries metrics:", metricErr);
    }

    // 5. Critical Issues & Overdue Tasks List
    const urgentTasks = await db.prepare(`
      SELECT 
        t.id, t.title, t.priority, t.status, t.due_date, t.blocker_note, t.is_escalated,
        d.name as department_name,
        u.full_name as assignee_name
      FROM tasks t
      JOIN departments d ON t.department_id = d.id
      LEFT JOIN admin_users u ON t.assignee_id = u.id
      WHERE (t.status = 'blocked' OR t.is_escalated = TRUE OR (t.status != 'completed' AND t.due_date < ?))
      ${deptTaskFilter}
      ORDER BY (t.priority = 'urgent') DESC, t.due_date ASC
      LIMIT 5
    `).all(today, ...deptTaskParams);

    // 6. Pending Vendor Approvals List
    const pendingVendorList = await db.prepare(`
      SELECT 
        v.id, v.name, v.service_category, v.onboarding_stage, v.verification_status,
        u.full_name as coordinator_name,
        (SELECT count(*) FROM vendor_documents vd WHERE vd.vendor_id = v.id AND vd.is_verified = TRUE) as verified_docs_count,
        (SELECT count(*) FROM vendor_documents vd WHERE vd.vendor_id = v.id) as total_docs_count
      FROM vendors v
      LEFT JOIN admin_users u ON v.assigned_coordinator_id = u.id
      WHERE v.verification_status != 'verified'
      ORDER BY v.created_at DESC
      LIMIT 5
    `).all();

    // 7. Department Workload Summary
    const deptWorkloads = await db.prepare(`
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
    const recentActivity = await db.prepare(`
      SELECT id, actor_name, actor_role, action, entity_type, entity_id, change_summary, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 8
    `).all();

    const kpis = {
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
      totalUsers,
      activeUsers,
      suspendedUsers,
      deactivatedUsers,
      talentUsers,
      companyUsers,
      totalEnquiries,
      newEnquiries,
      verifiedUsers,
      pendingVerificationUsers,
      totalProjects,
    };

    return NextResponse.json({
      success: true,
      stats: kpis,
      kpis,
      data: {
        kpis,
        urgentTasks,
        pendingVendorList,
        deptWorkloads,
        recentActivity,
        recentRegistrations,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ success: false, error: "Failed to load operations dashboard data" }, { status: 500 });
  }
}
