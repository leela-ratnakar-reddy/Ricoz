"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, ExternalLink, ShieldCheck, Plus, Check } from "lucide-react";
import { AdminUser } from "@/lib/admin/types";

interface AdminHeaderProps {
  user: AdminUser;
  onOpenMobileMenu: () => void;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  unreadNotificationCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  onOpenMobileMenu,
  title,
  breadcrumbs = [],
  unreadNotificationCount = 0,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-16 bg-[#0A0D14]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={b.label}>
                  {i > 0 && <span>/</span>}
                  {b.href ? (
                    <Link href={b.href} className="hover:text-slate-300 transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-slate-400">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none mt-0.5">
            {title || "Operations Control"}
          </h1>
        </div>
      </div>

      {/* Right: Quick Search, Notifications, Quick Actions, Public Platform link */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Quick Search Form */}
        <form onSubmit={handleSearchSubmit} className="hidden md:block relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, clients, tickets..."
            className="w-48 lg:w-64 pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono transition-all focus:w-72"
          />
        </form>

        {/* In-app Notification Icon */}
        <Link
          href="/admin/notifications"
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0A0D14]" />
          )}
        </Link>

        {/* Public platform return link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </Link>
      </div>
    </header>
  );
};
