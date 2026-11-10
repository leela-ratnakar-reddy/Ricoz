import { getDb } from "./db";
import { AdminUser, AdminRole, AdminPermission, AdminRoleDef, AdminUserPermissionOverride, AdminDepartmentMember } from "./types";

export interface PermissionContext {
  departmentId?: string | null;
  resourceOwnerId?: string | null;
}

/**
 * Loads all permissions granted to a user, taking into account:
 * 1. Base role permissions from `admin_role_permissions`
 * 2. Active user-level permission overrides from `admin_user_permissions` (with explicit allow / deny precedence)
 */
export function loadUserPermissions(userId: string, roleSlug: string): {
  permissions: string[];
  overrides: AdminUserPermissionOverride[];
} {
  const db = getDb();
  const now = new Date().toISOString();

  // 1. Fetch base role permissions
  const rolePermRows = db.prepare(`
    SELECT p.slug
    FROM admin_role_permissions rp
    JOIN admin_roles r ON rp.role_id = r.id
    JOIN admin_permissions p ON rp.permission_id = p.id
    WHERE r.slug = ? AND r.is_active = 1
  `).all(roleSlug) as Array<{ slug: string }>;

  const grantedSet = new Set<string>(rolePermRows.map((r) => r.slug));

  // 2. Fetch active user-level overrides
  const overrideRows = db.prepare(`
    SELECT 
      up.id, up.admin_user_id, up.permission_id, up.effect, up.granted_by, up.reason, up.expires_at, up.created_at,
      p.slug as permission_slug, p.name as permission_name, p.module, p.action,
      u.full_name as granted_by_name
    FROM admin_user_permissions up
    JOIN admin_permissions p ON up.permission_id = p.id
    LEFT JOIN admin_users u ON up.granted_by = u.id
    WHERE up.admin_user_id = ?
  `).all(userId) as Array<{
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
    granted_by_name: string | null;
  }>;

  const overrides: AdminUserPermissionOverride[] = [];

  for (const row of overrideRows) {
    const isExpired = row.expires_at !== null && row.expires_at <= now;
    if (isExpired) {
      continue; // Expired overrides are strictly ignored
    }

    overrides.push({
      id: row.id,
      adminUserId: row.admin_user_id,
      permissionId: row.permission_id,
      permissionSlug: row.permission_slug,
      permissionName: row.permission_name,
      module: row.module,
      action: row.action,
      effect: row.effect,
      grantedBy: row.granted_by,
      grantedByName: row.granted_by_name || undefined,
      reason: row.reason,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    });

    if (row.effect === "deny") {
      // Explicit deny overrides inherited role permissions
      grantedSet.delete(row.permission_slug);
    } else if (row.effect === "allow") {
      // Explicit allow grants permission
      grantedSet.add(row.permission_slug);
    }
  }

  return {
    permissions: Array.from(grantedSet),
    overrides,
  };
}

/**
 * Loads department memberships for a user
 */
