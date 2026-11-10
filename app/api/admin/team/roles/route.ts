import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/admin/db";
import { requirePermission, requireSuperAdmin } from "@/lib/admin/auth";
import { getAllRoles } from "@/lib/admin/permissions";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("users.view", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const roles = getAllRoles();
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    console.error("Roles GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch roles." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { roleId, permissionSlugs } = body;

    if (!roleId || !Array.isArray(permissionSlugs)) {
      return NextResponse.json({ success: false, error: "roleId and permissionSlugs array are required." }, { status: 422 });
    }

    const db = getDb();
    const role = db.prepare("SELECT * FROM admin_roles WHERE id = ?").get(roleId) as Record<string, unknown> | undefined;
    if (!role) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    if (role.slug === "super_admin") {
      return NextResponse.json({ success: false, error: "Super Admin permissions cannot be modified." }, { status: 403 });
    }

    const now = new Date().toISOString();

    db.exec("BEGIN TRANSACTION;");
    try {
      // Remove existing permissions for this role
      db.prepare("DELETE FROM admin_role_permissions WHERE role_id = ?").run(roleId);

      // Re-assign specified permissions
      const insertStmt = db.prepare(`
        INSERT INTO admin_role_permissions (id, role_id, permission_id, created_at)
        SELECT ?, ?, id, ?
        FROM admin_permissions
        WHERE slug = ?
      `);

      for (const slug of permissionSlugs) {
        const id = `rp-${role.slug}-${String(slug).replace(/[^a-z0-9]/g, "-")}`;
        insertStmt.run(id, roleId, now, slug);
      }

      db.prepare("UPDATE admin_roles SET updated_at = ? WHERE id = ?").run(now, roleId);
      db.exec("COMMIT;");
    } catch (txErr) {
      db.exec("ROLLBACK;");
      throw txErr;
    }

    recordAuditLog({
      actor: auth.user,
      action: "ROLE_PERMISSIONS_UPDATE",
      entityType: "admin_role",
      entityId: roleId,
      changeSummary: `Updated permissions for role ${role.name} (${permissionSlugs.length} permissions assigned).`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: `Permissions updated for role ${role.name}.`,
    });
  } catch (error) {
    console.error("Roles PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update role permissions." }, { status: 500 });
  }
}
