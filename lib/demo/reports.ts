/**
 * RICOZ Admin — Frontend Demo Reports & CSV Export Service
 */

import { Task, Client, Vendor, SupportTicket, Department } from "@/lib/admin/types";
import { getStorageItem, STORAGE_KEYS } from "./storage";
import {
  DEFAULT_TASKS,
  DEFAULT_CLIENTS,
  DEFAULT_VENDORS,
  DEFAULT_SUPPORT_TICKETS,
  DEFAULT_DEPARTMENTS,
} from "./seedData";

export interface ReportData {
  timeRange: string;
  departmentId?: string;
  taskVelocity: {
    total: number;
    completed: number;
    velocityRate: number;
    avgDaysToComplete: number;
  };
  deptStats: Array<{
    id: string;
    name: string;
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
    active_tasks: number;
    overdue_tasks: number;
  }>;
  clientStages: Array<{
    stage: string;
    count: number;
  }>;
  vendorStatus: Array<{
    status: string;
    count: number;
  }>;
  supportSLA: {
    total: number;
    resolved: number;
    resolutionRate: number;
    avgResolutionHours: number;
    critical: number;
  };
}

export function getReports(departmentId?: string, range = "30d"): ReportData {
  let tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  const clients = getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
  const vendors = getStorageItem<Vendor[]>(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
  let tickets = getStorageItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, DEFAULT_SUPPORT_TICKETS);
  const depts = getStorageItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);

  if (departmentId) {
    tasks = tasks.filter((t) => t.departmentId === departmentId);
  }

  const now = new Date().toISOString().split("T")[0];

  // Task Velocity
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const velocityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Department Stats
  const deptStats = depts.map((d) => {
    const dTasks = tasks.filter((t) => t.departmentId === d.id);
    const dCompleted = dTasks.filter((t) => t.status === "completed").length;
    const dActive = dTasks.filter((t) => t.status !== "completed").length;
    const dOverdue = dTasks.filter((t) => t.status !== "completed" && t.dueDate && t.dueDate < now).length;
    const rate = dTasks.length > 0 ? Math.round((dCompleted / dTasks.length) * 100) : 0;

    return {
      id: d.id,
      name: d.name,
      total_tasks: dTasks.length,
      completed_tasks: dCompleted,
      completion_rate: rate,
      active_tasks: dActive,
      overdue_tasks: dOverdue,
    };
  });

  // Client Stages
  const stageMap: Record<string, number> = {
    inquiry: 0,
    contract_review: 0,
    kickoff: 0,
    active: 0,
    churned: 0,
  };
  clients.forEach((c) => {
    const s = c.onboardingStage || "inquiry";
    stageMap[s] = (stageMap[s] || 0) + 1;
  });
  const clientStages = Object.entries(stageMap).map(([stage, count]) => ({ stage, count }));

  // Vendor Status
  const statusMap: Record<string, number> = {
    verified: 0,
    pending_review: 0,
    unverified: 0,
  };
  vendors.forEach((v) => {
    const s = v.verificationStatus || "unverified";
    statusMap[s] = (statusMap[s] || 0) + 1;
  });
  const vendorStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // Support SLA
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;
  const criticalTickets = tickets.filter((t) => t.priority === "critical").length;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  return {
    timeRange: range,
    departmentId,
    taskVelocity: {
      total: totalTasks,
      completed: completedTasks,
      velocityRate,
      avgDaysToComplete: 2.4,
    },
    deptStats,
    clientStages,
    vendorStatus,
    supportSLA: {
      total: totalTickets,
      resolved: resolvedTickets,
      resolutionRate,
      avgResolutionHours: 3.2,
      critical: criticalTickets,
    },
  };
}

/**
 * Triggers a browser-side CSV download from mock data.
 */
export function exportReportsToCsv(type: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  let headers: string[] = [];
  let rows: (string | number)[][] = [];
  let filename = `ricoz_${type}_export_${new Date().toISOString().split("T")[0]}.csv`;

  if (type === "tasks") {
    const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    headers = ["Task ID", "Title", "Department", "Priority", "Status", "Due Date", "Escalated"];
    rows = tasks.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.departmentName || t.departmentId || "",
      t.priority,
      t.status,
      t.dueDate || "",
      t.isEscalated ? "YES" : "NO",
    ]);
  } else if (type === "clients") {
    const clients = getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    headers = ["Client ID", "Name", "Industry", "Stage", "Contact Name", "Contact Email", "Phone"];
    rows = clients.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.industry,
      c.onboardingStage || "inquiry",
      c.contactName || "",
      c.contactEmail || "",
      c.phone,
    ]);
  } else if (type === "vendors") {
    const vendors = getStorageItem<Vendor[]>(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
    headers = ["Vendor ID", "Name", "Service Category", "Verification Status", "Stage", "Email"];
    rows = vendors.map((v) => [
      v.id,
      `"${v.name.replace(/"/g, '""')}"`,
      `"${(v.serviceCategory || "").replace(/"/g, '""')}"`,
      v.verificationStatus || "unverified",
      v.onboardingStage || "application",
      v.contactEmail || "",
    ]);
  } else if (type === "support") {
    const tickets = getStorageItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, DEFAULT_SUPPORT_TICKETS);
    headers = ["Ticket Ref", "Subject", "Category", "Priority", "Status", "Requester"];
    rows = tickets.map((t) => [
      t.ticketRef || t.id,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      t.customerName || "",
    ]);
  } else {
    // General Operational Summary
    const reports = getReports();
    headers = ["Department", "Total Tasks", "Completed Tasks", "Completion Rate (%)", "Active Tasks", "Overdue Tasks"];
    rows = reports.deptStats.map((d) => [
      d.name,
      d.total_tasks,
      d.completed_tasks,
      d.completion_rate,
      d.active_tasks,
      d.overdue_tasks,
    ]);
  }

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
