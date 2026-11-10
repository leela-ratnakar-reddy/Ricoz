/**
 * RICOZ Admin — Frontend Demo Clients Service
 */

import { Client, ClientOnboardingItem, AdminUser } from "@/lib/admin/types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage";
import { DEFAULT_CLIENTS, DEFAULT_CLIENT_CHECKLIST, DEFAULT_USERS } from "./seedData";
import { logAuditEvent } from "./audit";

export function getClients(filters?: {
  stage?: string;
  industry?: string;
  search?: string;
}): Client[] {
  let clients = getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
  const checklist = getStorageItem<ClientOnboardingItem[]>(STORAGE_KEYS.CLIENT_CHECKLIST, DEFAULT_CLIENT_CHECKLIST);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);

  // Re-compute checklist counts & owner names
  clients = clients.map((c) => {
    const items = checklist.filter((item) => item.clientId === c.id);
    const completed = items.filter((item) => item.isCompleted).length;
    const owner = users.find((u) => u.id === c.assignedOwnerId);

    return {
      ...c,
      assignedOwnerName: owner ? owner.fullName : c.assignedOwnerName,
      completedChecklistCount: completed,
      totalChecklistCount: items.length || 5,
    };
  });

  if (filters?.stage) {
    clients = clients.filter((c) => c.onboardingStage === filters.stage);
  }

  if (filters?.industry) {
    clients = clients.filter((c) => c.industry === filters.industry);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    clients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.contactName || "").toLowerCase().includes(q) ||
        (c.contactEmail || "").toLowerCase().includes(q) ||
        (c.industry || "").toLowerCase().includes(q)
    );
  }

  return clients;
}

export function getClientById(id: string): { client: Client | null; checklist: ClientOnboardingItem[] } {
  const clients = getClients();
  const client = clients.find((c) => c.id === id) || null;
  const allChecklist = getStorageItem<ClientOnboardingItem[]>(STORAGE_KEYS.CLIENT_CHECKLIST, DEFAULT_CLIENT_CHECKLIST);
  const checklist = allChecklist.filter((item) => item.clientId === id);

  return { client, checklist };
}

export function createClient(data: Partial<Client>): Client {
  const clients = getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
  const checklist = getStorageItem<ClientOnboardingItem[]>(STORAGE_KEYS.CLIENT_CHECKLIST, DEFAULT_CLIENT_CHECKLIST);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);

  const owner = users.find((u) => u.id === data.assignedOwnerId);
  const now = new Date().toISOString();

  const newClient: Client = {
    id: `cli-${Date.now().toString(36)}`,
    name: data.name || "Untitled Enterprise",
    industry: data.industry || "General",
    contactName: data.contactName || "",
    contactEmail: data.contactEmail || "",
    phone: data.phone || "",
    companySize: data.companySize || "50-100 employees",
    onboardingStage: data.onboardingStage || "inquiry",
    assignedOwnerId: data.assignedOwnerId || null,
    assignedOwnerName: owner ? owner.fullName : undefined,
    notes: data.notes || "",
    completedChecklistCount: 0,
    totalChecklistCount: 5,
    createdAt: now,
    updatedAt: now,
  };

  // Seed default 5 checklist items for the new client
  const defaultItems = [
    { title: "Execute Mutual Standard NDA", category: "Legal" },
    { title: "Verified Enterprise Billing Profile", category: "Finance" },
    { title: "Define Project Deliverables & Creative Brief", category: "Scoping" },
    { title: "Confirm Escrow Milestone Structure", category: "Finance" },
    { title: "Creative Lead Introduction & Alignment", category: "Kickoff" },
  ];

  const newChecklistItems: ClientOnboardingItem[] = defaultItems.map((item, idx) => ({
    id: `chk-${newClient.id}-${idx}`,
    clientId: newClient.id,
    title: item.title,
    category: item.category,
    isCompleted: false,
  }));

  setStorageItem(STORAGE_KEYS.CLIENTS, [newClient, ...clients]);
  setStorageItem(STORAGE_KEYS.CLIENT_CHECKLIST, [...checklist, ...newChecklistItems]);

  logAuditEvent("client.create", "client", newClient.id, `Registered enterprise client "${newClient.name}"`);

  return newClient;
}

export function updateClient(id: string, data: Partial<Client>): Client | null {
  const clients = getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const ownerId = data.assignedOwnerId !== undefined ? data.assignedOwnerId : clients[idx].assignedOwnerId;
  const owner = users.find((u) => u.id === ownerId);

  const updated: Client = {
    ...clients[idx],
    ...data,
    assignedOwnerName: owner ? owner.fullName : clients[idx].assignedOwnerName,
    updatedAt: new Date().toISOString(),
  };

  clients[idx] = updated;
  setStorageItem(STORAGE_KEYS.CLIENTS, clients);

  logAuditEvent("client.update", "client", id, `Updated enterprise client "${updated.name}"`);

  return updated;
}

export function deleteClient(id: string): boolean {
  const clients = getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
  const checklist = getStorageItem<ClientOnboardingItem[]>(STORAGE_KEYS.CLIENT_CHECKLIST, DEFAULT_CLIENT_CHECKLIST);

  const target = clients.find((c) => c.id === id);
  const filteredClients = clients.filter((c) => c.id !== id);
  const filteredChecklist = checklist.filter((item) => item.clientId !== id);

  setStorageItem(STORAGE_KEYS.CLIENTS, filteredClients);
  setStorageItem(STORAGE_KEYS.CLIENT_CHECKLIST, filteredChecklist);

  logAuditEvent("client.delete", "client", id, `Deleted client "${target?.name || id}"`);
  return true;
}

export function toggleClientChecklistItem(
  clientId: string,
  itemId: string,
  isCompleted: boolean
): ClientOnboardingItem | null {
  const checklist = getStorageItem<ClientOnboardingItem[]>(STORAGE_KEYS.CLIENT_CHECKLIST, DEFAULT_CLIENT_CHECKLIST);
  const idx = checklist.findIndex((item) => item.id === itemId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  checklist[idx] = {
    ...checklist[idx],
    isCompleted,
    completedAt: isCompleted ? now : null,
  };

  setStorageItem(STORAGE_KEYS.CLIENT_CHECKLIST, checklist);

  // Check if all items completed, potentially promote stage
  const clientItems = checklist.filter((item) => item.clientId === clientId);
  const allDone = clientItems.length > 0 && clientItems.every((item) => item.isCompleted);
  if (allDone) {
    updateClient(clientId, { onboardingStage: "active" });
  }

  logAuditEvent(
    "client.checklist_toggle",
    "client_checklist",
    itemId,
    `Marked "${checklist[idx].title}" as ${isCompleted ? "COMPLETED" : "INCOMPLETE"}`
  );

  return checklist[idx];
}
