"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Heart,
  MessageSquare,
  Building2,
  UserCheck,
  Briefcase,
  Layers,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { getShortlist, getConversations, getCurrentUser, DEFAULT_USER } from "@/lib/storage";

interface DashboardSidebarProps {
  role?: "company" | "designer";
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ role = "company" }) => {
  const pathname = usePathname();
  const [shortlistCount, setShortlistCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [user, setUser] = useState(DEFAULT_USER);

  useEffect(() => {
    const updateStats = () => {
      setShortlistCount(getShortlist().length);
      const convs = getConversations();
      const unread = convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      setUnreadMsgCount(unread);
      setUser(getCurrentUser());
    };

    updateStats();
    window.addEventListener("brandroom_shortlist_updated", updateStats);
    window.addEventListener("brandroom_messages_updated", updateStats);
    window.addEventListener("brandroom_user_updated", updateStats);
    return () => {
      window.removeEventListener("brandroom_shortlist_updated", updateStats);
      window.removeEventListener("brandroom_messages_updated", updateStats);
      window.removeEventListener("brandroom_user_updated", updateStats);
    };
  }, []);

  const companyNav = [
    { label: "Overview", href: "/dashboard/company", icon: LayoutDashboard },
    { label: "Projects", href: "/dashboard/company/projects", icon: FolderKanban },
    { label: "Recommendations", href: "/dashboard/company/recommendations", icon: Sparkles },
    {
      label: "Shortlist",
      href: "/dashboard/company/shortlist",
      icon: Heart,
      badge: shortlistCount > 0 ? shortlistCount : undefined,
    },
    {
      label: "Messages",
      href: "/dashboard/company/messages",
      icon: MessageSquare,
      badge: unreadMsgCount > 0 ? unreadMsgCount : undefined,
    },
    { label: "Company Profile", href: "/dashboard/company/profile", icon: Building2 },
  ];

  const designerNav = [
    { label: "Overview", href: "/dashboard/designer", icon: LayoutDashboard },
    { label: "Profile", href: "/dashboard/designer/profile", icon: UserCheck },
    { label: "Portfolio", href: "/dashboard/designer/portfolio", icon: Layers },
    { label: "Opportunities", href: "/dashboard/designer/opportunities", icon: Briefcase },
    {
      label: "Messages",
      href: "/dashboard/designer/messages",
      icon: MessageSquare,
      badge: unreadMsgCount > 0 ? unreadMsgCount : undefined,
    },
  ];

  const navItems = role === "company" ? companyNav : designerNav;

  return (
    <aside className="w-full lg:w-64 bg-[#FFF9F3] border-r border-[#E6D8CF] p-4 lg:p-6 shrink-0 flex flex-col justify-between select-none">
      <div>
        {/* User Card in Sidebar */}
        <div className="flex items-center gap-3 p-3 mb-6 bg-white border border-[#E6D8CF] rounded-xl shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-[#E0CEC3]/40 text-espresso font-serif text-xs flex items-center justify-center font-bold shrink-0 border border-[#E6D8CF]">
            {role === "company" ? "AV" : "AM"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-espresso truncate">
              {role === "company" ? user.companyName || "Vantage Robotics" : user.name || "Alex Morgan"}
            </p>
            <p className="text-[10px] text-muted font-mono truncate">
              {role === "company" ? "Enterprise Workspace" : "Creative Director Studio"}
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest uppercase text-taupe px-3 mb-2 font-semibold">
            {role === "company" ? "Company Workspace" : "Designer Studio"}
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/company" &&
                item.href !== "/dashboard/designer" &&
                pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-espresso font-semibold border-l-2 border-accent shadow-2xs"
                    : "text-muted hover:text-espresso hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-taupe"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      isActive ? "bg-accent text-[#FFF9F3]" : "bg-[#E0CEC3]/40 text-espresso"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switch role helper */}
      <div className="mt-8 pt-4 border-t border-[#E6D8CF] space-y-2">
        <Link
          href={role === "company" ? "/dashboard/designer" : "/dashboard/company"}
          className="flex items-center justify-between text-xs text-muted hover:text-accent p-2 rounded-lg hover:bg-white transition-colors font-mono"
        >
          <span>Switch to {role === "company" ? "Designer Studio" : "Company View"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted hover:text-espresso p-2 rounded-lg hover:bg-white transition-colors font-mono"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit to Public Site</span>
        </Link>
      </div>
    </aside>
  );
};
