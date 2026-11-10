"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Check,
  UserCheck,
  Handshake,
  Trash2,
} from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/lib/demo";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    try {
      setLoading(true);
      const data = getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    fetchNotifications();
  };

  const handleMarkSingleRead = (id: string) => {
    markNotificationAsRead(id);
    fetchNotifications();
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    fetchNotifications();
  };

  const typeIcons: Record<string, any> = {
    task_assigned: UserCheck,
    task_overdue: AlertTriangle,
    ticket_escalated: ShieldAlert,
    vendor_pending: Handshake,
    system: Bell,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Operational Notification Center
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time alerts for task assignments, overdue milestones, ticket escalations, and vendor reviews.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-mono transition-colors"
        >
          <Check className="w-3.5 h-3.5 text-slate-400" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* 2. NOTIFICATIONS LIST */}
      {loading ? (
        <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
      ) : notifications.length === 0 ? (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-12 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">All caught up</h3>
          <p className="text-xs text-slate-400">Zero unread notifications or escalations.</p>
        </div>
      ) : (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/5">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            const isUnread = !n.isRead && n.is_read !== 1;

            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  isUnread ? "bg-white/[0.03]" : "bg-transparent hover:bg-white/[0.01]"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === "task_overdue" || n.type === "ticket_escalated"
                        ? "bg-red-950/80 text-red-400 border border-red-800/60"
                        : "bg-blue-950/80 text-blue-400 border border-blue-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{n.title}</span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {n.message}
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 pt-0.5">
                      {new Date(n.createdAt || n.created_at || Date.now()).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => handleMarkSingleRead(n.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-slate-300 hover:text-white transition-colors"
                    >
                      View &rarr;
                    </Link>
                  )}
                  {isUnread && (
                    <button
                      onClick={() => handleMarkSingleRead(n.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(n.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
