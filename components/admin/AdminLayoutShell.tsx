"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminUser } from "@/lib/admin/types";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export const AdminLayoutShell: React.FC<AdminLayoutShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<{
    overdueTasks?: number;
    openTickets?: number;
    pendingVendors?: number;
    unreadNotifications?: number;
  }>({});

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Force dark theme styling inside the admin portal
    document.documentElement.style.backgroundColor = "#07080C";
    document.documentElement.style.color = "#F5F5F0";
    document.body.style.backgroundColor = "#07080C";
    document.body.style.color = "#F5F5F0";

    const fetchSessionAndBadges = async () => {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (!res.ok) {
          if (!isLoginPage) {
            router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);

          // Fetch operations badges
          try {
            const badgeRes = await fetch("/api/admin/dashboard/badges");
            if (badgeRes.ok) {
              const bData = await badgeRes.json();
              if (bData.success) {
                setBadgeCounts(bData.counts);
              }
            }
          } catch {
            // Non-blocking
          }
        } else if (!isLoginPage) {
          router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
        }
      } catch {
        if (!isLoginPage) {
          router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndBadges();
  }, [pathname, isLoginPage, router]);

  // If on login page, render clean page without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while verifying server authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080C] text-slate-300 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#07080C] text-[#F5F5F0] flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Sidebar */}
      <AdminSidebar
        user={user}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        badgeCounts={badgeCounts}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <AdminHeader
          user={user}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          unreadNotificationCount={badgeCounts.unreadNotifications}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
