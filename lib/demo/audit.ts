/**
 * RICOZ Admin — Simulated Audit Logging Service
 */

import { AuditLog } from "@/lib/admin/types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage";
import { DEFAULT_AUDIT_LOGS } from "./seedData";

export function getAuditLogs(filters?: {
  entityType?: string;
  search?: string;
}): AuditLog[] {
  let logs = getStorageItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);

  if (filters?.entityType) {
    logs = logs.filter((l) => (l.entityType || "").toLowerCase() === filters.entityType!.toLowerCase());
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    logs = logs.filter(
      (l) =>
        (l.action || "").toLowerCase().includes(q) ||
        (l.actorName || "").toLowerCase().includes(q) ||
        (l.changeSummary || "").toLowerCase().includes(q) ||
        (l.entityId || "").toLowerCase().includes(q)
    );
  }

  // Sort descending by date
  return [...logs].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  changeSummary: string,
  actor?: { id: string; name: string; role: string }
): AuditLog {
  const currentLogs = getStorageItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);

  // If no actor provided, try to read current session
  let actorId = actor?.id || "usr-demo";
  let actorName = actor?.name || "Demo User";
  let actorRole = actor?.role || "super_admin";

  if (!actor && typeof window !== "undefined") {
    try {
      const rawSession = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed?.id) {
          actorId = parsed.id;
          actorName = parsed.fullName || parsed.name || "Demo User";
          actorRole = parsed.role || "super_admin";
        }
      }
    } catch {
      // Ignore
    }
  }

  const newLog: AuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    actorId,
    actorName,
    actorRole,
    action,
    entityType,
    entityId,
    changeSummary,
    ipAddress: "127.0.0.1",
    createdAt: new Date().toISOString(),
  };

  const updatedLogs = [newLog, ...currentLogs];
  setStorageItem(STORAGE_KEYS.AUDIT_LOGS, updatedLogs);
  return newLog;
}
