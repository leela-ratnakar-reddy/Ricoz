import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/admin/db";
import { requirePermission, revokeAllUserSessions } from "@/lib/admin/auth";
import { loadUserDepartmentMemberships, loadUserPermissions } from "@/lib/admin/permissions";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("users.view", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { id } = await params;
    const db = getDb();

    const userRow = db.prepare(`
      SELECT 
        u.id, u.email, u.full_name, u.role, u.department_id, u.status, u.avatar, u.last_login_at, u.created_at,
        d.name as department_name,
        r.name as role_name, r.hierarchy_level
      FROM admin_users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN admin_roles r ON u.role = r.slug
      WHERE u.id = ?
    `).get(id) as Record<string, unknown> | undefined;

    if (!userRow) {
      return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
    }

    const { permissions, overrides } = loadUserPermissions(id, String(userRow.role));
    const departmentMemberships = loadUserDepartmentMemberships(id);

    const sessions = db.prepare(`
      SELECT id, ip_address, user_agent, expires_at, last_activity_at, created_at
      FROM admin_sessions
      WHERE user_id = ? AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `).all(id);

    return NextResponse.json({
      success: true,
      user: {
        id: String(userRow.id),
        email: String(userRow.email),
        fullName: String(userRow.full_name),
        role: String(userRow.role),
        roleName: String(userRow.role_name || userRow.role),
        hierarchyLevel: userRow.hierarchy_level ?? 99,
        departmentId: userRow.department_id ? String(userRow.department_id) : null,
        departmentName: userRow.department_name ? String(userRow.department_name) : "Unassigned",
        status: String(userRow.status),
        avatar: String(userRow.avatar),
        lastLoginAt: userRow.last_login_at ? String(userRow.last_login_at) : null,
        createdAt: String(userRow.created_at),
        permissions,
        permissionOverrides: overrides,
        departmentMemberships,
        activeSessions: sessions,
      },
    });
  } catch (error) {
    console.error("Team user detail GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user details." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("users.edit", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const { fullName, role, departmentId, status } = body;

    const db = getDb();
    const targetUser = db.prepare("SELECT * FROM admin_users WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
    }

    // Role change validation
    if (role && role !== targetUser.role) {
      if (auth.user.role !== "super_admin") {
        return NextResponse.json(
          { success: false, error: "Privilege violation: Only Super Admin can reassign organizational roles." },
          { status: 403 }
        );
      }
      // Check target role exists
      const roleExists = db.prepare("SELECT id FROM admin_roles WHERE slug = ?").get(role);
      if (!roleExists) {
        return NextResponse.json({ success: false, error: "Target role does not exist." }, { status: 422 });
      }
    }

    // Status change validation (suspension/activation)
    if (status && status !== targetUser.status) {
      if (targetUser.id === auth.user.id) {
        return NextResponse.json({ success: false, error: "Self-suspension is strictly prohibited." }, { status: 403 });
      }
      if (status === "suspended") {
        // Immediately revoke all active sessions for suspended user
        revokeAllUserSessions(id);
      }
    }

    const updatedFullName = fullName !== undefined ? String(fullName).trim() : String(targetUser.full_name);
    const updatedRole = role !== undefined ? String(role) : String(targetUser.role);
    const updatedDeptId: string | null = departmentId !== undefined 
      ? (departmentId ? String(departmentId) : null) 
      : (targetUser.department_id ? String(targetUser.department_id) : null);
    const updatedStatus = status !== undefined ? String(status) : String(targetUser.status);

    db.prepare(`
      UPDATE admin_users
      SET full_name = ?, role = ?, department_id = ?, status = ?
      WHERE id = ?
    `).run(updatedFullName, updatedRole, updatedDeptId, updatedStatus, id);

    // Update primary department membership if department changed
    if (departmentId !== undefined && departmentId !== targetUser.department_id) {
      const now = new Date().toISOString();
      if (updatedDeptId) {
        db.prepare(`
          INSERT INTO admin_department_members (id, admin_user_id, department_id, membership_role, is_primary, created_at)
          VALUES (?, ?, ?, 'member', 1, ?)
          ON CONFLICT(admin_user_id, department_id) DO UPDATE SET is_primary = 1
        `).run(`dmem-${id}-${updatedDeptId}`, id, updatedDeptId, now);

        // Mark previous department memberships as non-primary
        db.prepare("UPDATE admin_department_members SET is_primary = 0 WHERE admin_user_id = ? AND department_id != ?").run(id, updatedDeptId);
      } else {
        db.prepare("UPDATE admin_department_members SET is_primary = 0 WHERE admin_user_id = ?").run(id);
      }
    }

    recordAuditLog({
      actor: auth.user,
      action: "USER_UPDATE",
      entityType: "admin_user",
      entityId: id,
      changeSummary: `Updated team member ${targetUser.email} (Role: ${updatedRole}, Status: ${updatedStatus}, Dept: ${updatedDeptId || "none"}).`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Team member updated successfully.",
    });
  } catch (error) {
    console.error("Team user PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update team member." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("users.suspend", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { id } = await params;
    if (id === auth.user.id) {
      return NextResponse.json({ success: false, error: "Cannot delete your own administrative account." }, { status: 403 });
    }

    const db = getDb();
    const targetUser = db.prepare("SELECT * FROM admin_users WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
    }

    if (targetUser.role === "super_admin" && auth.user.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Cannot delete a Super Admin account." }, { status: 403 });
    }

    // Revoke sessions first
    revokeAllUserSessions(id);

    // Delete user (cascade removes memberships, sessions, overrides)
    db.prepare("DELETE FROM admin_users WHERE id = ?").run(id);

    recordAuditLog({
      actor: auth.user,
      action: "USER_DELETE",
      entityType: "admin_user",
      entityId: id,
      changeSummary: `Deleted administrative user ${targetUser.email} (${targetUser.role}).`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Team member deleted successfully." });
  } catch (error) {
    console.error("Team user DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete team member." }, { status: 500 });
  }
}
