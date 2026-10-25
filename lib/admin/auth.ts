import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getDb, verifyPassword } from "./db";
import { AdminUser, AdminRole } from "./types";
import { recordAuditLog } from "./audit";

export const SESSION_COOKIE_NAME = "ricoz_admin_session";
export const SESSION_DURATION_HOURS = 24 * 7; // 7 days

export function createAdminSession(
  userId: string,
  ipAddress: string = "127.0.0.1",
  userAgent: string = "browser"
): { token: string; expiresAt: string } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 3600 * 1000).toISOString();
  const now = new Date().toISOString();
  const sessionId = `ses-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  const insert = db.prepare(`
    INSERT INTO admin_sessions (id, user_id, session_token, expires_at, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(sessionId, userId, token, expiresAt, ipAddress, userAgent, now);

  // Update user last login
  db.prepare("UPDATE admin_users SET last_login_at = ? WHERE id = ?").run(now, userId);

  return { token, expiresAt };
}

export function validateAdminSession(token: string): AdminUser | null {
  if (!token || typeof token !== "string") return null;

  try {
    const db = getDb();
    const now = new Date().toISOString();

    const row = db.prepare(`
      SELECT 
        u.id, u.email, u.full_name, u.role, u.department_id, u.status, u.avatar, u.last_login_at, u.created_at,
        d.name as department_name,
        s.expires_at
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE s.session_token = ? AND s.expires_at > ?
    `).get(token, now) as Record<string, unknown> | undefined;

    if (!row) return null;
    if (row.status !== "active") return null;

    return {
      id: String(row.id),
      email: String(row.email),
      fullName: String(row.full_name),
      role: row.role as AdminRole,
      departmentId: row.department_id ? String(row.department_id) : null,
      departmentName: row.department_name ? String(row.department_name) : undefined,
      status: "active",
      avatar: String(row.avatar),
      lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
      createdAt: String(row.created_at),
    };
  } catch (err) {
    console.error("Error validating admin session:", err);
    return null;
  }
}

export function destroyAdminSession(token: string): void {
  try {
    const db = getDb();
    db.prepare("DELETE FROM admin_sessions WHERE session_token = ?").run(token);
  } catch (err) {
    console.error("Error destroying admin session:", err);
  }
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return null;
    return validateAdminSession(sessionCookie.value);
  } catch {
    return null;
  }
}

export function getAdminUserFromRequest(req: NextRequest): AdminUser | null {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return null;
  return validateAdminSession(sessionCookie.value);
}

// RBAC Permissions Mapping
export const PERMISSIONS: Record<string, AdminRole[]> = {
  // Global
  manage_users: ["super_admin"],
  view_audit_log: ["super_admin", "ops_admin", "auditor"],
  view_reports: ["super_admin", "ops_admin", "dept_manager", "auditor"],
  export_reports: ["super_admin", "ops_admin", "auditor"],

  // Operations & Workflows
  manage_all_tasks: ["super_admin", "ops_admin"],
  manage_dept_tasks: ["super_admin", "ops_admin", "dept_manager"],
  update_task_status: ["super_admin", "ops_admin", "dept_manager", "team_member"],
  delete_tasks: ["super_admin", "ops_admin"],

  // Clients & CRM
  view_clients: ["super_admin", "ops_admin", "dept_manager", "auditor", "team_member"],
  edit_clients: ["super_admin", "ops_admin", "dept_manager"],
  delete_clients: ["super_admin"],

  // Vendors & Partners
  view_vendors: ["super_admin", "ops_admin", "dept_manager", "auditor", "team_member"],
  edit_vendors: ["super_admin", "ops_admin", "dept_manager"],
  verify_vendors: ["super_admin", "ops_admin"], // Verification strict gate
  delete_vendors: ["super_admin"],

  // Support Tickets
  manage_tickets: ["super_admin", "ops_admin", "dept_manager", "team_member"],
  escalate_tickets: ["super_admin", "ops_admin", "dept_manager", "team_member"],
  resolve_tickets: ["super_admin", "ops_admin", "dept_manager"],

  // SOPs & Documents
  view_sops: ["super_admin", "ops_admin", "dept_manager", "team_member", "auditor"],
  manage_sops: ["super_admin", "ops_admin", "dept_manager"],
};

export function hasPermission(role: AdminRole, permission: string): boolean {
  if (role === "super_admin") return true;
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

export function authenticateAdminCredentials(email: string, password: string): AdminUser | null {
  if (!email || !password) return null;
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT 
        u.id, u.email, u.password_hash, u.salt, u.full_name, u.role, u.department_id, u.status, u.avatar, u.last_login_at, u.created_at,
        d.name as department_name
      FROM admin_users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE LOWER(u.email) = LOWER(?)
    `).get(email.trim()) as Record<string, unknown> | undefined;

    if (!row) return null;
    if (row.status !== "active") return null;

    const isValid = verifyPassword(password, String(row.password_hash), String(row.salt));
    if (!isValid) return null;

    return {
      id: String(row.id),
      email: String(row.email),
      fullName: String(row.full_name),
      role: row.role as AdminRole,
      departmentId: row.department_id ? String(row.department_id) : null,
      departmentName: row.department_name ? String(row.department_name) : undefined,
      status: "active",
      avatar: String(row.avatar),
      lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
      createdAt: String(row.created_at),
    };
  } catch (err) {
    console.error("Error authenticating admin credentials:", err);
    return null;
  }
}
