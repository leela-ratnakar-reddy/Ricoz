/**
 * RICOZ Admin — Frontend Demo Departments Service
 */

import { Department, AdminDepartmentMember, Task, AdminUser } from "@/lib/admin/types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage";
import { DEFAULT_DEPARTMENTS, DEFAULT_DEPARTMENT_MEMBERS, DEFAULT_USERS, DEFAULT_TASKS } from "./seedData";
import { logAuditEvent } from "./audit";

export function getDepartments(): Department[] {
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  const members = getStorageItem<AdminDepartmentMember[]>(STORAGE_KEYS.DEPARTMENT_MEMBERS, DEFAULT_DEPARTMENT_MEMBERS);

  const now = new Date().toISOString().split("T")[0];

  return depts.map((d) => {
    const head = users.find((u) => u.id === d.headUserId);
    const memberCount = members.filter((m) => m.departmentId === d.id).length || (d.id === "dept-ops" ? 3 : 1);
    const deptTasks = tasks.filter((t) => t.departmentId === d.id);
    const activeTasks = deptTasks.filter((t) => t.status !== "completed").length;
    const overdueTasks = deptTasks.filter((t) => t.status !== "completed" && t.dueDate && t.dueDate < now).length;

    return {
      ...d,
      headUserName: head ? head.fullName : d.headUserName,
      memberCount,
      activeTaskCount: activeTasks,
      overdueTaskCount: overdueTasks,
    };
  });
}

export function getDepartmentById(id: string): Department | null {
  const depts = getDepartments();
  return depts.find((d) => d.id === id) || null;
}

export function createDepartment(data: {
  name: string;
  slug?: string;
  description: string;
  headUserId?: string | null;
}): Department {
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const newDept: Department = {
    id: `dept-${Date.now().toString(36)}`,
    name: data.name,
    slug,
    description: data.description,
    headUserId: data.headUserId || null,
    createdAt: new Date().toISOString(),
  };

  const updated = [...depts, newDept];
  setStorageItem(STORAGE_KEYS.DEPARTMENTS, updated);

  logAuditEvent("department.create", "department", newDept.id, `Created department "${newDept.name}"`);

  return newDept;
}

export function updateDepartment(id: string, data: Partial<Department>): Department | null {
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  const idx = depts.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  const updatedDept = { ...depts[idx], ...data };
  depts[idx] = updatedDept;
  setStorageItem(STORAGE_KEYS.DEPARTMENTS, depts);

  logAuditEvent("department.update", "department", id, `Updated department "${updatedDept.name}"`);
  return updatedDept;
}

export function assignDepartmentHead(departmentId: string, headUserId: string | null): Department | null {
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);

  const idx = depts.findIndex((d) => d.id === departmentId);
  if (idx === -1) return null;

  const targetHead = headUserId ? users.find((u) => u.id === headUserId) : null;
  depts[idx].headUserId = headUserId;
  depts[idx].headUserName = targetHead ? targetHead.fullName : undefined;

  setStorageItem(STORAGE_KEYS.DEPARTMENTS, depts);

  logAuditEvent(
    "department.assign_head",
    "department",
    departmentId,
    `Assigned ${targetHead ? targetHead.fullName : "None"} as head of department "${depts[idx].name}"`
  );

  return depts[idx];
}

export function getDepartmentMembers(departmentId?: string): AdminDepartmentMember[] {
  const members = getStorageItem<AdminDepartmentMember[]>(STORAGE_KEYS.DEPARTMENT_MEMBERS, DEFAULT_DEPARTMENT_MEMBERS);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);

  const populated = members.map((m) => {
    const u = users.find((user) => user.id === m.adminUserId);
    const d = depts.find((dept) => dept.id === m.departmentId);
    return {
      ...m,
      userName: u ? u.fullName : m.userName,
      userEmail: u ? u.email : m.userEmail,
      userRole: u ? u.role : m.userRole,
      departmentName: d ? d.name : m.departmentName,
    };
  });

  if (departmentId) {
    return populated.filter((m) => m.departmentId === departmentId);
  }
  return populated;
}

export function addDepartmentMember(data: {
  adminUserId: string;
  departmentId: string;
  membershipRole?: "head" | "manager" | "member" | "observer";
  isPrimary?: boolean;
}): AdminDepartmentMember {
  const members = getStorageItem<AdminDepartmentMember[]>(STORAGE_KEYS.DEPARTMENT_MEMBERS, DEFAULT_DEPARTMENT_MEMBERS);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);

  const u = users.find((user) => user.id === data.adminUserId);
  const d = depts.find((dept) => dept.id === data.departmentId);

  const newMember: AdminDepartmentMember = {
    id: `mem-${Date.now().toString(36)}`,
    adminUserId: data.adminUserId,
    departmentId: data.departmentId,
    membershipRole: data.membershipRole || "member",
    isPrimary: data.isPrimary ?? false,
    userName: u?.fullName,
    userEmail: u?.email,
    userRole: u?.role,
    departmentName: d?.name,
    createdAt: new Date().toISOString(),
  };

  const updated = [...members, newMember];
  setStorageItem(STORAGE_KEYS.DEPARTMENT_MEMBERS, updated);

  logAuditEvent(
    "department.add_member",
    "department",
    data.departmentId,
    `Added ${u?.fullName || data.adminUserId} to department ${d?.name || data.departmentId}`
  );

  return newMember;
}
