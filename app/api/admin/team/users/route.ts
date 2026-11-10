import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb, hashPassword } from "@/lib/admin/db";
import { requirePermission } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("users.view", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT 
        u.id, u.email, u.full_name, u.role, u.department_id, u.status, u.avatar, u.last_login_at, u.created_at,
        d.name as department_name,
        r.name as role_name, r.hierarchy_level,
        (SELECT COUNT(*) FROM admin_sessions s WHERE s.user_id = u.id AND s.expires_at > datetime('now')) as active_sessions_count,
        (SELECT COUNT(*) FROM admin_user_permissions up WHERE up.admin_user_id = u.id) as overrides_count
      FROM admin_users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN admin_roles r ON u.role = r.slug
      ORDER BY r.hierarchy_level ASC, u.full_name ASC
    `).all() as Array<{
      id: string;
      email: string;
      full_name: string;
      role: string;
      department_id: string | null;
      status: string;
      avatar: string;
      last_login_at: string | null;
      created_at: string;
      department_name: string | null;
      role_name: string | null;
      hierarchy_level: number | null;
      active_sessions_count: number;
      overrides_count: number;
    }>;

    const users = rows.map((r) => ({
      id: r.id,
      email: r.email,
      fullName: r.full_name,
      role: r.role,
      roleName: r.role_name || r.role,
      hierarchyLevel: r.hierarchy_level ?? 99,
      departmentId: r.department_id,
      departmentName: r.department_name || "Unassigned",
      status: r.status,
      avatar: r.avatar,
      lastLoginAt: r.last_login_at,
      createdAt: r.created_at,
      activeSessionsCount: r.active_sessions_count,
      overridesCount: r.overrides_count,
    }));

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Team users GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch team members." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("users.create", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { email, fullName, role, departmentId, password } = body;

    if (!email || !fullName || !role || !password) {
      return NextResponse.json(
        { success: false, error: "Email, Full Name, Role, and Temporary Password are required." },
        { status: 422 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 422 }
      );
    }

    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();

    // Check email uniqueness
    const existing = db.prepare("SELECT id FROM admin_users WHERE LOWER(email) = ?").get(normalizedEmail);
    if (existing) {
      return NextResponse.json({ success: false, error: "A team member with this email already exists." }, { status: 409 });
    }

    // Verify role exists
    const roleRow = db.prepare("SELECT id, hierarchy_level FROM admin_roles WHERE slug = ? AND is_active = 1").get(role) as { id: string; hierarchy_level: number } | undefined;
    if (!roleRow) {
      return NextResponse.json({ success: false, error: "Specified role is invalid or inactive." }, { status: 422 });
    }

    // Prevent privilege escalation: user cannot assign a role higher or equal to their own unless Super Admin
    if (auth.user.role !== "super_admin") {
      const actorRole = db.prepare("SELECT hierarchy_level FROM admin_roles WHERE slug = ?").get(auth.user.role) as { hierarchy_level: number } | undefined;
      const actorLevel = actorRole?.hierarchy_level ?? 99;
      if (roleRow.hierarchy_level <= actorLevel) {
        return NextResponse.json(
          { success: false, error: "Privilege escalation blocked: Cannot create user with equal or higher authority." },
          { status: 403 }
        );
      }
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const initials = fullName
      .split(" ")
      .map((p: string) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, salt, full_name, role, department_id, status, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(userId, normalizedEmail, hash, salt, fullName.trim(), role, departmentId || null, initials, now);

    // If departmentId assigned, register primary department membership
    if (departmentId) {
      db.prepare(`
        INSERT INTO admin_department_members (id, admin_user_id, department_id, membership_role, is_primary, created_at)
        VALUES (?, ?, ?, 'member', 1, ?)
      `).run(`dmem-${userId}-${departmentId}`, userId, departmentId, now);
    }

    recordAuditLog({
      actor: auth.user,
      action: "USER_CREATE",
      entityType: "admin_user",
      entityId: userId,
      changeSummary: `Created team member ${fullName} (${role}) in department ${departmentId || "unassigned"}.`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Team member provisioned successfully.",
      user: {
        id: userId,
        email: normalizedEmail,
        fullName: fullName.trim(),
        role,
        departmentId: departmentId || null,
        status: "active",
      },
    });
  } catch (error) {
    console.error("Team user POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create team member." }, { status: 500 });
  }
}
