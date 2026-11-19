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
      const rows = (await db.prepare(`
        SELECT 
          t.id, t.title, d.name as department, u.full_name as assignee,
          t.priority, t.status, t.due_date, t.completed_at, t.blocker_note, t.is_escalated, t.created_at
        FROM tasks t
        JOIN departments d ON t.department_id = d.id
        LEFT JOIN admin_users u ON t.assignee_id = u.id
        ORDER BY t.due_date ASC
      `).all()) as Record<string, unknown>[];

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
      const rows = (await db.prepare(`
        SELECT 
          c.id, c.name, c.industry, c.contact_name, c.contact_email, c.phone,
          c.company_size, c.onboarding_stage, u.full_name as owner, c.next_follow_up, c.created_at
        FROM clients c
        LEFT JOIN admin_users u ON c.assigned_owner_id = u.id
        ORDER BY c.name ASC
      `).all()) as Record<string, unknown>[];

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
      const rows = (await db.prepare(`
        SELECT 
          v.id, v.name, v.service_category, v.contact_name, v.contact_email, v.phone,
          v.onboarding_stage, v.verification_status, u.full_name as coordinator, v.created_at
        FROM vendors v
        LEFT JOIN admin_users u ON v.assigned_coordinator_id = u.id
        ORDER BY v.name ASC
      `).all()) as Record<string, unknown>[];

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
      const rows = (await db.prepare(`
        SELECT 
          st.ticket_ref, c.name as client, st.customer_name, st.customer_email,
          st.category, st.priority, st.status, u.full_name as assignee, st.resolved_at, st.created_at
        FROM support_tickets st
        LEFT JOIN clients c ON st.client_id = c.id
        LEFT JOIN admin_users u ON st.assigned_user_id = u.id
        ORDER BY st.created_at DESC
      `).all()) as Record<string, unknown>[];

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
    } else if (type === "users") {
      const rows = (await db.prepare(`
        SELECT id, email, full_name, account_type, is_verified, status, created_at, updated_at
        FROM user_profiles
        ORDER BY created_at DESC
      `).all()) as Record<string, unknown>[];

      const headers = ["ID", "Email", "FullName", "AccountType", "IsVerified", "Status", "CreatedAt", "UpdatedAt"];
      csvData = headers.join(",") + "\n" + rows.map((r) => [
        escapeCSV(r.id),
        escapeCSV(r.email),
        escapeCSV(r.full_name),
        escapeCSV(r.account_type),
        escapeCSV(r.is_verified ? "Verified" : "Unverified"),
        escapeCSV(r.status),
        escapeCSV(r.created_at),
        escapeCSV(r.updated_at || ""),
      ].join(",")).join("\n");
    } else if (type === "talent") {
      const rows = (await db.prepare(`
        SELECT 
          u.id, u.email, u.full_name, t.headline, t.location, t.hourly_rate,
          t.years_experience, t.availability, t.skills, u.is_verified, u.status, u.created_at
        FROM user_profiles u
        JOIN talent_profiles t ON u.id = t.user_id
        WHERE u.account_type = 'talent'
        ORDER BY u.created_at DESC
      `).all()) as Record<string, unknown>[];

      const headers = ["ID", "Email", "FullName", "Headline", "Location", "HourlyRate", "YearsExperience", "Availability", "Skills", "IsVerified", "Status", "CreatedAt"];
      csvData = headers.join(",") + "\n" + rows.map((r) => [
        escapeCSV(r.id),
        escapeCSV(r.email),
        escapeCSV(r.full_name),
        escapeCSV(r.headline || ""),
        escapeCSV(r.location || ""),
        escapeCSV(r.hourly_rate || ""),
        escapeCSV(r.years_experience ?? ""),
        escapeCSV(r.availability || ""),
        escapeCSV(Array.isArray(r.skills) ? (r.skills as string[]).join("; ") : ""),
        escapeCSV(r.is_verified ? "Verified" : "Unverified"),
        escapeCSV(r.status),
        escapeCSV(r.created_at),
      ].join(",")).join("\n");
    } else if (type === "companies") {
      const rows = (await db.prepare(`
        SELECT 
          u.id, u.email, u.full_name, c.company_name, c.contact_name, c.business_email,
          c.industry, c.company_size, c.website_url, c.billing_country, u.is_verified, u.status, u.created_at
        FROM user_profiles u
        JOIN company_profiles c ON u.id = c.user_id
        WHERE u.account_type = 'company'
        ORDER BY u.created_at DESC
      `).all()) as Record<string, unknown>[];

      const headers = ["ID", "AccountEmail", "AccountName", "CompanyName", "ContactName", "BusinessEmail", "Industry", "CompanySize", "WebsiteUrl", "BillingCountry", "IsVerified", "Status", "CreatedAt"];
      csvData = headers.join(",") + "\n" + rows.map((r) => [
        escapeCSV(r.id),
        escapeCSV(r.email),
        escapeCSV(r.full_name),
        escapeCSV(r.company_name || ""),
        escapeCSV(r.contact_name || ""),
        escapeCSV(r.business_email || ""),
        escapeCSV(r.industry || ""),
        escapeCSV(r.company_size || ""),
        escapeCSV(r.website_url || ""),
        escapeCSV(r.billing_country || ""),
        escapeCSV(r.is_verified ? "Verified" : "Unverified"),
        escapeCSV(r.status),
        escapeCSV(r.created_at),
      ].join(",")).join("\n");
    } else if (type === "opportunities" || type === "projects") {
      const rows = (await db.prepare(`
        SELECT 
          p.id, p.title, p.company_name, p.industry, p.status, p.timeline,
          p.budget_range, p.budget_tier, p.required_services, p.created_at,
          (SELECT count(*) FROM project_applications a WHERE a.project_id = p.id) as applications_count
        FROM client_projects p
        ORDER BY p.created_at DESC
      `).all()) as Record<string, unknown>[];

      const headers = ["ID", "Title", "CompanyName", "Industry", "Status", "Timeline", "BudgetRange", "BudgetTier", "RequiredServices", "ApplicationsCount", "CreatedAt"];
      csvData = headers.join(",") + "\n" + rows.map((r) => [
        escapeCSV(r.id),
        escapeCSV(r.title),
        escapeCSV(r.company_name),
        escapeCSV(r.industry),
        escapeCSV(r.status),
        escapeCSV(r.timeline),
        escapeCSV(r.budget_range),
        escapeCSV(r.budget_tier),
        escapeCSV(Array.isArray(r.required_services) ? (r.required_services as string[]).join("; ") : ""),
        escapeCSV(r.applications_count ?? 0),
        escapeCSV(r.created_at),
      ].join(",")).join("\n");
    } else if (type === "applications") {
      const rows = (await db.prepare(`
        SELECT 
          a.id, p.title as project_title, p.company_name, u.full_name as talent_name,
          u.email as talent_email, a.proposed_rate, a.status, a.pitch, a.created_at
        FROM project_applications a
        JOIN client_projects p ON a.project_id = p.id
        JOIN user_profiles u ON a.talent_user_id = u.id
        ORDER BY a.created_at DESC
      `).all()) as Record<string, unknown>[];

      const headers = ["ApplicationID", "ProjectTitle", "CompanyName", "TalentName", "TalentEmail", "ProposedRate", "Status", "Pitch", "CreatedAt"];
      csvData = headers.join(",") + "\n" + rows.map((r) => [
        escapeCSV(r.id),
        escapeCSV(r.project_title),
        escapeCSV(r.company_name),
        escapeCSV(r.talent_name),
        escapeCSV(r.talent_email),
        escapeCSV(r.proposed_rate),
        escapeCSV(r.status),
        escapeCSV(r.pitch),
        escapeCSV(r.created_at),
      ].join(",")).join("\n");
    } else if (type === "analytics") {
      const userMetrics = (await db.prepare(`
        SELECT 
          count(*) as total_users,
          count(*) FILTER (WHERE account_type = 'talent') as talent_users,
          count(*) FILTER (WHERE account_type = 'company') as company_users,
          count(*) FILTER (WHERE is_verified = TRUE) as verified_users,
          count(*) FILTER (WHERE is_verified = FALSE) as unverified_users,
          count(*) FILTER (WHERE status = 'active') as active_users,
          count(*) FILTER (WHERE status = 'suspended') as suspended_users
        FROM user_profiles
      `).get()) as any;

      const oppMetrics = (await db.prepare(`
        SELECT count(*) as total_opps, count(*) FILTER (WHERE status = 'Active') as active_opps FROM client_projects
      `).get()) as any;

      const appMetrics = (await db.prepare(`
        SELECT count(*) as total_apps, count(*) FILTER (WHERE status = 'accepted') as accepted_apps FROM project_applications
      `).get()) as any;

      const headers = ["Metric", "Value"];
      const rows = [
        ["Total Registered Users", userMetrics?.total_users || 0],
        ["Talent Accounts", userMetrics?.talent_users || 0],
        ["Enterprise Companies", userMetrics?.company_users || 0],
        ["Verified Accounts", userMetrics?.verified_users || 0],
        ["Unverified Accounts", userMetrics?.unverified_users || 0],
        ["Active Accounts", userMetrics?.active_users || 0],
        ["Suspended Accounts", userMetrics?.suspended_users || 0],
        ["Total Opportunities", oppMetrics?.total_opps || 0],
        ["Active Opportunities", oppMetrics?.active_opps || 0],
        ["Total Applications", appMetrics?.total_apps || 0],
        ["Accepted Applications", appMetrics?.accepted_apps || 0],
        ["Export Generated At", new Date().toISOString()],
      ];

      csvData = headers.join(",") + "\n" + rows.map(([k, v]) => `${escapeCSV(k)},${escapeCSV(v)}`).join("\n");
    } else {
      return NextResponse.json({ success: false, error: "Invalid export type" }, { status: 400 });
    }

    await recordAuditLog({
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
