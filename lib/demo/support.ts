/**
 * RICOZ Admin — Frontend Demo Support Tickets Service
 */

import { SupportTicket, TicketResponse, AdminUser, Client } from "@/lib/admin/types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage";
import { DEFAULT_SUPPORT_TICKETS, DEFAULT_TICKET_RESPONSES, DEFAULT_USERS, DEFAULT_CLIENTS } from "./seedData";
import { logAuditEvent } from "./audit";

export function getTickets(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}): SupportTicket[] {
  let tickets = getStorageItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, DEFAULT_SUPPORT_TICKETS);
  const responses = getStorageItem<TicketResponse[]>(STORAGE_KEYS.SUPPORT_RESPONSES, DEFAULT_TICKET_RESPONSES);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const clients = getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);

  tickets = tickets.map((t) => {
    const tResponses = responses.filter((r) => r.ticketId === t.id);
    const assignedUser = users.find((u) => u.id === t.assignedUserId);
    const client = clients.find((c) => c.id === t.clientId);

    return {
      ...t,
      assignedUserName: assignedUser ? assignedUser.fullName : t.assignedUserName,
      clientName: client ? client.name : t.clientName,
      responsesCount: tResponses.length,
    };
  });

  if (filters?.status) {
    tickets = tickets.filter((t) => t.status === filters.status);
  }

  if (filters?.priority) {
    tickets = tickets.filter((t) => t.priority === filters.priority);
  }

  if (filters?.category) {
    tickets = tickets.filter((t) => t.category === filters.category);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    tickets = tickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.ticketRef || "").toLowerCase().includes(q) ||
        (t.customerName || "").toLowerCase().includes(q)
    );
  }

  return tickets;
}

export function getTicketById(id: string): { ticket: SupportTicket | null; responses: TicketResponse[] } {
  const tickets = getTickets();
  const ticket = tickets.find((t) => t.id === id || t.ticketRef === id) || null;
  const allResponses = getStorageItem<TicketResponse[]>(STORAGE_KEYS.SUPPORT_RESPONSES, DEFAULT_TICKET_RESPONSES);
  const responses = ticket ? allResponses.filter((r) => r.ticketId === ticket.id) : [];

  return { ticket, responses };
}

export function createTicket(data: Partial<SupportTicket>): SupportTicket {
  const tickets = getStorageItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, DEFAULT_SUPPORT_TICKETS);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const clients = getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);

  const assigned = users.find((u) => u.id === data.assignedUserId);
  const client = clients.find((c) => c.id === data.clientId);
  const now = new Date().toISOString();
  const refNum = 8820 + tickets.length + 1;

  const newTicket: SupportTicket = {
    id: `tic-${Date.now().toString(36)}`,
    ticketRef: `TCK-${refNum}`,
    clientId: data.clientId || null,
    clientName: client ? client.name : undefined,
    customerName: data.customerName || client?.contactName || "Client Requester",
    customerEmail: data.customerEmail || client?.contactEmail || "",
    category: data.category || "platform_bug",
    subject: data.subject || "Support Inquiry",
    description: data.description || "",
    priority: data.priority || "medium",
    status: data.status || "open",
    assignedUserId: data.assignedUserId || null,
    assignedUserName: assigned ? assigned.fullName : undefined,
    responsesCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  setStorageItem(STORAGE_KEYS.SUPPORT_TICKETS, [newTicket, ...tickets]);

  logAuditEvent("support.create", "support_ticket", newTicket.id, `Opened support ticket ${newTicket.ticketRef}: "${newTicket.subject}"`);

  return newTicket;
}

export function updateTicket(id: string, data: Partial<SupportTicket>): SupportTicket | null {
  const tickets = getStorageItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, DEFAULT_SUPPORT_TICKETS);
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const assignedId = data.assignedUserId !== undefined ? data.assignedUserId : tickets[idx].assignedUserId;
  const assigned = users.find((u) => u.id === assignedId);

  const updated: SupportTicket = {
    ...tickets[idx],
    ...data,
    assignedUserName: assigned ? assigned.fullName : tickets[idx].assignedUserName,
    updatedAt: new Date().toISOString(),
  };

  tickets[idx] = updated;
  setStorageItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);

  logAuditEvent("support.update", "support_ticket", id, `Updated ticket ${updated.ticketRef} (Status: ${updated.status})`);

  return updated;
}

export function resolveTicket(id: string, resolutionNotes: string): SupportTicket | null {
  return updateTicket(id, {
    status: "resolved",
    resolutionNotes,
    resolvedAt: new Date().toISOString(),
  });
}

export function addTicketResponse(
  ticketId: string,
  message: string,
  isInternalNote = false,
  author?: { id: string; name: string; role: AdminUser["role"] }
): TicketResponse {
  const responses = getStorageItem<TicketResponse[]>(STORAGE_KEYS.SUPPORT_RESPONSES, DEFAULT_TICKET_RESPONSES);

  const newResponse: TicketResponse = {
    id: `tres-${Date.now().toString(36)}`,
    ticketId,
    userId: author?.id || "usr-support-lead",
    userName: author?.name || "David Ross",
    userRole: author?.role || "dept_manager",
    message,
    isInternalNote,
    createdAt: new Date().toISOString(),
  };

  setStorageItem(STORAGE_KEYS.SUPPORT_RESPONSES, [...responses, newResponse]);

  logAuditEvent(
    "support.response",
    "ticket_response",
    newResponse.id,
    `Added ${isInternalNote ? "INTERNAL NOTE" : "response"} to ticket ${ticketId}`
  );

  return newResponse;
}