export function loadUserDepartmentMemberships(userId: string): AdminDepartmentMember[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT 
      dm.id, dm.admin_user_id, dm.department_id, dm.membership_role, dm.is_primary, dm.created_at,
      d.name as department_name,
      u.full_name as user_name, u.email as user_email, u.role as user_role
    FROM admin_department_members dm
    JOIN departments d ON dm.department_id = d.id
    JOIN admin_users u ON dm.admin_user_id = u.id
    WHERE dm.admin_user_id = ?
  `).all(userId) as Array<{
    id: string;
    admin_user_id: string;
    department_id: string;
    membership_role: "head" | "manager" | "member" | "observer";
    is_primary: number;
    created_at: string;
    department_name: string;
    user_name: string;
    user_email: string;
    user_role: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    adminUserId: r.admin_user_id,
    departmentId: r.department_id,
    membershipRole: r.membership_role,
    isPrimary: Boolean(r.is_primary),
    createdAt: r.created_at,
    departmentName: r.department_name,
    userName: r.user_name,
    userEmail: r.user_email,
    userRole: r.user_role,
  }));
}

/**
 * Evaluates whether an administrative user or role has the requested permission under optional department / data scope context.
 * Supports both AdminUser objects and legacy role slug strings.
 */
export function hasPermission(
  userOrRole: AdminUser | AdminRole | string | null | undefined,
  permissionSlug: string,
  context?: PermissionContext
): boolean {
  if (!userOrRole) {
    return false;
  }

  // Handle legacy string role call e.g. hasPermission("super_admin", "manage_users")
  if (typeof userOrRole === "string") {
    const roleSlug = userOrRole.toLowerCase();
    if (roleSlug === "super_admin") return true;

    // Check modern DB permissions first
    const db = getDb();
    const permRow = db.prepare(`
      SELECT 1 FROM admin_role_permissions rp
      JOIN admin_roles r ON rp.role_id = r.id
      JOIN admin_permissions p ON rp.permission_id = p.id
      WHERE r.slug = ? AND p.slug = ?
    `).get(roleSlug, permissionSlug);

    if (permRow) return true;

    // Check legacy permission alias mappings
    const legacyPermMap: Record<string, string[]> = {
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

    const allowedRoles = legacyPermMap[permissionSlug];
    return allowedRoles ? allowedRoles.includes(roleSlug) : false;
  }

  const user = userOrRole as AdminUser;
  if (user.status !== "active") {
    return false;
  }

  // Super Admin / Owner has unrestricted global access
  if (user.role === "super_admin") {
    return true;
  }

  // 1. Check user-level overrides for explicit deny (highest precedence)
  if (user.permissionOverrides) {
    const denyOverride = user.permissionOverrides.find(
      (o) => o.permissionSlug === permissionSlug && o.effect === "deny"
    );
    if (denyOverride) {
      return false;
    }
  }

  // 2. Check if permission exists in user's permissions
  let hasBasePermission = false;
  if (user.permissions && Array.isArray(user.permissions)) {
    hasBasePermission = user.permissions.includes(permissionSlug);
  } else {
    // If user object didn't have preloaded permissions, query DB
    const { permissions } = loadUserPermissions(user.id, user.role);
    hasBasePermission = permissions.includes(permissionSlug);
  }

  if (!hasBasePermission) {
    return false;
  }

  // 3. Department-based Access Boundaries
  if (context?.departmentId) {
    // Executive roles have cross-department operational oversight
    const crossDeptRoles = ["super_admin", "exec_director", "coo", "auditor"];
    if (crossDeptRoles.includes(user.role)) {
      return true;
    }

    // Check if the target department is user's primary department
    if (user.departmentId === context.departmentId) {
      return true;
    }

    // Check if user is a member/head of that department in admin_department_members
    const memberships = user.departmentMemberships || loadUserDepartmentMemberships(user.id);
    const isMember = memberships.some((m) => m.departmentId === context.departmentId);
    if (!isMember) {
      // User is attempting to access a department they do not belong to
      return false;
    }
  }

  return true;
}

/**
 * Retrieves the complete catalogue of granular permissions
 */
export function getAllPermissions(): AdminPermission[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, name, slug, description, module, action, created_at
    FROM admin_permissions
    ORDER BY module ASC, slug ASC
  `).all() as Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    module: string;
    action: string;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    module: r.module,
    action: r.action,
    createdAt: r.created_at,
  }));
}

/**
 * Retrieves all defined administrative roles with their assigned permissions
 */
export function getAllRoles(): AdminRoleDef[] {
  const db = getDb();
  const roles = db.prepare(`
    SELECT 
      r.id, r.name, r.slug, r.description, r.hierarchy_level, r.is_system_role, r.is_active, r.created_at, r.updated_at,
      COUNT(DISTINCT u.id) as user_count
    FROM admin_roles r
    LEFT JOIN admin_users u ON r.slug = u.role
    GROUP BY r.id
    ORDER BY r.hierarchy_level ASC
  `).all() as Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    hierarchy_level: number;
    is_system_role: number;
    is_active: number;
    created_at: string;
    updated_at: string;
    user_count: number;
  }>;

  const rolePermMap = new Map<string, string[]>();
  const rolePerms = db.prepare(`
    SELECT rp.role_id, p.slug
    FROM admin_role_permissions rp
    JOIN admin_permissions p ON rp.permission_id = p.id
  `).all() as Array<{ role_id: string; slug: string }>;

  for (const rp of rolePerms) {
    if (!rolePermMap.has(rp.role_id)) {
      rolePermMap.set(rp.role_id, []);
    }
    rolePermMap.get(rp.role_id)!.push(rp.slug);
  }

  return roles.map((r) => {
    const perms = rolePermMap.get(r.id) || [];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      hierarchyLevel: r.hierarchy_level,
      isSystemRole: Boolean(r.is_system_role),
      isActive: Boolean(r.is_active),
      permissions: perms,
      permissionCount: perms.length,
      userCount: r.user_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });
}
