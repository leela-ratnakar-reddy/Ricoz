/**
 * RICOZ Admin — Frontend Demo Notifications Service
 */

import { Notification } from "@/lib/admin/types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage";
import { DEFAULT_NOTIFICATIONS } from "./seedData";

export function getNotifications(unreadOnly = false): Notification[] {
  let notifications = getStorageItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);

  if (unreadOnly) {
    notifications = notifications.filter((n) => !n.isRead);
  }

  // Sort newest first
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export function markNotificationAsRead(id: string): boolean {
  const notifications = getStorageItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx === -1) return false;

  notifications[idx].isRead = true;
  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  return true;
}

export function markAllNotificationsAsRead(): boolean {
  const notifications = getStorageItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  const updated = notifications.map((n) => ({ ...n, isRead: true }));
  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  return true;
}

export function deleteNotification(id: string): boolean {
  const notifications = getStorageItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  const filtered = notifications.filter((n) => n.id !== id);
  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, filtered);
  return true;
}

export function addNotification(
  title: string,
  message: string,
  type: Notification["type"] = "system",
  link: string | null = null
): Notification {
  const notifications = getStorageItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);

  const newNotif: Notification = {
    id: `notif-${Date.now().toString(36)}`,
    title,
    message,
    type,
    link,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifications]);
  return newNotif;
}
