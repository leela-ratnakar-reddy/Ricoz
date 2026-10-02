"use client";

import {
  Designer,
  Project,
  Conversation,
  Message,
  User,
  PortfolioProject,
} from "@/types";
import {
  MOCK_DESIGNERS,
  MOCK_PROJECTS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
} from "@/data/mockData";

const KEYS = {
  PROJECTS: "brandroom_projects",
  SHORTLIST: "brandroom_shortlist",
  CONVERSATIONS: "brandroom_conversations",
  MESSAGES: "brandroom_messages",
  USER: "brandroom_user",
  DESIGNERS: "brandroom_designers",
};

export const DEFAULT_USER: User = {
  id: "user-default",
  name: "Alex Vance",
  email: "alex@vantagerobotics.com",
  role: "company",
  avatar: "AV",
  title: "VP of Product & Brand",
  companyName: "Vantage Robotics",
};

export const DEFAULT_DESIGNER_USER: User = {
  id: "des-1",
  name: "Alex Morgan",
  email: "alex@morgan.design",
  role: "designer",
  avatar: "AM",
  title: "Creative Director",
};

function isClient(): boolean {
  return typeof window !== "undefined";
}

// ----------------- Projects -----------------

export function getProjects(): Project[] {
  if (!isClient()) return MOCK_PROJECTS;
  try {
    const raw = localStorage.getItem(KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(MOCK_PROJECTS));
      return MOCK_PROJECTS;
    }
    return JSON.parse(raw);
  } catch {
    return MOCK_PROJECTS;
  }
}

export function getProjectById(id: string): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}

