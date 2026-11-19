import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users/[id]
 * Retrieves comprehensive details for a specific platform user.
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

    const user = (await db.prepare(`
      SELECT id, email, full_name, account_type, avatar_url, is_verified, status, created_at, updated_at
      FROM user_profiles
      WHERE id = ?
    `).get(id)) as any;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Platform user not found" },
        { status: 404 }
      );
    }

    let specializedProfile: any = null;
    let projects: any[] = [];
    let applications: any[] = [];

    if (user.account_type === "talent") {
      specializedProfile = await db.prepare(`
        SELECT headline, bio, location, years_experience, hourly_rate, portfolio_url, skills, availability
        FROM talent_profiles
        WHERE user_id = ?
      `).get(id);

      applications = (await db.prepare(`
        SELECT pa.*, cp.title as project_title, cp.company_name
        FROM project_applications pa
        LEFT JOIN client_projects cp ON pa.project_id = cp.id
        WHERE pa.talent_user_id = ?
        ORDER BY pa.created_at DESC
        LIMIT 10
      `).all(id)) as any[];
    } else if (user.account_type === "company") {
      specializedProfile = await db.prepare(`
        SELECT company_name, contact_name, business_email, industry, company_size, website_url, billing_country
        FROM company_profiles
        WHERE user_id = ?
      `).get(id);

      projects = (await db.prepare(`
        SELECT *
        FROM client_projects
        WHERE company_user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `).all(id)) as any[];
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        specializedProfile,
        projects,
        applications,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve user details" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Updates platform user administrative attributes:
 * - status ("active", "suspended", "deactivated")
 * - is_verified (boolean)
 * Automatically writes to audit_logs.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("users.edit", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { id } = await params;
    const body = await req.json();
    const { status, isVerified, reason } = body;

    const db = getDb();
    const existingUser = (await db.prepare(`
      SELECT id, email, full_name, account_type, is_verified, status
      FROM user_profiles
      WHERE id = ?
    `).get(id)) as any;

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Platform user not found" },
        { status: 404 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    const changes: string[] = [];

    if (status !== undefined) {
      if (!["active", "suspended", "deactivated"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status. Must be active, suspended, or deactivated." },
          { status: 400 }
        );
      }
      updates.push("status = ?");
      values.push(status);
      changes.push(`status changed from '${existingUser.status}' to '${status}'`);
    }

    if (isVerified !== undefined) {
      const boolVal = Boolean(isVerified);
      updates.push("is_verified = ?");
      values.push(boolVal);
      changes.push(`verification changed to ${boolVal ? "Verified" : "Unverified"}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No modifiable fields provided." },
        { status: 400 }
      );
    }

    updates.push("updated_at = NOW()");
    values.push(id);

    await db.prepare(`
      UPDATE user_profiles
      SET ${updates.join(", ")}
      WHERE id = ?
    `).run(...values);

    const updatedUser = (await db.prepare(`
      SELECT id, email, full_name, account_type, is_verified, status, updated_at
      FROM user_profiles
      WHERE id = ?
    `).get(id)) as any;

    // Record authoritative audit trail
    await recordAuditLog({
      actor: auth.user,
      action: "PLATFORM_USER_MODIFIED",
      entityType: "user_profile",
      entityId: id,
      changeSummary: `${changes.join("; ")}${reason ? ` | Reason: ${reason}` : ""}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Platform user updated successfully.",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update platform user." },
      { status: 500 }
    );
  }
}
