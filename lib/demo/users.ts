/**
 * RICOZ Admin — Frontend Demo Users & Governance Service
 */

import {
  AdminUser,
  AdminRoleDef,
  AdminPermission,
  AdminUserPermissionOverride,
  AdminDepartmentMember,
} from "@/lib/admin/types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage";
import {
  DEFAULT_USERS,
  DEFAULT_ROLES,
  DEFAULT_PERMISSIONS,
  DEFAULT_OVERRIDES,
  DEFAULT_DEPARTMENTS,
  DEFAULT_DEPARTMENT_MEMBERS,
} from "./seedData";
import { logAuditEvent } from "./audit";

export function getUsers(filter?: {
  departmentId?: string;
  role?: string;
  status?: string;
  search?: string;
}): AdminUser[] {
  let users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const depts = getStorageItem<typeof DEFAULT_DEPARTMENTS>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  const members = getStorageItem<AdminDepartmentMember[]>(STORAGE_KEYS.DEPARTMENT_MEMBERS, DEFAULT_DEPARTMENT_MEMBERS);
  const overrides = getStorageItem<AdminUserPermissionOverride[]>(STORAGE_KEYS.OVERRIDES, DEFAULT_OVERRIDES);

  // Populate department names & memberships
  users = users.map((u) => {
    const d = depts.find((dept) => dept.id === u.departmentId);
    const userMemberships = members.filter((m) => m.adminUserId === u.id);
    const userOverrides = overrides.filter((o) => o.adminUserId === u.id);

    return {
      ...u,
      departmentName: d ? d.name : u.departmentName || "Unassigned",
      departmentMemberships: userMemberships,
      permissionOverrides: userOverrides,
    };
  });

  if (filter?.departmentId) {
    users = users.filter((u) => u.departmentId === filter.departmentId);
  }

  if (filter?.role) {
    users = users.filter((u) => u.role === filter.role);
  }

  if (filter?.status) {
    users = users.filter((u) => u.status === filter.status);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    users = users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }

  return users;
}

export function getUserById(id: string): AdminUser | null {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function createUser(data: {
  fullName: string;
  email: string;
  role: AdminUser["role"];
  departmentId?: string | null;
  password?: string;
}): AdminUser {
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const depts = getStorageItem<typeof DEFAULT_DEPARTMENTS>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);

  const d = depts.find((dept) => dept.id === data.departmentId);
  const initials = data.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "U";

  const newUser: AdminUser = {
    id: `usr-${Date.now().toString(36)}`,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    departmentId: data.departmentId || null,
    departmentName: d ? d.name : "Unassigned",
    status: "active",
    avatar: initials,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    permissions: ["dashboard.view", "tasks.view", "clients.view", "vendors.view"],
  };

  const updatedUsers = [...users, newUser];
  setStorageItem(STORAGE_KEYS.USERS, updatedUsers);

  // If department assigned, add membership
  if (data.departmentId) {
    const members = getStorageItem<AdminDepartmentMember[]>(STORAGE_KEYS.DEPARTMENT_MEMBERS, DEFAULT_DEPARTMENT_MEMBERS);
    const newMember: AdminDepartmentMember = {
      id: `mem-${Date.now().toString(36)}`,
      adminUserId: newUser.id,
      departmentId: data.departmentId,
      membershipRole: "member",
      isPrimary: true,
      userName: newUser.fullName,
      userEmail: newUser.email,
      userRole: newUser.role,
      departmentName: d?.name,
      createdAt: new Date().toISOString(),
    };
    setStorageItem(STORAGE_KEYS.DEPARTMENT_MEMBERS, [...members, newMember]);
  }

  logAuditEvent("user.create", "user", newUser.id, `Created team member ${newUser.fullName} (${newUser.email}) with role ${newUser.role}`);

  return newUser;
}

