"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { adminApi } from "@/lib/admin/apiClient";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.dashboard.getStats();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error loading platform command center:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER & ACTIONS STRIP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>PLATFORM COMMAND CENTER</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Platform Operations & Governance</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time telemetry and management across creative specialists, enterprise clients, and project mandates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded border border-white/10 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Advanced Analytics</span>
          </Link>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-400" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. REAL POSTGRESQL PLATFORM KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Platform Users */}
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

        {/* Card 2: User Signups Growth */}
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
              {kpis.newThisWeek || 0}
            </div>
            <span className="text-xs text-neutral-400 font-sans">new this week</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-300">{kpis.newToday || 0} today</span>
            <span className="text-neutral-400">{kpis.newThisMonth || 0} this month</span>
            <span className="text-emerald-400">Real Database</span>
          </div>
        </div>

        {/* Card 3: Account Verification & Health */}
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
            <span className="text-xs text-neutral-400 font-sans">verified entities</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-semibold">
              {kpis.totalUsers > 0 ? Math.round((kpis.verifiedUsers / kpis.totalUsers) * 100) : 0}% vetted
            </span>
            <span className={kpis.suspendedUsers > 0 ? "text-red-400 font-bold" : "text-neutral-500"}>
              {kpis.suspendedUsers || 0} suspended
            </span>
          </div>
        </div>

        {/* Card 4: Opportunities & Mandates */}
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
            <span className="text-xs text-neutral-400 font-sans">published briefs</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
            <span className="text-blue-400">{kpis.matchingOpportunities || 0} matching</span>
            <span className="text-emerald-400">{kpis.activeOpportunities || 0} active</span>
            <span className="text-neutral-500">{kpis.closedOpportunities || 0} closed</span>
          </div>
        </div>

        {/* Card 5: Proposals & Conversion */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400 flex items-center justify-center">
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
            <span className="text-xs text-neutral-400 font-sans">proposals received</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-400">{kpis.pendingApplications || 0} pending</span>
            <span className="text-emerald-400 font-bold">{kpis.acceptedApplications || 0} awarded</span>
            <span className="text-neutral-400">${kpis.avgProposedRate || 0} avg</span>
          </div>
        </div>

        {/* Card 6: Support Tickets & SLA */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/15 text-neutral-300 flex items-center justify-center">
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
            <span className="text-xs text-neutral-400 font-sans">open issues</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
            <span className={kpis.criticalTickets > 0 ? "text-red-400 font-bold" : "text-neutral-500"}>
              {kpis.criticalTickets || 0} critical
            </span>
            <span className="text-emerald-400">{kpis.resolvedTicketsRate || 100}% SLA rate</span>
            <span className="text-neutral-400">{kpis.newEnquiries || 0} enquiries</span>
          </div>
        </div>
      </div>

      {/* 3. PLATFORM MANAGEMENT DIRECT SHORTCUTS */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-white tracking-tight">Marketplace Operations Management</h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">PostgreSQL Synchronized</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/users"
            className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 rounded-xl transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400 flex items-center justify-center mb-2">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-medium text-white group-hover:text-blue-400 transition-colors">Users Directory</div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{kpis.totalUsers || 0} accounts</div>
          </Link>

          <Link
            href="/admin/talent"
            className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 rounded-xl transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center mb-2">
              <Users2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-medium text-white group-hover:text-purple-400 transition-colors">Talent Roster</div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{kpis.talentUsers || 0} specialists</div>
          </Link>

          <Link
            href="/admin/companies"
            className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 rounded-xl transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 flex items-center justify-center mb-2">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-medium text-white group-hover:text-indigo-400 transition-colors">Enterprise Clients</div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{kpis.companyUsers || 0} enterprises</div>
          </Link>

          <Link
            href="/admin/opportunities"
            className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 rounded-xl transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center mb-2">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-medium text-white group-hover:text-amber-400 transition-colors">Mandates & Briefs</div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{kpis.totalOpportunities || 0} briefs</div>
          </Link>

          <Link
            href="/admin/applications"
            className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 rounded-xl transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400 flex items-center justify-center mb-2">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-medium text-white group-hover:text-rose-400 transition-colors">Proposals Pipeline</div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{kpis.totalApplications || 0} pitches</div>
          </Link>

          <Link
            href="/admin/analytics"
            className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 rounded-xl transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors">Analytics & Funnel</div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Telemetry Charts</div>
          </Link>
        </div>
      </div>

      {/* 4. REAL DATABASE RECORDS & RECENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Recent Users & Project Mandates */}
        <div className="lg:col-span-7 space-y-6">
          {/* Panel A: Recent Registrations */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Recent Platform Registrations</h3>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-mono text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>View All ({kpis.totalUsers || 0})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-neutral-950/40 rounded-xl border border-white/5">
                No platform registrations recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentUsers.map((u: any) => (
                  <div key={u.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white overflow-hidden shrink-0">
                        {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white flex items-center gap-1.5">
                          {u.full_name}
                          {u.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                          u.account_type === "talent"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {u.account_type}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel B: Recent Opportunities / Mandates */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Recent Opportunities & Mandates</h3>
              </div>
              <Link
                href="/admin/opportunities"
                className="text-xs font-mono text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>View All ({kpis.totalOpportunities || 0})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOpportunities.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-neutral-950/40 rounded-xl border border-white/5">
                No project mandates published yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentOpportunities.map((opp: any) => (
                  <div key={opp.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <div className="text-xs font-medium text-white">{opp.title}</div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {opp.company_name} • {opp.budget_tier || "Standard"}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-neutral-400">
                        {opp.applications_count || 0} proposals
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-white/10">
                        {opp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Proposals & Live Audit Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Panel C: Recent Proposals */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Recent Proposals</h3>
              </div>
              <Link
                href="/admin/applications"
                className="text-xs font-mono text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>View All ({kpis.totalApplications || 0})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-neutral-950/40 rounded-xl border border-white/5">
                No specialist proposals submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentApplications.map((app: any) => (
                  <div key={app.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <div className="text-xs font-medium text-white">{app.talent_name || "Specialist"}</div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5 truncate max-w-[180px]">
                        for {app.project_title || "Project"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-400">
                        ${app.proposed_rate || "—"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-white/10">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel D: Live Platform Activity Stream */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Platform Audit Trail</h3>
              </div>
              <Link
                href="/admin/audit-log"
                className="text-xs font-mono text-neutral-400 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <span>Full Trail</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-neutral-950/40 rounded-xl border border-white/5">
                No activity available yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="p-3 bg-neutral-950/40 rounded-xl border border-white/5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-red-400 tracking-wider">
                        {item.action}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString() : ""}
                      </span>
                    </div>
                    <p className="text-neutral-300 text-xs line-clamp-1 leading-snug">
                      {item.change_summary || "System action performed."}
                    </p>
                    <div className="text-[10px] text-neutral-500 font-mono mt-1">
                      By {item.actor_name || "System"} ({item.actor_role || "automated"})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
