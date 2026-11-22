import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dashboard
 * Returns real platform metrics, tactical action queues, recent registrations,
 * opportunity mandates, proposal submissions, and audit activity from InsForge PostgreSQL.
 * Completely free of mock or hardcoded statistics.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("dashboard.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "all"; // "all" | "30d" | "7d" | "today"

    const db = getDb();

    // 1. Core Platform User KPIs
    const userStats = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE account_type = 'talent') as talent_count,
        count(*) FILTER (WHERE account_type = 'company') as company_count,
        count(*) FILTER (WHERE is_verified = TRUE) as verified_count,
        count(*) FILTER (WHERE is_verified = FALSE) as unverified_count,
        count(*) FILTER (WHERE status = 'active') as active_count,
        count(*) FILTER (WHERE status = 'suspended') as suspended_count,
        count(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_today,
        count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_week,
        count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_month
      FROM user_profiles
    `).get()) as any;

    // 2. Project Mandate KPIs
    const oppStats = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE status ILIKE 'discovery') as discovery_count,
        count(*) FILTER (WHERE status ILIKE 'matching') as matching_count,
        count(*) FILTER (WHERE status ILIKE 'active') as active_count,
        count(*) FILTER (WHERE status ILIKE 'closed') as closed_count
      FROM client_projects
    `).get()) as any;

    // 3. Application / Proposal KPIs
    const appStats = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE status ILIKE 'pending') as pending_count,
        count(*) FILTER (WHERE status ILIKE 'shortlisted') as shortlisted_count,
        count(*) FILTER (WHERE status ILIKE 'accepted') as accepted_count,
        count(*) FILTER (WHERE status ILIKE 'declined') as declined_count,
        round(COALESCE(avg(proposed_rate), 0), 2) as avg_rate
      FROM project_applications
    `).get()) as any;

    // 4. Support Ticket KPIs
    const ticketStats = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE status IN ('open', 'pending', 'in_progress')) as open_count,
        count(*) FILTER (WHERE priority = 'critical' AND status != 'resolved' AND status != 'closed') as critical_count,
        count(*) FILTER (WHERE status = 'resolved' OR status = 'closed') as resolved_count
      FROM support_tickets
    `).get()) as any;

    // 5. Concierge Enquiries KPIs
    const enquiryStats = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE status = 'new') as new_count
      FROM website_enquiries
    `).get()) as any;

    // 6. Operational Tasks KPIs
    const taskStats = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE status != 'completed') as active_count,
        count(*) FILTER (WHERE status = 'blocked' OR is_escalated = TRUE) as blocked_or_escalated_count,
        count(*) FILTER (WHERE due_date < NOW() AND status != 'completed') as overdue_count
      FROM tasks
    `).get()) as any;

    // Date range filter clause for recent items
    let dateFilterClause = "";
    if (range === "today") {
      dateFilterClause = "AND created_at >= CURRENT_DATE";
    } else if (range === "7d") {
      dateFilterClause = "AND created_at >= NOW() - INTERVAL '7 days'";
    } else if (range === "30d") {
      dateFilterClause = "AND created_at >= NOW() - INTERVAL '30 days'";
    }

    // 7. Recent Registrations
    const recentUsers = (await db.prepare(`
      SELECT id, full_name, email, account_type, is_verified, status, created_at
      FROM user_profiles
      WHERE 1=1 ${dateFilterClause}
      ORDER BY created_at DESC
      LIMIT 6
    `).all()) as any[];

    // 8. Recent Mandates / Opportunities
    const recentOpportunities = (await db.prepare(`
      SELECT 
        cp.id, cp.title, cp.company_name, cp.industry, cp.budget_tier, cp.status, cp.created_at,
        (SELECT count(*) FROM project_applications pa WHERE pa.project_id = cp.id) as applications_count
      FROM client_projects cp
      WHERE 1=1 ${dateFilterClause}
      ORDER BY cp.created_at DESC
      LIMIT 6
    `).all()) as any[];

    // 9. Recent Proposals Submitted
    const recentApplications = (await db.prepare(`
      SELECT 
        pa.id, pa.status, pa.proposed_rate, pa.created_at,
        cp.title as project_title, cp.company_name,
        u.full_name as talent_name, u.email as talent_email
      FROM project_applications pa
      LEFT JOIN client_projects cp ON pa.project_id = cp.id
      LEFT JOIN user_profiles u ON pa.talent_user_id = u.id
      WHERE 1=1 ${dateFilterClause ? `AND pa.created_at >= NOW() - INTERVAL '30 days'` : ""}
      ORDER BY pa.created_at DESC
      LIMIT 6
    `).all()) as any[];

    // 10. Recent Administrative & Platform Activity (from audit_logs)
    const recentActivity = (await db.prepare(`
      SELECT id, actor_name, actor_role, action, entity_type, entity_id, change_summary, ip_address, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 8
    `).all()) as any[];

    // 11. Tactical Queue: Pending Verifications
    const pendingVerifications = (await db.prepare(`
      SELECT id, full_name, email, account_type, is_verified, status, created_at
      FROM user_profiles
      WHERE is_verified = FALSE AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 5
    `).all()) as any[];

    // 12. Tactical Queue: Actionable Support Tickets
    const actionTickets = (await db.prepare(`
      SELECT id, ticket_ref, customer_name, customer_email, category, priority, status, created_at
      FROM support_tickets
      WHERE status IN ('open', 'in_progress', 'pending')
      ORDER BY CASE WHEN priority = 'critical' THEN 1 WHEN priority = 'high' THEN 2 ELSE 3 END, created_at ASC
      LIMIT 5
    `).all()) as any[];

    // 13. Tactical Queue: Tasks Needing Attention (Overdue or Blocked)
    const attentionTasks = (await db.prepare(`
      SELECT id, title, priority, status, blocker_note, is_escalated, due_date, created_at
      FROM tasks
      WHERE (due_date < NOW() AND status != 'completed') OR status = 'blocked' OR is_escalated = TRUE
      ORDER BY is_escalated DESC, due_date ASC
      LIMIT 5
    `).all()) as any[];

    // 14. Operational Alerts
    const operationalAlerts = [];
    const blockedCount = Number(taskStats?.blocked_or_escalated_count || 0);
    const criticalCount = Number(ticketStats?.critical_count || 0);
    const overdueCount = Number(taskStats?.overdue_count || 0);
    const unverifiedCount = Number(userStats?.unverified_count || 0);

    if (blockedCount > 0) {
      operationalAlerts.push({
        id: "blocked_tasks",
        severity: "critical",
        title: `${blockedCount} Blocked or Escalated Task(s)`,
        message: "Tasks flagged with operational blockers require immediate administrative triage.",
        href: "/admin/tasks?status=blocked",
      });
    }

    if (criticalCount > 0) {
      operationalAlerts.push({
        id: "critical_tickets",
        severity: "critical",
        title: `${criticalCount} Critical Priority Support Ticket(s)`,
        message: "Customer or enterprise partner issues escalated to critical severity.",
        href: "/admin/support?priority=critical",
      });
    }

    if (overdueCount > 0) {
      operationalAlerts.push({
        id: "overdue_tasks",
        severity: "warning",
        title: `${overdueCount} Task(s) Overdue`,
        message: "Internal operational deliverables past deadline require reassignment or updated dates.",
        href: "/admin/tasks",
      });
    }

    if (unverifiedCount > 0) {
      operationalAlerts.push({
        id: "pending_verifications",
        severity: "info",
        title: `${unverifiedCount} Unverified Account(s)`,
        message: "Talent and client registrations awaiting administrative vetting and approval.",
        href: "/admin/talent?verification=pending",
      });
    }

    const totalTickets = Number(ticketStats?.total || 0);
    const resolvedTickets = Number(ticketStats?.resolved_count || 0);
    const resolvedRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          // Users
          totalUsers: Number(userStats?.total || 0),
          talentUsers: Number(userStats?.talent_count || 0),
          companyUsers: Number(userStats?.company_count || 0),
          verifiedUsers: Number(userStats?.verified_count || 0),
          unverifiedUsers: unverifiedCount,
          activeUsers: Number(userStats?.active_count || 0),
          suspendedUsers: Number(userStats?.suspended_count || 0),
          newToday: Number(userStats?.new_today || 0),
          newThisWeek: Number(userStats?.new_week || 0),
          newThisMonth: Number(userStats?.new_month || 0),

          // Opportunities
          totalOpportunities: Number(oppStats?.total || 0),
          discoveryOpportunities: Number(oppStats?.discovery_count || 0),
          matchingOpportunities: Number(oppStats?.matching_count || 0),
          activeOpportunities: Number(oppStats?.active_count || 0),
          closedOpportunities: Number(oppStats?.closed_count || 0),

          // Applications
          totalApplications: Number(appStats?.total || 0),
          pendingApplications: Number(appStats?.pending_count || 0),
          shortlistedApplications: Number(appStats?.shortlisted_count || 0),
          acceptedApplications: Number(appStats?.accepted_count || 0),
          declinedApplications: Number(appStats?.declined_count || 0),
          avgProposedRate: Number(appStats?.avg_rate || 0),

          // Tasks
          totalTasks: Number(taskStats?.total || 0),
          activeTasks: Number(taskStats?.active_count || 0),
          blockedTasks: blockedCount,
          overdueTasks: overdueCount,

          // Support & Enquiries
          openTickets: Number(ticketStats?.open_count || 0),
          criticalTickets: criticalCount,
          resolvedTicketsRate: resolvedRate,
          totalEnquiries: Number(enquiryStats?.total || 0),
          newEnquiries: Number(enquiryStats?.new_count || 0),
        },
        recentUsers,
        recentOpportunities,
        recentApplications,
        recentActivity,
        tacticalQueues: {
          pendingVerifications,
          actionTickets,
          attentionTasks,
        },
        operationalAlerts,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load platform dashboard metrics" },
      { status: 500 }
    );
  }
}
