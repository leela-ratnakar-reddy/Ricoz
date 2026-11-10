"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminUser } from "@/lib/admin/types";
import { getDemoSession, getDashboardBadges, resetAllDemoData } from "@/lib/demo";
import { AlertCircle, RotateCcw, Sparkles, Check, X } from "lucide-react";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export const AdminLayoutShell: React.FC<AdminLayoutShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<{
    overdueTasks?: number;
    openTickets?: number;
    pendingVendors?: number;
    unreadNotifications?: number;
  }>({});

  const isLoginPage = pathname === "/admin/login";

  const refreshSessionAndBadges = useCallback(() => {
    try {
      const demoUser = getDemoSession();
      if (!demoUser) {
        if (!isLoginPage) {
          router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
        }
        setUser(null);
      } else {
        setUser(demoUser);
        const badges = getDashboardBadges();
        setBadgeCounts(badges);
      }
    } catch (err) {
      console.error("Error reading demo session:", err);
      if (!isLoginPage) {
        router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
      }
    } finally {
      setLoading(false);
    }
  }, [pathname, isLoginPage, router]);

  useEffect(() => {
    // Force dark theme styling inside the admin portal
    document.documentElement.style.backgroundColor = "#07080C";
    document.documentElement.style.color = "#F5F5F0";
    document.body.style.backgroundColor = "#07080C";
    document.body.style.color = "#F5F5F0";

    refreshSessionAndBadges();

    // Listen to demo storage events for cross-component reactive updates
    const handleStorageChange = () => {
      refreshSessionAndBadges();
    };

    window.addEventListener("ricoz_demo_storage_change", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("ricoz_demo_storage_change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshSessionAndBadges]);

  const handleConfirmReset = () => {
    resetAllDemoData();
    setShowResetConfirm(false);
    setResetSuccess(true);
    refreshSessionAndBadges();
    setTimeout(() => {
      setResetSuccess(false);
      window.location.reload();
    }, 800);
  };

  // If on login page, render clean page without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while verifying client demo session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080C] text-slate-300 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400">
            Initializing Demo Operations Console...
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
        {/* Top Simulated Prototype Disclosure Banner */}
        <div className="bg-amber-950/60 border-b border-amber-600/30 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              DEMO MODE
            </span>
            <span className="text-[11px] text-amber-200/90 hidden sm:inline">
              Frontend prototype &bull; Realistic mock data persisted in LocalStorage &bull; No backend connection required
            </span>
            <span className="text-[11px] text-amber-200/90 sm:hidden">
              Frontend Prototype &bull; LocalStorage
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 hover:text-white font-mono text-[11px] border border-amber-500/30 transition-colors"
              title="Reset all tasks, clients, tickets and demo data to original baseline"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset Demo Data?</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    This will restore all departments, tasks, clients, vendors, tickets, and team members to their default realistic sample state in your browser. Any custom tasks or changes you made will be refreshed.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-mono text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Success Toast */}
        {resetSuccess && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 text-xs shadow-2xl font-mono animate-in slide-in-from-bottom duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Demo data reset successfully! Reloading...</span>
          </div>
        )}

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
