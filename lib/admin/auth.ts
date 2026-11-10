import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb, verifyPassword } from "./db";
import { AdminUser, AdminRole } from "./types";
import { loadUserPermissions, loadUserDepartmentMemberships, hasPermission, PermissionContext } from "./permissions";
import { verifyCsrfOrigin } from "./csrf";

export { hasPermission };

export const PERMISSIONS: Record<string, AdminRole[]> = {
  manage_users: ["super_admin"],
  view_audit_log: ["super_admin", "ops_admin", "auditor"],
  view_reports: ["super_admin", "ops_admin", "dept_manager", "auditor"],
  export_reports: ["super_admin", "ops_admin", "auditor"],
  manage_all_tasks: ["super_admin", "ops_admin"],
  manage_dept_tasks: ["super_admin", "ops_admin", "dept_manager"],
  update_task_status: ["super_admin", "ops_admin", "dept_manager", "team_member"],
  delete_tasks: ["super_admin", "ops_admin"],
  view_clients: ["super_admin", "ops_admin", "dept_manager", "auditor", "team_member"],
  edit_clients: ["super_admin", "ops_admin", "dept_manager"],
  delete_clients: ["super_admin"],
  view_vendors: ["super_admin", "ops_admin", "dept_manager", "auditor", "team_member"],
  edit_vendors: ["super_admin", "ops_admin", "dept_manager"],
  verify_vendors: ["super_admin", "ops_admin"],
  delete_vendors: ["super_admin"],
  manage_tickets: ["super_admin", "ops_admin", "dept_manager", "team_member"],
  escalate_tickets: ["super_admin", "ops_admin", "dept_manager", "team_member"],
  resolve_tickets: ["super_admin", "ops_admin", "dept_manager"],
  view_sops: ["super_admin", "ops_admin", "dept_manager", "team_member", "auditor"],
  manage_sops: ["super_admin", "ops_admin", "dept_manager"],
};

export const SESSION_COOKIE_NAME = "ricoz_admin_session";
export const SESSION_MAX_LIFETIME_HOURS = 24 * 7; // 7 days maximum session lifetime
export const SESSION_IDLE_TIMEOUT_MINUTES = 60; // 60 minutes idle timeout
export const ACTIVITY_THROTTLE_MS = 5 * 60 * 1000; // 5-minute activity update interval

export function createAdminSession(
  userId: string,
  ipAddress: string = "127.0.0.1",
  userAgent: string = "browser"
): { token: string; expiresAt: string } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_MAX_LIFETIME_HOURS * 3600 * 1000).toISOString();
  const sessionId = `ses-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  const insert = db.prepare(`
    INSERT INTO admin_sessions (id, user_id, session_token, expires_at, last_activity_at, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(sessionId, userId, token, expiresAt, now, ipAddress, userAgent, now);

  // Update user last login
  db.prepare("UPDATE admin_users SET last_login_at = ? WHERE id = ?").run(now, userId);

  return { token, expiresAt };
}

export function validateAdminSession(token: string): AdminUser | null {
  if (!token || typeof token !== "string" || token.length < 16) return null;

  try {
    const db = getDb();
    const now = new Date().toISOString();

    const row = db.prepare(`
      SELECT 
        u.id, u.email, u.full_name, u.role, u.department_id, u.status, u.avatar, u.last_login_at, u.created_at,
        d.name as department_name,
        s.id as session_id, s.expires_at, s.last_activity_at, s.created_at as session_created_at
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE s.session_token = ? AND s.expires_at > ?
    `).get(token, now) as Record<string, unknown> | undefined;

    if (!row) return null;
    if (row.status !== "active") return null;

    // Check 60-Minute Sliding Idle Timeout
    const lastActivityStr = (row.last_activity_at as string) || (row.session_created_at as string);
    if (lastActivityStr) {
      const lastActivityTime = new Date(lastActivityStr).getTime();
      const idleElapsedMinutes = (Date.now() - lastActivityTime) / (60 * 1000);

      if (idleElapsedMinutes > SESSION_IDLE_TIMEOUT_MINUTES) {
        // Invalidate idle session
        destroyAdminSession(token);
        return null;
      }

      // Throttle updating last_activity_at to avoid database write amplification
      if (Date.now() - lastActivityTime > ACTIVITY_THROTTLE_MS) {
        try {
          db.prepare("UPDATE admin_sessions SET last_activity_at = ? WHERE session_token = ?").run(now, token);
        } catch {
          // Non-blocking write
        }
      }
    }

    const userId = String(row.id);
    const roleSlug = String(row.role);

    // Load granular permissions and active overrides from DB
    const { permissions, overrides } = loadUserPermissions(userId, roleSlug);
    const departmentMemberships = loadUserDepartmentMemberships(userId);

    return {
      id: userId,
      email: String(row.email),
      fullName: String(row.full_name),
      role: roleSlug as AdminRole,
      departmentId: row.department_id ? String(row.department_id) : null,
      departmentName: row.department_name ? String(row.department_name) : undefined,
      status: "active",
      avatar: String(row.avatar),
      lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
      createdAt: String(row.created_at),
      permissions,
      permissionOverrides: overrides,
      departmentMemberships,
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

export function revokeSessionById(sessionId: string): boolean {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM admin_sessions WHERE id = ?").run(sessionId);
    return Number(result.changes) > 0;
  } catch (err) {
    console.error("Error revoking session by id:", err);
    return false;
  }
}

export function revokeAllUserSessions(userId: string): number {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(userId);
    return Number(result.changes);
  } catch (err) {
    console.error("Error revoking all user sessions:", err);
    return 0;
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

export const getCurrentAdmin = getCurrentAdminUser;

export function getAdminUserFromRequest(req: NextRequest): AdminUser | null {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return null;
  return validateAdminSession(sessionCookie.value);
}

/**
 * Server-side Guard: Validates that the request has an active, authenticated admin user.
 * Automatically performs CSRF Origin verification for state-changing HTTP methods.
 */
export async function requireAdmin(
  req?: NextRequest
): Promise<{ user: AdminUser } | { errorResponse: NextResponse }> {
  if (req) {
    const csrfCheck = verifyCsrfOrigin(req);
    if (!csrfCheck.valid) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: csrfCheck.error || "Cross-site request forgery protection triggered" },
          { status: 403 }
        ),
      };
    }
  }

  const user = req ? getAdminUserFromRequest(req) : await getCurrentAdminUser();
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required or session expired" },
        { status: 401 }
      ),
    };
  }

  return { user };
}

