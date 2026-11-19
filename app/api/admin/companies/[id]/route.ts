import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/companies/[id]
 * Retrieves comprehensive company profile, posted project mandates, and application history.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("users.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { id } = await params;
    const db = getDb();

    // Fetch user and company profile
    const company = (await db.prepare(`
      SELECT 
        u.id, u.email, u.full_name, u.account_type, u.avatar_url, u.is_verified, u.status, u.created_at, u.updated_at,
        c.id as company_profile_id, c.company_name, c.contact_name, c.business_email,
        c.industry, c.company_size, c.website_url, c.billing_country
      FROM user_profiles u
      LEFT JOIN company_profiles c ON u.id = c.user_id
      WHERE u.id = ? AND u.account_type = 'company'
    `).get(id)) as any;

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Enterprise company client not found" },
        { status: 404 }
      );
    }

    // Projects posted by this company
    const projects = (await db.prepare(`
      SELECT 
        cp.*,
        (SELECT count(*) FROM project_applications pa WHERE pa.project_id = cp.id) as applications_count
      FROM client_projects cp
      WHERE cp.company_user_id = ?
      ORDER BY cp.created_at DESC
      LIMIT 25
    `).all(id)) as any[];

    // Total applications across all projects
    const appsRow = (await db.prepare(`
      SELECT count(*) as count
      FROM project_applications pa
      JOIN client_projects cp ON pa.project_id = cp.id
      WHERE cp.company_user_id = ?
    `).get(id)) as { count?: string | number } | undefined;
    const totalApplicationsReceived = Number(appsRow?.count || 0);

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        projects,
        totalApplicationsReceived,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/companies/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve company details" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/companies/[id]
 * Updates company administrative attributes:
 * - status ("active", "suspended", "deactivated")
 * - is_verified (boolean)
 * - company_name, industry, company_size, website_url
 * Automatically writes to audit_logs.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("users.manage", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { id } = await params;
    const db = getDb();
    const body = await req.json();

    // Verify company exists
    const existing = (await db.prepare(`
      SELECT u.id, u.email, u.full_name, u.status, u.is_verified,
             c.company_name, c.industry, c.company_size, c.website_url
      FROM user_profiles u
      LEFT JOIN company_profiles c ON u.id = c.user_id
      WHERE u.id = ? AND u.account_type = 'company'
    `).get(id)) as any;

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Enterprise company client not found" },
        { status: 404 }
      );
    }

    const updatesUser: string[] = [];
    const paramsUser: any[] = [];
    const changeSummaries: string[] = [];

    // 1. Status change
    if (body.status !== undefined) {
      if (!["active", "suspended", "deactivated"].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status value" },
          { status: 400 }
        );
      }
      if (body.status !== existing.status) {
        updatesUser.push("status = ?");
        paramsUser.push(body.status);
        changeSummaries.push(`Status changed from '${existing.status}' to '${body.status}'`);
      }
    }

    // 2. Verification change
    if (body.is_verified !== undefined) {
      const isVerified = Boolean(body.is_verified);
      if (isVerified !== existing.is_verified) {
        updatesUser.push("is_verified = ?");
        paramsUser.push(isVerified);
        changeSummaries.push(`Verification status set to ${isVerified ? "VERIFIED" : "UNVERIFIED"}`);
      }
    }

    if (updatesUser.length > 0) {
      updatesUser.push("updated_at = NOW()");
      paramsUser.push(id);
      await db.prepare(`
        UPDATE user_profiles
        SET ${updatesUser.join(", ")}
        WHERE id = ?
      `).run(...paramsUser);
    }

    // 3. Company profile updates
    const updatesComp: string[] = [];
    const paramsComp: any[] = [];

    if (body.company_name !== undefined && body.company_name.trim()) {
      const name = body.company_name.trim();
      if (name !== existing.company_name) {
        updatesComp.push("company_name = ?");
        paramsComp.push(name);
        changeSummaries.push(`Company name changed to '${name}'`);
      }
    }

    if (body.industry !== undefined) {
      const ind = body.industry.trim();
      if (ind !== existing.industry) {
        updatesComp.push("industry = ?");
        paramsComp.push(ind);
        changeSummaries.push(`Industry changed to '${ind}'`);
      }
    }

    if (body.company_size !== undefined) {
      const size = body.company_size.trim();
      if (size !== existing.company_size) {
        updatesComp.push("company_size = ?");
        paramsComp.push(size);
        changeSummaries.push(`Company size changed to '${size}'`);
      }
    }

    if (body.website_url !== undefined) {
      const web = body.website_url.trim();
      if (web !== existing.website_url) {
        updatesComp.push("website_url = ?");
        paramsComp.push(web);
        changeSummaries.push(`Website updated to '${web}'`);
      }
    }

    if (updatesComp.length > 0) {
      updatesComp.push("updated_at = NOW()");
      paramsComp.push(id);
      await db.prepare(`
        UPDATE company_profiles
        SET ${updatesComp.join(", ")}
        WHERE user_id = ?
      `).run(...paramsComp);
    }

    if (changeSummaries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
      });
    }

    // Record audit log
    await recordAuditLog({
      actor: auth.user,
      action: "PLATFORM_COMPANY_MODIFIED",
      entityType: "company_profile",
      entityId: id,
      changeSummary: `Enterprise client '${existing.company_name || existing.full_name}' updated: ${changeSummaries.join("; ")}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Enterprise company updated successfully",
      changes: changeSummaries,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/companies/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update company details" },
      { status: 500 }
    );
  }
}
