"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Building2,
  Handshake,
  Users2,
  LifeBuoy,
  FileText,
  BarChart3,
  ShieldAlert,
  Bell,
  LogOut,
  ChevronRight,
  Shield,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { AdminUser, AdminRole } from "@/lib/admin/types";
import { demoLogout } from "@/lib/demo";

interface AdminSidebarProps {
  user: AdminUser;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  badgeCounts?: {
    overdueTasks?: number;
    openTickets?: number;
    pendingVendors?: number;
    unreadNotifications?: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  user,
  mobileOpen,
  onCloseMobile,
  badgeCounts = {},
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    try {
      demoLogout();
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const allNavItems = [
    {
      label: "Operations Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
      permission: "dashboard.view",
    },
    {
      label: "Tasks & Workflows",
      href: "/admin/tasks",
      icon: CheckSquare,
      badge: badgeCounts.overdueTasks && badgeCounts.overdueTasks > 0 ? `${badgeCounts.overdueTasks} overdue` : undefined,
      badgeVariant: "urgent",
      permission: "tasks.view",
    },
    {
      label: "Client Management",
      href: "/admin/clients",
      icon: Building2,
      permission: "clients.view",
    },
    {
      label: "Vendor Network",
      href: "/admin/vendors",
      icon: Handshake,
      badge: badgeCounts.pendingVendors && badgeCounts.pendingVendors > 0 ? `${badgeCounts.pendingVendors} pending` : undefined,
      badgeVariant: "warning",
      permission: "vendors.view",
    },
    {
      label: "Teams & Access",
      href: "/admin/team",
      icon: UserCheck,
      permission: "users.view",
    },
    {
      label: "Departments",
      href: "/admin/departments",
      icon: Users2,
      permission: "departments.view",
    },
    {
      label: "Support & Complaints",
      href: "/admin/support",
      icon: LifeBuoy,
      badge: badgeCounts.openTickets && badgeCounts.openTickets > 0 ? `${badgeCounts.openTickets}` : undefined,
      badgeVariant: "default",
      permission: "support.view",
    },
    {
      label: "SOPs & Knowledge",
      href: "/admin/sops",
      icon: FileText,
      permission: "sops.view",
    },
    {
      label: "Reports & Analytics",
      href: "/admin/reports",
      icon: BarChart3,
      permission: "reports.view",
    },
    {
      label: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
      badge: badgeCounts.unreadNotifications && badgeCounts.unreadNotifications > 0 ? `${badgeCounts.unreadNotifications}` : undefined,
      badgeVariant: "urgent",
      permission: "notifications.view",
    },
    {
      label: "Security Audit Log",
      href: "/admin/audit-log",
      icon: ShieldAlert,
      permission: "audit_logs.view",
    },
  ];

  // Role-aware navigation: Filter items according to permissions
  const navItems = allNavItems.filter((item) => {
    if (user.role === "super_admin") return true;
    if (!item.permission) return true;
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(item.permission);
    }
    return true; // Fallback to permissive client rendering (backend strictly enforces authorization)
  });

  const roleLabels: Record<AdminRole, string> = {
    super_admin: "Owner / Super Admin",
    exec_director: "Executive Director",
    coo: "Chief Operations Officer",
    dept_head: "Department Head",
    ops_manager: "Operations Manager",
    finance_manager: "Finance Manager",
    hr_manager: "HR Manager",
    sales_manager: "Sales Manager",
    marketing_manager: "Marketing Manager",
    tech_manager: "Tech Manager",
    ai_manager: "AI & Automation Lead",
    qa_manager: "QA Manager",
    team_member: "Team Member",
    auditor: "Auditor",
    ops_admin: "Operations Admin",
    dept_manager: "Department Manager",
  };

  const roleColors: Record<AdminRole, string> = {
    super_admin: "bg-red-950/70 text-red-400 border-red-800/60",
    exec_director: "bg-purple-950/70 text-purple-400 border-purple-800/60",
    coo: "bg-orange-950/70 text-orange-400 border-orange-800/60",
    dept_head: "bg-indigo-950/70 text-indigo-400 border-indigo-800/60",
    ops_manager: "bg-amber-950/70 text-amber-400 border-amber-800/60",
    finance_manager: "bg-emerald-950/70 text-emerald-400 border-emerald-800/60",
    hr_manager: "bg-pink-950/70 text-pink-400 border-pink-800/60",
    sales_manager: "bg-cyan-950/70 text-cyan-400 border-cyan-800/60",
    marketing_manager: "bg-rose-950/70 text-rose-400 border-rose-800/60",
    tech_manager: "bg-blue-950/70 text-blue-400 border-blue-800/60",
    ai_manager: "bg-violet-950/70 text-violet-400 border-violet-800/60",
    qa_manager: "bg-teal-950/70 text-teal-400 border-teal-800/60",
    team_member: "bg-slate-800/70 text-slate-300 border-slate-700/60",
    auditor: "bg-purple-950/70 text-purple-400 border-purple-800/60",
    ops_admin: "bg-amber-950/70 text-amber-400 border-amber-800/60",
    dept_manager: "bg-blue-950/70 text-blue-400 border-blue-800/60",
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A0D14] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-md shadow-red-900/30">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white font-sans flex items-center gap-1.5">
                RICOZ <span className="text-[10px] font-mono text-red-500 font-bold px-1 py-0.2 bg-red-950/80 border border-red-900/50 rounded">ADMIN</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">OPERATIONS SUITE</span>
            </div>
          </Link>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-medium">
            Operational Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-900/20 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-white" : "text-slate-500 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : item.badgeVariant === "urgent"
                        ? "bg-red-950/80 text-red-400 border border-red-800/40"
                        : item.badgeVariant === "warning"
                        ? "bg-amber-950/80 text-amber-400 border border-amber-800/40"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User profile & session footer */}
        <div className="p-3 border-t border-white/10 bg-[#07090F]">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-slate-200">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span
                className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  roleColors[user.role] || "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {roleLabels[user.role]}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="text-[11px] text-slate-400 hover:text-red-400 inline-flex items-center gap-1 font-mono transition-colors p-1"
                title="Sign out of Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
