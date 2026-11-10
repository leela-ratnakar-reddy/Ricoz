/**
 * RICOZ Admin — Frontend Demo Dashboard Service
 * Computes consolidated KPIs, urgent deliverables, workloads, and badges.
 */

import { Task, Client, Vendor, SupportTicket, Department, AdminDepartmentMember, AuditLog, Notification, OperationsKPIs } from "@/lib/admin/types";
import { getStorageItem, STORAGE_KEYS } from "./storage";
import {
  DEFAULT_TASKS,
  DEFAULT_CLIENTS,
  DEFAULT_VENDORS,
  DEFAULT_SUPPORT_TICKETS,
  DEFAULT_DEPARTMENTS,
  DEFAULT_DEPARTMENT_MEMBERS,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_NOTIFICATIONS,
} from "./seedData";

export interface DashboardData {
  kpis: OperationsKPIs;
  urgentTasks: Task[];
  pendingVendorList: Vendor[];
  deptWorkloads: Array<{
    id: string;
    name: string;
    member_count: number;
    active_tasks: number;
    overdue_tasks: number;
    head_name?: string;
  }>;
  recentActivity: AuditLog[];
}

export function getDashboardStats(departmentFilter?: string, _range = "30d"): DashboardData {
  let tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  let clients = getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
  let vendors = getStorageItem<Vendor[]>(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
  let tickets = getStorageItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, DEFAULT_SUPPORT_TICKETS);
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  const members = getStorageItem<AdminDepartmentMember[]>(STORAGE_KEYS.DEPARTMENT_MEMBERS, DEFAULT_DEPARTMENT_MEMBERS);
  const auditLogs = getStorageItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);

  if (departmentFilter) {
    tasks = tasks.filter((t) => t.departmentId === departmentFilter);
  }

  const now = new Date().toISOString().split("T")[0];

  // Tasks KPIs
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && t.dueDate && t.dueDate < now).length;
  const blockedTasks = tasks.filter((t) => t.status === "blocked").length;

  // Clients KPIs
  const activeClients = clients.filter((c) => c.onboardingStage === "active").length;
  const onboardingClients = clients.filter((c) => c.onboardingStage !== "active" && c.onboardingStage !== "churned").length;

  // Vendors KPIs
  const verifiedVendors = vendors.filter((v) => v.verificationStatus === "verified").length;
  const pendingVendors = vendors.filter((v) => v.verificationStatus !== "verified").length;

  // Support KPIs
  const openTickets = tickets.filter((t) => t.status !== "resolved").length;
  const criticalTickets = tickets.filter((t) => t.priority === "critical" && t.status !== "resolved").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;
  const resolvedTicketsRate = tickets.length > 0 ? Math.round((resolvedTickets / tickets.length) * 100) : 100;

  const kpis: OperationsKPIs = {
    totalTasks,
    pendingTasks,
    completedTasks,
    overdueTasks,
    blockedTasks,
    activeClients,
    onboardingClients,
    verifiedVendors,
    pendingVendors,
    openTickets,
    criticalTickets,
    resolvedTicketsRate,
  };

  // Urgent tasks: sorted by priority (urgent > high) and blocked status
  const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
  const urgentTasks = [...tasks]
    .filter((t) => t.status !== "completed")
    .sort((a, b) => {
      if (a.isEscalated && !b.isEscalated) return -1;
      if (!a.isEscalated && b.isEscalated) return 1;
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    })
    .slice(0, 5);

  // Pending vendors needing verification
  const pendingVendorList = [...vendors]
    .filter((v) => v.verificationStatus !== "verified")
    .slice(0, 5);

  // Department workloads
  const deptWorkloads = depts.map((d) => {
    const dTasks = tasks.filter((t) => t.departmentId === d.id);
    const dMembers = members.filter((m) => m.departmentId === d.id);
    const active_tasks = dTasks.filter((t) => t.status !== "completed").length;
    const overdue_tasks = dTasks.filter((t) => t.status !== "completed" && t.dueDate && t.dueDate < now).length;

    return {
      id: d.id,
      name: d.name,
      member_count: dMembers.length || (d.id === "dept-ops" ? 3 : 1),
      active_tasks,
      overdue_tasks,
      head_name: d.headUserName,
    };
  });

  // Recent activity: top 6 audit logs
  const recentActivity = [...auditLogs]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 6);

  return {
    kpis,
    urgentTasks,
    pendingVendorList,
    deptWorkloads,
    recentActivity,
  };
}

export function getDashboardBadges(): {
  overdueTasks: number;
  openTickets: number;
  pendingVendors: number;
  unreadNotifications: number;
} {
  const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  const tickets = getStorageItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, DEFAULT_SUPPORT_TICKETS);
  const vendors = getStorageItem<Vendor[]>(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
  const notifications = getStorageItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);

  const now = new Date().toISOString().split("T")[0];

  const overdueTasks = tasks.filter((t) => t.status !== "completed" && t.dueDate && t.dueDate < now).length;
  const openTickets = tickets.filter((t) => t.status !== "resolved").length;
  const pendingVendors = vendors.filter((v) => v.verificationStatus !== "verified").length;
  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  return {
    overdueTasks,
    openTickets,
    pendingVendors,
    unreadNotifications,
  };
}