/**
 * Server-side Guard: Validates authentication AND the specified granular permission.
 */
export async function requirePermission(
  permission: string,
  req?: NextRequest,
  context?: PermissionContext
): Promise<{ user: AdminUser } | { errorResponse: NextResponse }> {
  const authResult = await requireAdmin(req);
  if ("errorResponse" in authResult) {
    return authResult;
  }

  const { user } = authResult;
  const isAllowed = hasPermission(user, permission, context);

  if (!isAllowed) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `Access Denied: Missing required permission '${permission}'`,
          requiredPermission: permission,
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Server-side Guard: Validates department access boundary
 */
export async function requireDepartmentAccess(
  departmentId: string,
  req?: NextRequest
): Promise<{ user: AdminUser } | { errorResponse: NextResponse }> {
  const authResult = await requireAdmin(req);
  if ("errorResponse" in authResult) {
    return authResult;
  }

  const { user } = authResult;
  // Global roles have cross-department oversight
  if (["super_admin", "exec_director", "coo", "auditor"].includes(user.role)) {
    return { user };
  }

  // Check primary department or department membership
  const isPrimary = user.departmentId === departmentId;
  const isMember = user.departmentMemberships?.some((m) => m.departmentId === departmentId);

  if (!isPrimary && !isMember) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Access Denied: You do not have operational clearance for this department" },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Server-side Guard: Validates Super Admin / Owner role
 */
export async function requireSuperAdmin(
  req?: NextRequest
): Promise<{ user: AdminUser } | { errorResponse: NextResponse }> {
  const authResult = await requireAdmin(req);
  if ("errorResponse" in authResult) {
    return authResult;
  }

  const { user } = authResult;
  if (user.role !== "super_admin") {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Access Denied: Unrestricted Owner / Super Admin privilege required" },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export function authenticateAdminCredentials(email: string, password: string): AdminUser | null {
  if (!email || !password) return null;
  try {
    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();

    const row = db.prepare(`
      SELECT 
        u.id, u.email, u.password_hash, u.salt, u.full_name, u.role, u.department_id, u.status, u.avatar, u.last_login_at, u.created_at,
        d.name as department_name
      FROM admin_users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE LOWER(u.email) = ?
    `).get(normalizedEmail) as Record<string, unknown> | undefined;

    if (!row) return null;
    if (row.status !== "active") return null;

    const isValid = verifyPassword(password, String(row.password_hash), String(row.salt));
    if (!isValid) return null;

    const userId = String(row.id);
    const roleSlug = String(row.role);
    const { permissions, overrides } = loadUserPermissions(userId, roleSlug);
    const departmentMemberships = loadUserDepartmentMemberships(userId);

    return {
      id: userId,
      email: String(row.email),
      fullName: String(row.full_name),
      role: roleSlug as AdminRole,
      departmentId: row.department_id ? String(row.department_id) : null,
      departmentName: row.department_name ? String(row.department_name) : undefined,
      status: "active",
      avatar: String(row.avatar),
      lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
      createdAt: String(row.created_at),
      permissions,
      permissionOverrides: overrides,
      departmentMemberships,
    };
  } catch (err) {
    console.error("Error authenticating admin credentials:", err);
    return null;
  }
}
