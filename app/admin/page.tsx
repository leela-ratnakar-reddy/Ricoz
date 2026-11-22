"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Briefcase,
  Sparkles,
  LifeBuoy,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Award,
  Users2,
  FileCheck2,
  ChevronRight,
  ExternalLink,
  Flame,
  CheckSquare,
  Bot,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { adminApi } from "@/lib/admin/apiClient";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"executive" | "tactical">("executive");
  const [range, setRange] = useState<"all" | "30d" | "7d" | "today">("all");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.dashboard.getStats(undefined, range);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error loading platform command center:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time polling when autoRefresh is enabled (every 30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-white/[0.04] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const recentUsers = data?.recentUsers || [];
  const recentOpportunities = data?.recentOpportunities || [];
  const recentApplications = data?.recentApplications || [];
  const recentActivity = data?.recentActivity || [];
  const tacticalQueues = data?.tacticalQueues || {};
  const operationalAlerts = data?.operationalAlerts || [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER & CONTROLS STRIP */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>OPERATIONS COMMAND CENTER V4.1</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Platform Operations & Governance</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time telemetry and management across creative specialists, enterprise clients, and operational workflows.
          </p>
        </div>

        {/* View Switcher, Range Filter, & Sync */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Executive / Tactical View Switcher */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode("executive")}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                viewMode === "executive"
                  ? "bg-red-600 text-white font-bold shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Executive View
            </button>
            <button
              onClick={() => setViewMode("tactical")}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                viewMode === "tactical"
                  ? "bg-red-600 text-white font-bold shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tactical View
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 text-xs font-mono">
            {(["all", "30d", "7d", "today"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all ${
                  range === r ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {r === "all" ? "All Time" : r === "30d" ? "30D" : r === "7d" ? "7D" : "Today"}
              </button>
            ))}
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider transition-colors ${
              autoRefresh
                ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-400"
                : "bg-neutral-900 border-white/10 text-neutral-400 hover:text-white"
            }`}
            title={autoRefresh ? "Auto-refresh active (30s interval)" : "Click to enable auto-refresh"}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
            <span>{autoRefresh ? "Live 30s" : "Sync Off"}</span>
          </button>

          {/* Manual Sync Button */}
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded-xl border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-400" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL ALERTS STRIP */}
      {operationalAlerts.length > 0 && (
        <div className="space-y-2">
          {operationalAlerts.map((alert: any) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
                alert.severity === "critical"
                  ? "bg-red-950/40 border-red-800/50 text-red-200"
                  : alert.severity === "warning"
                  ? "bg-amber-950/40 border-amber-800/50 text-amber-200"
                  : "bg-blue-950/40 border-blue-800/50 text-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {alert.severity === "critical" ? (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                ) : alert.severity === "warning" ? (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold uppercase tracking-wider font-mono mr-2">[{alert.title}]</span>
                  <span>{alert.message}</span>
                </div>
              </div>

              {alert.href && (
                <Link
                  href={alert.href}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider hover:underline ml-4 shrink-0 text-white"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. EXECUTIVE VIEW */}
      {viewMode === "executive" && (
        <div className="space-y-8">
          {/* Real PostgreSQL Platform KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Platform Accounts */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                  Platform Accounts
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {kpis.totalUsers || 0}
                </div>
                <span className="text-xs text-neutral-400 font-sans">registered users</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400">{kpis.talentUsers || 0} Talent</span>
                <span className="text-blue-400">{kpis.companyUsers || 0} Companies</span>
                <span className="text-neutral-400">{kpis.activeUsers || 0} Active</span>
              </div>
            </div>

            {/* Card 2: Signup Velocity */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                  Signup Velocity
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  +{kpis.newThisWeek || 0}
                </div>
                <span className="text-xs text-neutral-400 font-sans">new past 7 days</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Today: <strong className="text-white">+{kpis.newToday || 0}</strong></span>
                <span>Past 30 Days: <strong className="text-white">+{kpis.newThisMonth || 0}</strong></span>
              </div>
            </div>

            {/* Card 3: Roster Vetting */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                  Roster Vetting
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {kpis.verifiedUsers || 0}
                </div>
                <span className="text-xs text-neutral-400 font-sans">verified accounts</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-400">{kpis.unverifiedUsers || 0} Pending Review</span>
                <span className="text-neutral-400">
                  {kpis.totalUsers > 0 ? Math.round(((kpis.verifiedUsers || 0) / kpis.totalUsers) * 100) : 0}% rate
                </span>
              </div>
            </div>

            {/* Card 4: Project Mandates */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                  Project Mandates
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {kpis.totalOpportunities || 0}
                </div>
                <span className="text-xs text-neutral-400 font-sans">total published</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span className="text-emerald-400">{kpis.activeOpportunities || 0} Active</span>
                <span className="text-blue-400">{kpis.matchingOpportunities || 0} Matching</span>
                <span>{kpis.closedOpportunities || 0} Closed</span>
              </div>
            </div>

            {/* Card 5: Proposals Pipeline */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                  Proposals Pipeline
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {kpis.totalApplications || 0}
                </div>
                <span className="text-xs text-neutral-400 font-sans">submitted proposals</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-400">{kpis.pendingApplications || 0} Pending</span>
                <span className="text-emerald-400">{kpis.acceptedApplications || 0} Accepted</span>
                <span className="text-neutral-400">{kpis.declinedApplications || 0} Declined</span>
              </div>
            </div>

            {/* Card 6: Support & SLA */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                  Support & SLA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {kpis.openTickets || 0}
                </div>
                <span className="text-xs text-neutral-400 font-sans">open tickets</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-red-400">{kpis.criticalTickets || 0} Critical</span>
                <span className="text-emerald-400">{kpis.resolvedTicketsRate || 100}% SLA Met</span>
                <span className="text-neutral-400">{kpis.newEnquiries || 0} Inquiries</span>
              </div>
            </div>
          </div>

          {/* 4 Detail Grid Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section A: Recent Platform Registrations */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-bold text-white font-sans">Recent Registrations</h3>
                </div>
                <Link href="/admin/users" className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  No user registrations found for selected range.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentUsers.map((u: any) => (
                    <div key={u.id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-semibold text-white truncate">{u.full_name || "Unnamed Account"}</div>
                        <div className="text-[11px] text-neutral-400 font-mono truncate">{u.email}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                            u.account_type === "talent"
                              ? "bg-purple-950/60 text-purple-400 border border-purple-800/40"
                              : "bg-blue-950/60 text-blue-400 border border-blue-800/40"
                          }`}
                        >
                          {u.account_type}
                        </span>
                        {u.is_verified ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section B: Recent Project Mandates */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-sans">Recent Mandates</h3>
                </div>
                <Link href="/admin/opportunities" className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentOpportunities.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  No project mandates published yet. Client-submitted briefs will appear here for administrative moderation.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentOpportunities.map((op: any) => (
                    <div key={op.id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-semibold text-white truncate">{op.title}</div>
                        <div className="text-[11px] text-neutral-400 font-mono truncate">
                          {op.company_name} • {op.industry || "General"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-neutral-400">
                          {op.applications_count || 0} proposals
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-neutral-900 border border-white/10 text-white">
                          {op.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section C: Recent Proposals Submitted */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-sans">Recent Proposals</h3>
                </div>
                <Link href="/admin/applications" className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1">
                  <span>View Pipeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentApplications.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  No proposals submitted yet. Talent proposals on active mandates will appear here.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentApplications.map((app: any) => (
                    <div key={app.id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-semibold text-white truncate">{app.talent_name || "Creative Specialist"}</div>
                        <div className="text-[11px] text-neutral-400 font-mono truncate">
                          Mandate: {app.project_title || "Project"} • {app.company_name || ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          ${app.proposed_rate || "N/A"}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-neutral-900 border border-white/10 text-white">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section D: Administrative & Platform Audit Trail */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white font-sans">Platform Audit Trail</h3>
                </div>
                <Link href="/admin/audit-log" className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1">
                  <span>Full Log</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  No audit activity recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentActivity.map((log: any) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-medium text-white truncate">
                          <span className="font-mono text-red-400 font-bold">{log.action}</span> • {log.actor_name || "System"}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono truncate">
                          {log.change_summary || log.entity_type}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 shrink-0">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. TACTICAL VIEW */}
      {viewMode === "tactical" && (
        <div className="space-y-6">
          {/* Tactical Hub Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/admin/incidents"
              className="p-4 rounded-xl bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-800/40 hover:border-red-600 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </div>
              <div className="text-xs font-bold text-white">Incident War Room</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Critical response & triage</div>
            </Link>

            <Link
              href="/admin/tasks"
              className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-800/40 hover:border-blue-600 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckSquare className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </div>
              <div className="text-xs font-bold text-white">Tasks & Workflows</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{kpis.activeTasks || 0} active deliverables</div>
            </Link>

            <Link
              href="/admin/ai-studio"
              className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-800/40 hover:border-purple-600 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <Bot className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </div>
              <div className="text-xs font-bold text-white">Admin AI Studio</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Operational intelligence</div>
            </Link>

            <Link
              href="/admin/support"
              className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-800/40 hover:border-emerald-600 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <LifeBuoy className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </div>
              <div className="text-xs font-bold text-white">Support Helpdesk</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{kpis.openTickets || 0} open SLA tickets</div>
            </Link>
          </div>

          {/* 3 Dedicated Tactical Action Queues */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Queue 1: Pending Verifications */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white font-sans">Pending KYC & Review</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-400 border border-purple-800/40 font-bold">
                    {tacticalQueues.pendingVerifications?.length || 0}
                  </span>
                </div>

                {tacticalQueues.pendingVerifications?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                    All registered accounts are verified.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {tacticalQueues.pendingVerifications.map((item: any) => (
                      <div key={item.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{item.full_name || "Applicant"}</span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.account_type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{item.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-white/5">
                <Link
                  href="/admin/talent"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-mono uppercase tracking-wider text-slate-200 transition-colors"
                >
                  <span>Review Talent Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Queue 2: Urgent Support Tickets */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-bold text-white font-sans">Open SLA Tickets</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/40 font-bold">
                    {tacticalQueues.actionTickets?.length || 0}
                  </span>
                </div>

                {tacticalQueues.actionTickets?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                    Zero open support tickets. Support queue is clean.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {tacticalQueues.actionTickets.map((t: any) => (
                      <div key={t.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white font-mono">{t.ticket_ref}</span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                              t.priority === "critical"
                                ? "bg-red-950/80 text-red-400 border border-red-800/40"
                                : t.priority === "high"
                                ? "bg-amber-950/80 text-amber-400 border border-amber-800/40"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 truncate">{t.customer_name} ({t.category})</div>
                        <div className="text-[10px] text-slate-500 font-mono">Status: {t.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-white/5">
                <Link
                  href="/admin/support"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-mono uppercase tracking-wider text-slate-200 transition-colors"
                >
                  <span>Open Helpdesk Desk</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Queue 3: Operational Deliverables Needing Attention */}
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white font-sans">Blocked or Overdue Tasks</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/40 font-bold">
                    {tacticalQueues.attentionTasks?.length || 0}
                  </span>
                </div>

                {tacticalQueues.attentionTasks?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                    Zero blocked or overdue tasks. Delivery schedule on track.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {tacticalQueues.attentionTasks.map((task: any) => (
                      <div key={task.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate max-w-[180px]">{task.title}</span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                              task.status === "blocked"
                                ? "bg-red-950/80 text-red-400 border border-red-800/40"
                                : "bg-amber-950/80 text-amber-400 border border-amber-800/40"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                        {task.blocker_note && (
                          <div className="text-[10px] text-red-400 font-mono truncate">
                            Blocker: {task.blocker_note}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono">
                          Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "Unscheduled"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-white/5">
                <Link
                  href="/admin/tasks"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-mono uppercase tracking-wider text-slate-200 transition-colors"
                >
                  <span>Open Task Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