export function updateUser(id: string, data: Partial<AdminUser>): AdminUser | null {
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  const depts = getStorageItem<typeof DEFAULT_DEPARTMENTS>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  const deptId = data.departmentId !== undefined ? data.departmentId : users[idx].departmentId;
  const targetDept = depts.find((d) => d.id === deptId);

  const updatedUser: AdminUser = {
    ...users[idx],
    ...data,
    departmentName: targetDept ? targetDept.name : users[idx].departmentName,
  };

  users[idx] = updatedUser;
  setStorageItem(STORAGE_KEYS.USERS, users);

  // If updating current session user, update session in storage as well
  const currentSession = getStorageItem<AdminUser | null>(STORAGE_KEYS.AUTH_SESSION, null);
  if (currentSession && currentSession.id === id) {
    setStorageItem(STORAGE_KEYS.AUTH_SESSION, updatedUser);
  }

  logAuditEvent("user.update", "user", id, `Updated team member profile for ${updatedUser.fullName}`);

  return updatedUser;
}

export function suspendUser(id: string): AdminUser | null {
  return updateUser(id, { status: "suspended" });
}

export function activateUser(id: string): AdminUser | null {
  return updateUser(id, { status: "active" });
}

export function getRoles(): AdminRoleDef[] {
  const roles = getStorageItem<AdminRoleDef[]>(STORAGE_KEYS.ROLES, DEFAULT_ROLES);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);

  return roles.map((r) => {
    const userCount = users.filter((u) => u.role === r.slug).length;
    return { ...r, userCount };
  });
}

export function getPermissions(): AdminPermission[] {
  return getStorageItem<AdminPermission[]>(STORAGE_KEYS.PERMISSIONS, DEFAULT_PERMISSIONS);
}

export function getUserOverrides(): AdminUserPermissionOverride[] {
  return getStorageItem<AdminUserPermissionOverride[]>(STORAGE_KEYS.OVERRIDES, DEFAULT_OVERRIDES);
}

export function addOverride(data: {
  userId: string;
  permissionId: string;
  effect: "allow" | "deny";
  reason: string;
  expiresAt?: string | null;
}): AdminUserPermissionOverride {
  const overrides = getStorageItem<AdminUserPermissionOverride[]>(STORAGE_KEYS.OVERRIDES, DEFAULT_OVERRIDES);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const perms = getStorageItem<AdminPermission[]>(STORAGE_KEYS.PERMISSIONS, DEFAULT_PERMISSIONS);

  const u = users.find((user) => user.id === data.userId);
  const p = perms.find((perm) => perm.id === data.permissionId || perm.slug === data.permissionId);

  const newOverride: AdminUserPermissionOverride = {
    id: `ovr-${Date.now().toString(36)}`,
    adminUserId: data.userId,
    permissionId: p ? p.id : data.permissionId,
    permissionSlug: p?.slug || data.permissionId,
    permissionName: p?.name || data.permissionId,
    module: p?.module,
    action: p?.action,
    effect: data.effect,
    reason: data.reason,
    expiresAt: data.expiresAt || null,
    createdAt: new Date().toISOString(),
  };

  const updated = [newOverride, ...overrides];
  setStorageItem(STORAGE_KEYS.OVERRIDES, updated);

  logAuditEvent(
    "override.create",
    "permission_override",
    newOverride.id,
    `Granted explicit ${data.effect.toUpperCase()} override for "${p?.name || data.permissionId}" to ${u?.fullName || data.userId}`
  );

  return newOverride;
}

export function deleteOverride(id: string): boolean {
  const overrides = getStorageItem<AdminUserPermissionOverride[]>(STORAGE_KEYS.OVERRIDES, DEFAULT_OVERRIDES);
  const filtered = overrides.filter((o) => o.id !== id);
  setStorageItem(STORAGE_KEYS.OVERRIDES, filtered);

  logAuditEvent("override.delete", "permission_override", id, `Removed permission override ${id}`);
  return true;
}

export function getUserSessions(userId: string) {
  // Returns simulated active browser sessions
  return [
    {
      id: `sess-${userId}-1`,
      userId,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/133.0.0.0",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      lastActivityAt: new Date().toISOString(),
      isCurrent: true,
    },
  ];
}

export function revokeUserSessions(userId: string): { success: boolean; revokedCount: number } {
  logAuditEvent("sessions.revoke", "user_sessions", userId, `Revoked all active sessions for user ${userId}`);
  return { success: true, revokedCount: 1 };
}