export function saveProject(project: Omit<Project, "id" | "createdAt"> & { id?: string }): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: project.id || `proj-${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0],
    recommendedCount: 8,
  };

  const existingIndex = projects.findIndex((p) => p.id === newProject.id);
  let updated: Project[];
  if (existingIndex >= 0) {
    updated = [...projects];
    updated[existingIndex] = newProject;
  } else {
    updated = [newProject, ...projects];
  }

  if (isClient()) {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("brandroom_projects_updated"));
  }
  return newProject;
}

// ----------------- Shortlist -----------------

export function getShortlist(): string[] {
  if (!isClient()) return ["des-1", "des-2", "des-4"];
  try {
    const raw = localStorage.getItem(KEYS.SHORTLIST);
    if (!raw) {
      const initial = ["des-1", "des-2", "des-4"];
      localStorage.setItem(KEYS.SHORTLIST, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return ["des-1", "des-2", "des-4"];
  }
}

export function isShortlisted(designerId: string): boolean {
  return getShortlist().includes(designerId);
}

export function toggleShortlist(designerId: string): boolean {
  if (!isClient()) return false;
  const current = getShortlist();
  let updated: string[];
  let added = false;
  if (current.includes(designerId)) {
    updated = current.filter((id) => id !== designerId);
  } else {
    updated = [...current, designerId];
    added = true;
  }
  localStorage.setItem(KEYS.SHORTLIST, JSON.stringify(updated));
  window.dispatchEvent(new Event("brandroom_shortlist_updated"));
  return added;
}

export function removeFromShortlist(designerId: string): void {
  if (!isClient()) return;
  const current = getShortlist();
  const updated = current.filter((id) => id !== designerId);
  localStorage.setItem(KEYS.SHORTLIST, JSON.stringify(updated));
  window.dispatchEvent(new Event("brandroom_shortlist_updated"));
}

// ----------------- Designers -----------------

export function getDesigners(): Designer[] {
  if (!isClient()) return MOCK_DESIGNERS;
  try {
    const raw = localStorage.getItem(KEYS.DESIGNERS);
    if (!raw) {
      localStorage.setItem(KEYS.DESIGNERS, JSON.stringify(MOCK_DESIGNERS));
      return MOCK_DESIGNERS;
    }
    return JSON.parse(raw);
  } catch {
    return MOCK_DESIGNERS;
  }
}

export function getDesignerById(id: string): Designer | undefined {
  const designers = getDesigners();
  return designers.find((d) => d.id === id);
}

export function updateDesignerProfile(updatedDesigner: Designer): void {
  const designers = getDesigners();
  const idx = designers.findIndex((d) => d.id === updatedDesigner.id);
  if (idx >= 0) {
    designers[idx] = updatedDesigner;
  } else {
    designers.unshift(updatedDesigner);
  }
  if (isClient()) {
    localStorage.setItem(KEYS.DESIGNERS, JSON.stringify(designers));
    window.dispatchEvent(new Event("brandroom_designers_updated"));
  }
}

export function addPortfolioItem(designerId: string, item: Omit<PortfolioProject, "id" | "designerId">): PortfolioProject {
  const designers = getDesigners();
  const designer = designers.find((d) => d.id === designerId);
  const newItem: PortfolioProject = {
    ...item,
    id: `port-${Date.now()}`,
    designerId,
  };
  if (designer) {
    designer.portfolio = [newItem, ...(designer.portfolio || [])];
    updateDesignerProfile(designer);
  }
  return newItem;
}

export function deletePortfolioItem(designerId: string, portfolioId: string): void {
  const designers = getDesigners();
  const designer = designers.find((d) => d.id === designerId);
  if (designer && designer.portfolio) {
    designer.portfolio = designer.portfolio.filter((p) => p.id !== portfolioId);
    updateDesignerProfile(designer);
  }
}

// ----------------- Messaging -----------------

export function getConversations(): Conversation[] {
  if (!isClient()) return MOCK_CONVERSATIONS;
  try {
    const raw = localStorage.getItem(KEYS.CONVERSATIONS);
    if (!raw) {
      localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(MOCK_CONVERSATIONS));
      return MOCK_CONVERSATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return MOCK_CONVERSATIONS;
  }
}

export function getMessages(conversationId: string): Message[] {
  if (!isClient()) return MOCK_MESSAGES[conversationId] || [];
  try {
    const raw = localStorage.getItem(KEYS.MESSAGES);
    const store: Record<string, Message[]> = raw ? JSON.parse(raw) : MOCK_MESSAGES;
    return store[conversationId] || [];
  } catch {
    return MOCK_MESSAGES[conversationId] || [];
  }
}

export function sendMessage(conversationId: string, text: string, senderName = "Alex Vance"): Message {
  if (!isClient()) {
    return {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: "comp-user",
      senderName,
      senderAvatar: "AV",
      text,
      timestamp: "Just now",
      isCurrentUser: true,
    };
  }

  const rawMessages = localStorage.getItem(KEYS.MESSAGES);
  const allMessages: Record<string, Message[]> = rawMessages
    ? JSON.parse(rawMessages)
    : { ...MOCK_MESSAGES };

  const currentList = allMessages[conversationId] || [];
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: "comp-user",
    senderName,
    senderAvatar: "AV",
    text,
    timestamp: "Just now",
    isCurrentUser: true,
  };

  allMessages[conversationId] = [...currentList, newMessage];
  localStorage.setItem(KEYS.MESSAGES, JSON.stringify(allMessages));

  // Update conversation last message
  const conversations = getConversations();
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = text;
    conv.lastMessageTime = "Just now";
    localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }

  window.dispatchEvent(new Event("brandroom_messages_updated"));
  return newMessage;
}

export function startOrGetConversation(designer: Designer): Conversation {
  const conversations = getConversations();
  const existing = conversations.find((c) => c.participantId === designer.id);
  if (existing) return existing;

  const newConv: Conversation = {
    id: `conv-${Date.now()}`,
    participantId: designer.id,
    participantName: designer.name,
    participantRole: designer.role,
    participantAvatar: designer.initials,
    lastMessage: "Draft conversation initialized",
    lastMessageTime: "Just now",
    unreadCount: 0,
    projectName: "Enterprise Rebranding",
  };

  const updated = [newConv, ...conversations];
  if (isClient()) {
    localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event("brandroom_messages_updated"));
  }
  return newConv;
}

// ----------------- Auth / User -----------------

export function getCurrentUser(): User {
  if (!isClient()) return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(KEYS.USER);
    if (!raw) {
      localStorage.setItem(KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
}

export function setCurrentUser(user: User): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  window.dispatchEvent(new Event("brandroom_user_updated"));
}

export function logout(): void {
  if (!isClient()) return;
  localStorage.removeItem(KEYS.USER);
  window.dispatchEvent(new Event("brandroom_user_updated"));
}
