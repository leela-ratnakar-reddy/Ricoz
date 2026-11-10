/**
 * RICOZ Admin — Frontend Demo Authentication & Session Service
 * Client-side prototype simulation. No real credentials or server security claimed.
 */

import { AdminUser } from "@/lib/admin/types";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  isBrowser,
  isDemoInitialized,
  markDemoInitialized,
  clearAllDemoStorage,
  STORAGE_KEYS,
} from "./storage";
import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_USERS,
  DEFAULT_ROLES,
  DEFAULT_PERMISSIONS,
  DEFAULT_DEPARTMENT_MEMBERS,
  DEFAULT_OVERRIDES,
  DEFAULT_CLIENTS,
  DEFAULT_CLIENT_CHECKLIST,
  DEFAULT_VENDORS,
  DEFAULT_VENDOR_DOCS,
  DEFAULT_TASKS,
  DEFAULT_TASK_COMMENTS,
  DEFAULT_SUPPORT_TICKETS,
  DEFAULT_TICKET_RESPONSES,
  DEFAULT_SOPS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_AUDIT_LOGS,
} from "./seedData";
import { logAuditEvent } from "./audit";

const DEMO_COOKIE_NAME = "ricoz_admin_session";
const DEMO_COOKIE_VALUE = "ricoz_demo_session_active_token_2026";

/**
 * Sync cookie for Next.js Edge Middleware compatibility.
 */
function setDemoCookie(): void {
  if (typeof document !== "undefined") {
    // 7 days expiration
    document.cookie = `${DEMO_COOKIE_NAME}=${DEMO_COOKIE_VALUE}; path=/; max-age=604800; SameSite=Lax`;
  }
}

