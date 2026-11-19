import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics/overview
 * Returns comprehensive, real-time database-backed platform analytics.
 * Supports date range filtering: '7d', '30d', '90d', '6m', '12m', or custom startDate & endDate.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("reports.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const { searchParams } = new URL(req.url);

    const range = searchParams.get("range") || "30d";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    // 1. Calculate time window
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    let bucketInterval = "day";

    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      bucketInterval = diffDays > 90 ? "month" : diffDays > 30 ? "week" : "day";
    } else {
      switch (range) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
          bucketInterval = "day";
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
          bucketInterval = "week";
          break;
        case "6m":
          startDate = new Date(now.getTime() - 180 * 24 * 3600 * 1000);
          bucketInterval = "month";
          break;
        case "12m":
          startDate = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
          bucketInterval = "month";
          break;
        case "30d":
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
          bucketInterval = "day";
          break;
      }
    }

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    // 2. High-Level Platform Overview Cards
    const overviewUserRow = (await db.prepare(`
      SELECT 
        count(*) as total_users,
        count(*) FILTER (WHERE account_type = 'talent') as talent_users,
        count(*) FILTER (WHERE account_type = 'company') as company_users,
        count(*) FILTER (WHERE is_verified = TRUE) as verified_users,
        count(*) FILTER (WHERE is_verified = FALSE) as unverified_users,
        count(*) FILTER (WHERE status = 'active') as active_users,
        count(*) FILTER (WHERE status = 'suspended') as suspended_users,
        count(*) FILTER (WHERE status = 'deactivated') as deactivated_users,
        count(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '1 day')) as new_today,
        count(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '7 days')) as new_this_week,
        count(*) FILTER (WHERE created_at >= (NOW() - INTERVAL '30 days')) as new_this_month
      FROM user_profiles
    `).get()) as any;

    const overviewOppRow = (await db.prepare(`
      SELECT 
        count(*) as total_opps,
        count(*) FILTER (WHERE status IN ('Active', 'Matching', 'Discovery')) as active_opps,
        count(*) FILTER (WHERE status = 'Closed') as closed_opps
      FROM client_projects
    `).get()) as any;

    const overviewAppRow = (await db.prepare(`
      SELECT 
        count(*) as total_apps,
        count(*) FILTER (WHERE status = 'pending') as pending_apps,
        count(*) FILTER (WHERE status = 'reviewed') as reviewed_apps,
        count(*) FILTER (WHERE status = 'shortlisted') as shortlisted_apps,
        count(*) FILTER (WHERE status = 'accepted') as accepted_apps,
        count(*) FILTER (WHERE status = 'declined') as rejected_apps
      FROM project_applications
    `).get()) as any;

    const overview = {
      totalUsers: Number(overviewUserRow?.total_users || 0),
      talentUsers: Number(overviewUserRow?.talent_users || 0),
      companyUsers: Number(overviewUserRow?.company_users || 0),
      newToday: Number(overviewUserRow?.new_today || 0),
      newThisWeek: Number(overviewUserRow?.new_this_week || 0),
      newThisMonth: Number(overviewUserRow?.new_this_month || 0),
      verifiedUsers: Number(overviewUserRow?.verified_users || 0),
      pendingVerification: Number(overviewUserRow?.unverified_users || 0),
      activeUsers: Number(overviewUserRow?.active_users || 0),
      suspendedUsers: Number(overviewUserRow?.suspended_users || 0),
      deactivatedUsers: Number(overviewUserRow?.deactivated_users || 0),
      totalOpportunities: Number(overviewOppRow?.total_opps || 0),
      activeOpportunities: Number(overviewOppRow?.active_opps || 0),
      closedOpportunities: Number(overviewOppRow?.closed_opps || 0),
      totalApplications: Number(overviewAppRow?.total_apps || 0),
      pendingApplications: Number(overviewAppRow?.pending_apps || 0),
      reviewedApplications: Number(overviewAppRow?.reviewed_apps || 0),
      shortlistedApplications: Number(overviewAppRow?.shortlisted_apps || 0),
      acceptedApplications: Number(overviewAppRow?.accepted_apps || 0),
      rejectedApplications: Number(overviewAppRow?.rejected_apps || 0),
    };

    // 3. User Growth Time-Series (Date-Bucket Grouping)
    const growthRows = (await db.prepare(`
      SELECT 
        to_char(date_trunc(?, created_at), 'YYYY-MM-DD') as date_label,
        count(*) as total,
        count(*) FILTER (WHERE account_type = 'talent') as talent,
        count(*) FILTER (WHERE account_type = 'company') as company
      FROM user_profiles
      WHERE created_at >= ? AND created_at <= ?
      GROUP BY date_label
      ORDER BY date_label ASC
    `).all(bucketInterval, startIso, endIso)) as any[];

    let runningTotal = 0;
    const userGrowth = growthRows.map((row) => {
      const stepTotal = Number(row.total || 0);
      runningTotal += stepTotal;
      return {
        date: row.date_label,
        total: stepTotal,
        talent: Number(row.talent || 0),
        company: Number(row.company || 0),
        cumulative: runningTotal,
      };
    });

    // 4. Talent Analytics
    const talentStatsRow = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE u.is_verified = TRUE) as verified,
        count(*) FILTER (WHERE t.headline IS NOT NULL AND t.headline != '' AND t.location IS NOT NULL AND t.location != '') as complete_profiles,
        count(*) FILTER (WHERE t.headline IS NULL OR t.headline = '' OR t.location IS NULL OR t.location = '') as incomplete_profiles
      FROM user_profiles u
      LEFT JOIN talent_profiles t ON u.id = t.user_id
      WHERE u.account_type = 'talent'
    `).get()) as any;

    const skillsRows = (await db.prepare(`
      SELECT skill, count(*) as count
      FROM talent_profiles,
           jsonb_array_elements_text(skills) as skill
      WHERE skills IS NOT NULL AND jsonb_typeof(skills) = 'array'
      GROUP BY skill
      ORDER BY count DESC
      LIMIT 10
    `).all()) as any[];

    const talentLocations = (await db.prepare(`
      SELECT location, count(*) as count
      FROM talent_profiles
      WHERE location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY count DESC
      LIMIT 8
    `).all()) as any[];

    const talentExperience = (await db.prepare(`
      SELECT 
        count(*) FILTER (WHERE years_experience < 3) as exp_junior,
        count(*) FILTER (WHERE years_experience >= 3 AND years_experience <= 5) as exp_mid,
        count(*) FILTER (WHERE years_experience >= 6 AND years_experience <= 8) as exp_senior,
        count(*) FILTER (WHERE years_experience >= 9) as exp_lead
      FROM talent_profiles
    `).get()) as any;

    const talentAnalytics = {
      total: Number(talentStatsRow?.total || 0),
      verified: Number(talentStatsRow?.verified || 0),
      completeProfiles: Number(talentStatsRow?.complete_profiles || 0),
      incompleteProfiles: Number(talentStatsRow?.incomplete_profiles || 0),
      skillsDistribution: skillsRows.map((s) => ({ skill: s.skill, count: Number(s.count) })),
      locationDistribution: talentLocations.map((l) => ({ location: l.location, count: Number(l.count) })),
      experienceDistribution: {
        junior: Number(talentExperience?.exp_junior || 0),
        mid: Number(talentExperience?.exp_mid || 0),
        senior: Number(talentExperience?.exp_senior || 0),
        lead: Number(talentExperience?.exp_lead || 0),
      },
    };

    // 5. Company Analytics
    const companyStatsRow = (await db.prepare(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE u.is_verified = TRUE) as verified,
        count(*) FILTER (WHERE u.status = 'active') as active
      FROM user_profiles u
      WHERE u.account_type = 'company'
    `).get()) as any;

    const companyIndustries = (await db.prepare(`
      SELECT industry, count(*) as count
      FROM company_profiles
      WHERE industry IS NOT NULL AND industry != ''
      GROUP BY industry
      ORDER BY count DESC
      LIMIT 8
    `).all()) as any[];

    const companySizes = (await db.prepare(`
      SELECT company_size as size, count(*) as count
      FROM company_profiles
      WHERE company_size IS NOT NULL AND company_size != ''
      GROUP BY company_size
      ORDER BY count DESC
      LIMIT 6
    `).all()) as any[];

    const topCompanies = (await db.prepare(`
      SELECT cp.company_name, count(p.id) as opportunity_count
      FROM company_profiles cp
      LEFT JOIN client_projects p ON cp.user_id = p.company_user_id
      GROUP BY cp.company_name
      ORDER BY opportunity_count DESC
      LIMIT 5
    `).all()) as any[];

    const companyAnalytics = {
      total: Number(companyStatsRow?.total || 0),
      verified: Number(companyStatsRow?.verified || 0),
      active: Number(companyStatsRow?.active || 0),
      industryDistribution: companyIndustries.map((i) => ({ industry: i.industry, count: Number(i.count) })),
      sizeDistribution: companySizes.map((s) => ({ size: s.size, count: Number(s.count) })),
      topCompaniesByOpportunities: topCompanies.map((c) => ({
        companyName: c.company_name || "Enterprise Company",
        count: Number(c.opportunity_count || 0),
      })),
    };

    // 6. Opportunity / Project Analytics
    const oppStatusDist = (await db.prepare(`
      SELECT status, count(*) as count
      FROM client_projects
      GROUP BY status
      ORDER BY count DESC
    `).all()) as any[];

    const oppBudgetDist = (await db.prepare(`
      SELECT budget_tier as tier, count(*) as count
      FROM client_projects
      WHERE budget_tier IS NOT NULL AND budget_tier != ''
      GROUP BY budget_tier
      ORDER BY count DESC
    `).all()) as any[];

    const avgAppsRow = (await db.prepare(`
      SELECT 
        count(DISTINCT p.id) as total_opps,
        count(a.id) as total_apps
      FROM client_projects p
      LEFT JOIN project_applications a ON p.id = a.project_id
    `).get()) as any;

    const oppTotal = Number(avgAppsRow?.total_opps || 0);
    const appTotal = Number(avgAppsRow?.total_apps || 0);
    const avgAppsPerOpp = oppTotal > 0 ? Number((appTotal / oppTotal).toFixed(1)) : 0;

    const opportunityAnalytics = {
      total: overview.totalOpportunities,
      active: overview.activeOpportunities,
      closed: overview.closedOpportunities,
      statusDistribution: oppStatusDist.map((s) => ({ status: s.status, count: Number(s.count) })),
      budgetTierDistribution: oppBudgetDist.map((b) => ({ tier: b.tier, count: Number(b.count) })),
      averageApplicationsPerOpportunity: avgAppsPerOpp,
    };

    // 7. Application Analytics & Conversion Funnel
    const totalAppsCount = overview.totalApplications;
    const reviewedCount = overview.reviewedApplications;
    const shortlistedCount = overview.shortlistedApplications;
    const acceptedCount = overview.acceptedApplications;

    const funnel = [
      { stage: "Submitted", count: totalAppsCount, percentage: totalAppsCount > 0 ? 100 : 0 },
      { stage: "Reviewed", count: reviewedCount, percentage: totalAppsCount > 0 ? Math.round((reviewedCount / totalAppsCount) * 100) : 0 },
      { stage: "Shortlisted", count: shortlistedCount, percentage: totalAppsCount > 0 ? Math.round((shortlistedCount / totalAppsCount) * 100) : 0 },
      { stage: "Accepted", count: acceptedCount, percentage: totalAppsCount > 0 ? Math.round((acceptedCount / totalAppsCount) * 100) : 0 },
    ];

    const appStatusDist = (await db.prepare(`
      SELECT status, count(*) as count
      FROM project_applications
      GROUP BY status
      ORDER BY count DESC
    `).all()) as any[];

    const topBriefs = (await db.prepare(`
      SELECT p.id, p.title, p.company_name, count(a.id) as application_count
      FROM client_projects p
      JOIN project_applications a ON p.id = a.project_id
      GROUP BY p.id, p.title, p.company_name
      ORDER BY application_count DESC
      LIMIT 5
    `).all()) as any[];

    const applicationAnalytics = {
      total: totalAppsCount,
      pending: overview.pendingApplications,
      reviewed: reviewedCount,
      shortlisted: shortlistedCount,
      accepted: acceptedCount,
      rejected: overview.rejectedApplications,
      funnel,
      statusDistribution: appStatusDist.map((s) => ({ status: s.status, count: Number(s.count) })),
      topOpportunities: topBriefs.map((b) => ({
        id: b.id,
        title: b.title,
        companyName: b.company_name,
        count: Number(b.application_count),
      })),
    };

    // 8. Recent Platform Activity Stream
    const recentActivity = (await db.prepare(`
      SELECT id, actor_name, actor_role, action, entity_type, entity_id, change_summary, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 10
    `).all()) as any[];

    return NextResponse.json({
      success: true,
      range,
      startDate: startIso,
      endDate: endIso,
      overview,
      userGrowth,
      talentAnalytics,
      companyAnalytics,
      opportunityAnalytics,
      applicationAnalytics,
      recentActivity,
    });
  } catch (error: any) {
    console.error("GET /api/admin/analytics/overview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate analytics overview" },
      { status: 500 }
    );
  }
}
