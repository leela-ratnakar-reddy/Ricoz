/**
 * RICOZ Admin — Frontend Demo Storage Service
 * Provides safe client-side localStorage access, JSON serialization,
 * SSR hydration guard, and storage event broadcasting.
 */

export const STORAGE_KEYS = {
  INITIALIZED: "ricoz_demo_initialized_v1",
  AUTH_SESSION: "ricoz_demo_auth_session",
  USERS: "ricoz_demo_users",
  DEPARTMENTS: "ricoz_demo_departments",
  ROLES: "ricoz_demo_roles",
  PERMISSIONS: "ricoz_demo_permissions",
  ROLE_PERMISSIONS: "ricoz_demo_role_permissions",
  OVERRIDES: "ricoz_demo_permission_overrides",
  DEPARTMENT_MEMBERS: "ricoz_demo_department_members",
  CLIENTS: "ricoz_demo_clients",
  CLIENT_CHECKLIST: "ricoz_demo_client_checklist",
  VENDORS: "ricoz_demo_vendors",
  VENDOR_DOCS: "ricoz_demo_vendor_docs",
  TASKS: "ricoz_demo_tasks",
  TASK_COMMENTS: "ricoz_demo_task_comments",
  SUPPORT_TICKETS: "ricoz_demo_support_tickets",
  SUPPORT_RESPONSES: "ricoz_demo_support_responses",
  SOPS: "ricoz_demo_sops",
  NOTIFICATIONS: "ricoz_demo_notifications",
  AUDIT_LOGS: "ricoz_demo_audit_logs",
} as const;

/**
 * Checks if the browser window environment is available.
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Safely retrieve an item from localStorage.
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[RICOZ Demo Storage] Failed to parse key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely save an item to localStorage.
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for in-tab reactive syncing
    window.dispatchEvent(new CustomEvent("ricoz_demo_storage_change", { detail: { key } }));
  } catch (error) {
    console.error(`[RICOZ Demo Storage] Failed to write key "${key}":`, error);
  }
}

/**
 * Safely remove an item from localStorage.
 */
export function removeStorageItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent("ricoz_demo_storage_change", { detail: { key } }));
  } catch (error) {
    console.error(`[RICOZ Demo Storage] Failed to delete key "${key}":`, error);
  }
}

/**
 * Check if demo data has been seeded.
 */
export function isDemoInitialized(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(STORAGE_KEYS.INITIALIZED) === "true";
}

/**
 * Marks demo data as initialized.
 */
export function markDemoInitialized(): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
}

/**
 * Completely clear all RICOZ demo keys from localStorage.
 */
export function clearAllDemoStorage(): void {
  if (!isBrowser()) return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore cleanup error
    }
  });
}
