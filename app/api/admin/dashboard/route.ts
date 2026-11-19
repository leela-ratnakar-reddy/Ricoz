import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dashboard
 * Returns real platform metrics, recent registrations, recent opportunities,
 * proposal submissions, and audit activity from InsForge PostgreSQL.
 * Completely free of mock or hardcoded statistics.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("dashboard.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();

    // 1. Core Platform User KPIs
    const userStats = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE account_type = 'talent') as talent_count,
        count(*) FILTER (WHERE account_type = 'company') as company_count,
        count(*) FILTER (WHERE is_verified = TRUE) as verified_count,
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
        count(*) FILTER (WHERE status IN ('open', 'pending')) as open_count,
        count(*) FILTER (WHERE priority = 'critical' AND status != 'resolved') as critical_count,
        count(*) FILTER (WHERE status = 'resolved') as resolved_count
      FROM support_tickets
    `).get()) as any;

    // 5. Concierge Enquiries KPIs
    const enquiryStats = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE status = 'new') as new_count
      FROM website_enquiries
    `).get()) as any;

    // 6. Recent Registrations
    const recentUsers = (await db.prepare(`
      SELECT id, full_name, email, account_type, is_verified, status, created_at
      FROM user_profiles
      ORDER BY created_at DESC
      LIMIT 5
    `).all()) as any[];

    // 7. Recent Mandates / Opportunities
    const recentOpportunities = (await db.prepare(`
      SELECT 
        cp.id, cp.title, cp.company_name, cp.industry, cp.budget_tier, cp.status, cp.created_at,
        (SELECT count(*) FROM project_applications pa WHERE pa.project_id = cp.id) as applications_count
      FROM client_projects cp
      ORDER BY cp.created_at DESC
      LIMIT 5
    `).all()) as any[];

    // 8. Recent Proposals Submitted
    const recentApplications = (await db.prepare(`
      SELECT 
        pa.id, pa.status, pa.proposed_rate, pa.created_at,
        cp.title as project_title, cp.company_name,
        u.full_name as talent_name, u.email as talent_email
      FROM project_applications pa
      LEFT JOIN client_projects cp ON pa.project_id = cp.id
      LEFT JOIN user_profiles u ON pa.talent_user_id = u.id
      ORDER BY pa.created_at DESC
      LIMIT 5
    `).all()) as any[];

    // 9. Recent Administrative & Platform Activity (from audit_logs)
    const recentActivity = (await db.prepare(`
      SELECT id, actor_name, actor_role, action, entity_type, entity_id, change_summary, ip_address, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 10
    `).all()) as any[];

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

          // Support & Enquiries
          openTickets: Number(ticketStats?.open_count || 0),
          criticalTickets: Number(ticketStats?.critical_count || 0),
          resolvedTicketsRate: resolvedRate,
          totalEnquiries: Number(enquiryStats?.total || 0),
          newEnquiries: Number(enquiryStats?.new_count || 0),
        },
        recentUsers,
        recentOpportunities,
        recentApplications,
        recentActivity,
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
