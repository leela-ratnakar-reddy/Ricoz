import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/admin/db";
import { requirePermission } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("users.manage_permissions", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT 
        up.id, up.admin_user_id, up.permission_id, up.effect, up.granted_by, up.reason, up.expires_at, up.created_at,
        p.slug as permission_slug, p.name as permission_name, p.module, p.action,
        u.full_name as user_name, u.email as user_email, u.role as user_role,
        g.full_name as granted_by_name
      FROM admin_user_permissions up
      JOIN admin_permissions p ON up.permission_id = p.id
      JOIN admin_users u ON up.admin_user_id = u.id
      LEFT JOIN admin_users g ON up.granted_by = g.id
      ORDER BY up.created_at DESC
    `).all() as Array<{
      id: string;
      admin_user_id: string;
      permission_id: string;
      effect: "allow" | "deny";
      granted_by: string | null;
      reason: string;
      expires_at: string | null;
      created_at: string;
      permission_slug: string;
      permission_name: string;
      module: string;
      action: string;
      user_name: string;
      user_email: string;
      user_role: string;
      granted_by_name: string | null;
    }>;

    const overrides = rows.map((r) => ({
      id: r.id,
      adminUserId: r.admin_user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      userRole: r.user_role,
      permissionId: r.permission_id,
      permissionSlug: r.permission_slug,
      permissionName: r.permission_name,
      module: r.module,
      action: r.action,
      effect: r.effect,
      grantedBy: r.granted_by,
      grantedByName: r.granted_by_name || "System",
      reason: r.reason,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, overrides });
  } catch (error) {
    console.error("Overrides GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch permission overrides." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("users.manage_permissions", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { adminUserId, permissionSlug, effect, reason, expiresAt } = body;

    if (!adminUserId || !permissionSlug || !effect || !reason) {
      return NextResponse.json(
        { success: false, error: "adminUserId, permissionSlug, effect ('allow' | 'deny'), and reason are required." },
        { status: 422 }
      );
    }

    if (!["allow", "deny"].includes(effect)) {
      return NextResponse.json({ success: false, error: "Effect must be either 'allow' or 'deny'." }, { status: 422 });
    }

    // Prevent privilege escalation: user cannot grant permissions to themselves unless Super Admin
    if (adminUserId === auth.user.id && auth.user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Privilege escalation blocked: Cannot modify your own permission overrides." },
        { status: 403 }
      );
    }

    const db = getDb();

    // Verify user exists
    const targetUser = db.prepare("SELECT id, full_name, email FROM admin_users WHERE id = ?").get(adminUserId) as Record<string, unknown> | undefined;
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Target user not found." }, { status: 404 });
    }

    // Verify permission exists
    const perm = db.prepare("SELECT id, name FROM admin_permissions WHERE slug = ?").get(permissionSlug) as { id: string; name: string } | undefined;
    if (!perm) {
      return NextResponse.json({ success: false, error: "Specified permission slug does not exist." }, { status: 422 });
    }

    const now = new Date().toISOString();
    const overrideId = `uov-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const cleanExpiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;

    db.prepare(`
      INSERT INTO admin_user_permissions (id, admin_user_id, permission_id, effect, granted_by, reason, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(admin_user_id, permission_id) DO UPDATE SET
        effect = excluded.effect,
        granted_by = excluded.granted_by,
        reason = excluded.reason,
        expires_at = excluded.expires_at,
        created_at = excluded.created_at
    `).run(overrideId, adminUserId, perm.id, effect, auth.user.id, reason.trim(), cleanExpiresAt, now);

    recordAuditLog({
      actor: auth.user,
      action: "PERMISSION_OVERRIDE_SET",
      entityType: "admin_user_permission",
      entityId: overrideId,
      changeSummary: `Set ${effect.toUpperCase()} override on '${permissionSlug}' for ${targetUser.email}. Reason: ${reason}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: `Permission override (${effect.toUpperCase()}) applied successfully.`,
      overrideId,
    });
  } catch (error) {
    console.error("Overrides POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to apply permission override." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission("users.manage_permissions", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Override ID is required." }, { status: 422 });
    }

    const db = getDb();
    const existing = db.prepare(`
      SELECT up.id, u.email, p.slug as permission_slug
      FROM admin_user_permissions up
      JOIN admin_users u ON up.admin_user_id = u.id
      JOIN admin_permissions p ON up.permission_id = p.id
      WHERE up.id = ?
    `).get(id) as Record<string, unknown> | undefined;

    if (!existing) {
      return NextResponse.json({ success: false, error: "Override not found." }, { status: 404 });
    }

    db.prepare("DELETE FROM admin_user_permissions WHERE id = ?").run(id);

    recordAuditLog({
      actor: auth.user,
      action: "PERMISSION_OVERRIDE_REMOVED",
      entityType: "admin_user_permission",
      entityId: id,
      changeSummary: `Revoked permission override on '${existing.permission_slug}' for ${existing.email}.`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Permission override removed successfully." });
  } catch (error) {
    console.error("Overrides DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete permission override." }, { status: 500 });
  }
}