function clearDemoCookie(): void {
  if (typeof document !== "undefined") {
    document.cookie = `${DEMO_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

/**
 * Initializes all realistic demo data if not already present.
 */
export function ensureDemoInitialized(force = false): void {
  if (!isBrowser()) return;

  if (!isDemoInitialized() || force) {
    if (force) {
      clearAllDemoStorage();
    }
    setStorageItem(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
    setStorageItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
    setStorageItem(STORAGE_KEYS.ROLES, DEFAULT_ROLES);
    setStorageItem(STORAGE_KEYS.PERMISSIONS, DEFAULT_PERMISSIONS);
    setStorageItem(STORAGE_KEYS.DEPARTMENT_MEMBERS, DEFAULT_DEPARTMENT_MEMBERS);
    setStorageItem(STORAGE_KEYS.OVERRIDES, DEFAULT_OVERRIDES);
    setStorageItem(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    setStorageItem(STORAGE_KEYS.CLIENT_CHECKLIST, DEFAULT_CLIENT_CHECKLIST);
    setStorageItem(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
    setStorageItem(STORAGE_KEYS.VENDOR_DOCS, DEFAULT_VENDOR_DOCS);
    setStorageItem(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    setStorageItem(STORAGE_KEYS.TASK_COMMENTS, DEFAULT_TASK_COMMENTS);
    setStorageItem(STORAGE_KEYS.SUPPORT_TICKETS, DEFAULT_SUPPORT_TICKETS);
    setStorageItem(STORAGE_KEYS.SUPPORT_RESPONSES, DEFAULT_TICKET_RESPONSES);
    setStorageItem(STORAGE_KEYS.SOPS, DEFAULT_SOPS);
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    setStorageItem(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
    markDemoInitialized();
  }
}

/**
 * Retrieves the current simulated demo user session from localStorage.
 */
export function getDemoSession(): AdminUser | null {
  if (!isBrowser()) return null;
  ensureDemoInitialized();

  const user = getStorageItem<AdminUser | null>(STORAGE_KEYS.AUTH_SESSION, null);
  if (user) {
    // Ensure cookie is in sync
    setDemoCookie();
  }
  return user;
}

/**
 * Simulated login function.
 */
export function demoLogin(
  email: string,
  _password?: string
): { success: boolean; user?: AdminUser; error?: string } {
  if (!isBrowser()) {
    return { success: false, error: "Browser environment required." };
  }

  ensureDemoInitialized();
  const cleanEmail = email.trim().toLowerCase();

  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  let matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  // If user didn't match existing, provide fallback for any user or default super admin
  if (!matchedUser) {
    if (cleanEmail.includes("@")) {
      // Auto-provision a demo session for the requested email as super admin
      matchedUser = {
        id: `usr-demo-${Date.now()}`,
        email: cleanEmail,
        fullName: cleanEmail.split("@")[0].replace(".", " "),
        role: "super_admin",
        departmentId: "dept-ops",
        departmentName: "Operations",
        status: "active",
        avatar: cleanEmail.substring(0, 2).toUpperCase(),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        permissions: DEFAULT_USERS[0].permissions,
      };
      // Add to users list
      setStorageItem(STORAGE_KEYS.USERS, [...users, matchedUser]);
    } else {
      return {
        success: false,
        error: "Please enter a valid email address, or select a preset demo account.",
      };
    }
  }

  // Update last login
  const updatedUser: AdminUser = {
    ...matchedUser,
    lastLoginAt: new Date().toISOString(),
  };

  setStorageItem(STORAGE_KEYS.AUTH_SESSION, updatedUser);
  setDemoCookie();

  logAuditEvent(
    "auth.demo_login",
    "session",
    updatedUser.id,
    `User ${updatedUser.fullName} (${updatedUser.email}) logged into Admin Panel (Frontend Demo Mode)`
  );

  return { success: true, user: updatedUser };
}

/**
 * Simulated logout function.
 */
export function demoLogout(): void {
  if (!isBrowser()) return;

  const currentUser = getDemoSession();
  if (currentUser) {
    logAuditEvent(
      "auth.demo_logout",
      "session",
      currentUser.id,
      `User ${currentUser.fullName} logged out (Frontend Demo Mode)`
    );
  }

  removeStorageItem(STORAGE_KEYS.AUTH_SESSION);
  clearDemoCookie();
}

/**
 * Switch demo user immediately (useful for testing different roles in UI).
 */
export function switchDemoUser(userId: string): AdminUser | null {
  if (!isBrowser()) return null;
  ensureDemoInitialized();

  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const found = users.find((u) => u.id === userId);
  if (!found) return null;

  setStorageItem(STORAGE_KEYS.AUTH_SESSION, found);
  setDemoCookie();

  logAuditEvent(
    "auth.demo_role_switch",
    "session",
    found.id,
    `Switched active demo user to ${found.fullName} (${found.role})`
  );

  return found;
}

/**
 * Resets all demo data to default seed values.
 */
export function resetAllDemoData(): void {
  ensureDemoInitialized(true);
  // Re-establish session for primary super admin
  const primaryAdmin = DEFAULT_USERS[0];
  setStorageItem(STORAGE_KEYS.AUTH_SESSION, primaryAdmin);
  setDemoCookie();

  logAuditEvent(
    "demo.system_reset",
    "system",
    "sys-demo",
    "All demo data was reset to factory baseline defaults."
  );
}

/**
 * List of preconfigured demo accounts for fast 1-click access.
 */
export const DEMO_PRESET_ACCOUNTS = [
  {
    name: "Aadinath Achary",
    email: "aadinathachary@gmail.com",
    role: "Super Admin / Owner",
    department: "Operations & Governance",
    badge: "Full Clearance (Level 1)",
    avatar: "AA",
    color: "from-red-600 to-red-800",
  },
  {
    name: "Elena Ramos",
    email: "elena.ramos@ricoz.io",
    role: "Operations Admin",
    department: "Operations",
    badge: "Workflows & Vetting",
    avatar: "ER",
    color: "from-amber-600 to-amber-800",
  },
  {
    name: "Kai Chen",
    email: "kai.chen@ricoz.io",
    role: "Technology Manager",
    department: "Technology & AI",
    badge: "Engineering & Infra",
    avatar: "KC",
    color: "from-blue-600 to-blue-800",
  },
  {
    name: "Sarah Jenkins",
    email: "sarah.jenkins@ricoz.io",
    role: "Sales & Mandate Lead",
    department: "Sales & Partnerships",
    badge: "Client Scoping",
    avatar: "SJ",
    color: "from-emerald-600 to-emerald-800",
  },
  {
    name: "David Ross",
    email: "david.ross@ricoz.io",
    role: "Support Manager",
    department: "Customer Support",
    badge: "SLA & Complaints",
    avatar: "DR",
    color: "from-purple-600 to-purple-800",
  },
  {
    name: "Rachel Thorne",
    email: "audit@ricoz.io",
    role: "Compliance Auditor",
    department: "Audit & Oversight",
    badge: "Strict Read-Only",
    avatar: "RT",
    color: "from-slate-600 to-slate-800",
  },
];
