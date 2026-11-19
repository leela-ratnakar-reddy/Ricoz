"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Download,
  Filter,
  RefreshCw,
  ArrowRight,
  Layers,
  ChevronRight,
  Calendar,
  Sparkles,
  BarChart2,
  Activity,
  UserCheck,
  Building2,
  FileText,
} from "lucide-react";
import { adminApi } from "@/lib/admin/apiClient";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "growth" | "talent" | "companies" | "opportunities" | "applications" | "activity"
  >("overview");
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const params: { range?: string; startDate?: string; endDate?: string } = { range };
      if (range === "custom" && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }
      const res = await adminApi.analytics.getOverview(params);
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
      setError(err?.message || "Failed to load platform analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const handleCustomRangeApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      fetchAnalytics();
    }
  };

  const overview = data?.overview || {};
  const userGrowth = data?.userGrowth || [];
  const talentAnalytics = data?.talentAnalytics || {};
  const companyAnalytics = data?.companyAnalytics || {};
  const opportunityAnalytics = data?.opportunityAnalytics || {};
  const applicationAnalytics = data?.applicationAnalytics || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HEADER & CONTROLS STRIP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>INTELLIGENCE & METRICS SUITE</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
            Platform Analytics Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time, database-backed operational metrics, registration momentum, and platform velocity.
          </p>
        </div>

        {/* Global Controls & Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5 font-mono text-[11px]">
            {["7d", "30d", "90d", "6m", "12m", "custom"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  range === r
                    ? "bg-red-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-500" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* CSV Export Dropdown / Quick Links */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <div className="hidden group-hover:block absolute right-0 top-full mt-1.5 w-48 bg-[#0E1118] border border-white/15 rounded-xl shadow-2xl p-1 z-30 font-mono text-xs">
              <a
                href={adminApi.analytics.exportUrl("analytics")}
                className="block px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
              >
                Analytics Summary
              </a>
              <a
                href={adminApi.analytics.exportUrl("users")}
                className="block px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
              >
                Platform Users
              </a>
              <a
                href={adminApi.analytics.exportUrl("talent")}
                className="block px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
              >
                Talent Accounts
              </a>
              <a
                href={adminApi.analytics.exportUrl("companies")}
                className="block px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
              >
                Company Accounts
              </a>
              <a
                href={adminApi.analytics.exportUrl("opportunities")}
                className="block px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
              >
                Project Mandates
              </a>
              <a
                href={adminApi.analytics.exportUrl("applications")}
                className="block px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
              >
                Project Applications
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Date Filter Panel */}
      {range === "custom" && (
        <form
          onSubmit={handleCustomRangeApply}
          className="flex items-center gap-3 p-3 bg-[#0E1118] border border-white/10 rounded-xl font-mono text-xs text-slate-300 flex-wrap"
        >
          <span className="text-slate-400">Custom Date Window:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">From</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-red-500"
              required
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">To</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-red-500"
              required
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors text-xs"
          >
            Apply Range
          </button>
        </form>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-red-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. TABBED SUB-NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-mono">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "growth", label: "User Growth", icon: TrendingUp },
          { id: "talent", label: "Talent Analytics", icon: Users },
          { id: "companies", label: "Company Analytics", icon: Building },
          { id: "opportunities", label: "Opportunities", icon: Briefcase },
          { id: "applications", label: "Applications & Funnel", icon: Sparkles },
          { id: "activity", label: "Activity Feed", icon: Activity },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-white/10 text-white font-bold border border-white/15"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-white/[0.02] border border-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Metric Cards Row 1: Users & Registrations */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Platform Accounts & Growth</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Users</span>
                    <div className="text-2xl font-black text-white font-mono mt-1">{overview.totalUsers || 0}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{overview.activeUsers || 0} active accounts</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Talent Accounts</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{overview.talentUsers || 0}</div>
                    <div className="text-[10px] font-mono text-emerald-500 mt-1">{overview.verifiedUsers || 0} verified</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Enterprise Companies</span>
                    <div className="text-2xl font-black text-blue-400 font-mono mt-1">{overview.companyUsers || 0}</div>
                    <div className="text-[10px] font-mono text-blue-500 mt-1">{overview.totalOpportunities || 0} briefs</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">New Today</span>
                    <div className="text-2xl font-black text-purple-400 font-mono mt-1">{overview.newToday || 0}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Past 24 hours</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">New This Week</span>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-1">{overview.newThisWeek || 0}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Past 7 days</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">New This Month</span>
                    <div className="text-2xl font-black text-rose-400 font-mono mt-1">{overview.newThisMonth || 0}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Past 30 days</div>
                  </div>
                </div>
              </div>

              {/* Metric Cards Row 2: Marketplace Velocity */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>Marketplace Opportunities & Proposals</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Briefs</span>
                    <div className="text-2xl font-black text-white font-mono mt-1">{overview.totalOpportunities || 0}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{overview.activeOpportunities || 0} active</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Active Mandates</span>
                    <div className="text-2xl font-black text-blue-400 font-mono mt-1">{overview.activeOpportunities || 0}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Open for talent</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Applications</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{overview.totalApplications || 0}</div>
                    <div className="text-[10px] font-mono text-emerald-500 mt-1">{overview.pendingApplications || 0} pending</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Shortlisted</span>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-1">{overview.shortlistedApplications || 0}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">In review pipeline</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Accepted</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{overview.acceptedApplications || 0}</div>
                    <div className="text-[10px] font-mono text-emerald-500 mt-1">Awarded mandates</div>
                  </div>

                  <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block">Suspended Users</span>
                    <div className="text-2xl font-black text-red-400 font-mono mt-1">{overview.suspendedUsers || 0}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Zero-trust review</div>
                  </div>
                </div>
              </div>

              {/* Graphic Section: Growth Chart + Distribution Rings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* User Growth Line Chart (8 cols) */}
                <div className="lg:col-span-8 bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>Registration Momentum & Growth</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        New user acquisition trajectory across the selected window ({range}).
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Talent</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span>Company</span>
                      </span>
                    </div>
                  </div>

                  {userGrowth.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 text-center p-6">
                      <Clock className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-300">No registrations in this date window</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Select a wider range or check back later.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* SVG Line / Bar Visualization */}
                      <div className="h-56 w-full flex items-end gap-2 pt-6 pb-2 border-b border-white/10 relative">
                        {userGrowth.map((point: any, idx: number) => {
                          const maxVal = Math.max(...userGrowth.map((p: any) => p.total), 1);
                          const totalHeight = Math.max(12, Math.round((point.total / maxVal) * 160));
                          const talentHeight = point.total > 0 ? Math.round((point.talent / point.total) * totalHeight) : 0;
                          const companyHeight = totalHeight - talentHeight;

                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                              {/* Hover tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-black/90 border border-white/20 rounded-lg p-1.5 text-[10px] font-mono whitespace-nowrap pointer-events-none shadow-xl">
                                <div className="text-white font-bold">{point.date}</div>
                                <div className="text-emerald-400">{point.talent} Talent</div>
                                <div className="text-blue-400">{point.company} Companies</div>
                              </div>

                              <div
                                style={{ height: `${totalHeight}px` }}
                                className="w-full max-w-[32px] rounded-t flex flex-col overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/30 transition-all"
                              >
                                <div style={{ height: `${companyHeight}px` }} className="w-full bg-blue-500/80" />
                                <div style={{ height: `${talentHeight}px` }} className="w-full bg-emerald-500/80" />
                              </div>

                              <span className="text-[9px] font-mono text-slate-500 mt-2 rotate-45 truncate max-w-[40px]">
                                {point.date.slice(5)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                        <span>Window: {data?.startDate?.slice(0, 10)} to {data?.endDate?.slice(0, 10)}</span>
                        <span>Total new accounts: {userGrowth.reduce((acc: number, p: any) => acc + p.total, 0)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Status Breakdown Donut/Bars (4 cols) */}
                <div className="lg:col-span-4 bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Account Verification Status</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Platform trustworthiness ratio
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-300">Verified Talent & Companies</span>
                        <span className="text-emerald-400 font-bold">
                          {overview.totalUsers > 0
                            ? Math.round((overview.verifiedUsers / overview.totalUsers) * 100)
                            : 0}
                          % ({overview.verifiedUsers})
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          style={{
                            width: `${
                              overview.totalUsers > 0
                                ? (overview.verifiedUsers / overview.totalUsers) * 100
                                : 0
                            }%`,
                          }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-300">Pending Verification</span>
                        <span className="text-amber-400 font-bold">
                          {overview.totalUsers > 0
                            ? Math.round((overview.pendingVerification / overview.totalUsers) * 100)
                            : 0}
                          % ({overview.pendingVerification})
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          style={{
                            width: `${
                              overview.totalUsers > 0
                                ? (overview.pendingVerification / overview.totalUsers) * 100
                                : 0
                            }%`,
                          }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-300">Active vs Suspended</span>
                        <span className="text-slate-400 font-bold">
                          {overview.activeUsers} active / {overview.suspendedUsers} suspended
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
                        <div
                          style={{
                            width: `${
                              overview.totalUsers > 0
                                ? (overview.activeUsers / overview.totalUsers) * 100
                                : 100
                            }%`,
                          }}
                          className="h-full bg-blue-500"
                        />
                        <div
                          style={{
                            width: `${
                              overview.totalUsers > 0
                                ? (overview.suspendedUsers / overview.totalUsers) * 100
                                : 0
                            }%`,
                          }}
                          className="h-full bg-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <Link
                      href="/admin/users"
                      className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-slate-200 flex items-center justify-between transition-colors"
                    >
                      <span>Manage Platform Users</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER GROWTH */}
          {activeTab === "growth" && (
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">User Acquisition & Growth Analytics</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Continuous timeline tracking creative talent and enterprise registrations.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                    Talent: {overview.talentUsers || 0}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
                    Companies: {overview.companyUsers || 0}
                  </span>
                </div>
              </div>

              {userGrowth.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-mono text-xs">
                  No registration events recorded in the selected window ({range}).
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Detailed Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 uppercase text-[10px] text-slate-400 bg-white/[0.02]">
                          <th className="py-2.5 px-4">Date Bucket</th>
                          <th className="py-2.5 px-4">Talent Acquired</th>
                          <th className="py-2.5 px-4">Companies Acquired</th>
                          <th className="py-2.5 px-4">Bucket Total</th>
                          <th className="py-2.5 px-4">Running Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {userGrowth.map((g: any, i: number) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 px-4 text-white font-bold">{g.date}</td>
                            <td className="py-2.5 px-4 text-emerald-400">+{g.talent}</td>
                            <td className="py-2.5 px-4 text-blue-400">+{g.company}</td>
                            <td className="py-2.5 px-4 text-white font-bold">+{g.total}</td>
                            <td className="py-2.5 px-4 text-slate-400">{g.cumulative} accounts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TALENT ANALYTICS */}
          {activeTab === "talent" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Creative Talent</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{talentAnalytics.total || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Verified Specialists</span>
                  <div className="text-2xl font-black text-white font-mono mt-1">{talentAnalytics.verified || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Complete Profiles</span>
                  <div className="text-2xl font-black text-blue-400 font-mono mt-1">{talentAnalytics.completeProfiles || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Incomplete Profiles</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">{talentAnalytics.incompleteProfiles || 0}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills Distribution */}
                <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-bold text-white font-sans">Most Common Creative Disciplines & Skills</h4>
                  {(!talentAnalytics.skillsDistribution || talentAnalytics.skillsDistribution.length === 0) ? (
                    <p className="text-xs text-slate-500 font-mono italic">No skill tags registered yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {talentAnalytics.skillsDistribution.map((s: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-200">{s.skill}</span>
                            <span className="text-emerald-400 font-bold">{s.count} talent</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, (s.count / Math.max(1, talentAnalytics.total)) * 100)}%` }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience & Location Breakdown */}
                <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans mb-3">Seniority & Experience Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-slate-400 text-[10px] uppercase block">Junior (&lt; 3 yrs)</span>
                        <span className="text-lg font-bold text-white mt-1 block">
                          {talentAnalytics.experienceDistribution?.junior || 0}
                        </span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-slate-400 text-[10px] uppercase block">Mid-Level (3-5 yrs)</span>
                        <span className="text-lg font-bold text-white mt-1 block">
                          {talentAnalytics.experienceDistribution?.mid || 0}
                        </span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-slate-400 text-[10px] uppercase block">Senior (6-8 yrs)</span>
                        <span className="text-lg font-bold text-emerald-400 mt-1 block">
                          {talentAnalytics.experienceDistribution?.senior || 0}
                        </span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-slate-400 text-[10px] uppercase block">Lead / Executive (9+ yrs)</span>
                        <span className="text-lg font-bold text-purple-400 mt-1 block">
                          {talentAnalytics.experienceDistribution?.lead || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white font-sans mb-3">Top Talent Locations</h4>
                    {(!talentAnalytics.locationDistribution || talentAnalytics.locationDistribution.length === 0) ? (
                      <p className="text-xs text-slate-500 font-mono italic">No geographic location data recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {talentAnalytics.locationDistribution.map((l: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg text-xs font-mono">
                            <span className="text-slate-300">{l.location}</span>
                            <span className="text-slate-400 font-bold">{l.count} specialists</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPANY ANALYTICS */}
          {activeTab === "companies" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Registered Companies</span>
                  <div className="text-2xl font-black text-blue-400 font-mono mt-1">{companyAnalytics.total || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Verified Companies</span>
                  <div className="text-2xl font-black text-white font-mono mt-1">{companyAnalytics.verified || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">Active Workspaces</span>
                  <div className="text-2xl font-black text-purple-400 font-mono mt-1">{companyAnalytics.active || 0}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Industry Distribution */}
                <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-bold text-white font-sans">Company Distribution by Industry</h4>
                  {(!companyAnalytics.industryDistribution || companyAnalytics.industryDistribution.length === 0) ? (
                    <p className="text-xs text-slate-500 font-mono italic">No industry records found.</p>
                  ) : (
                    <div className="space-y-3">
                      {companyAnalytics.industryDistribution.map((ind: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-200">{ind.industry}</span>
                            <span className="text-blue-400 font-bold">{ind.count} enterprises</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, (ind.count / Math.max(1, companyAnalytics.total)) * 100)}%` }}
                              className="h-full bg-blue-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Company Size & Most Active Mandate Publishers */}
                <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans mb-3">Company Scale Distribution</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {(companyAnalytics.sizeDistribution || []).map((sz: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-slate-400 text-[10px] uppercase block">{sz.size}</span>
                          <span className="text-base font-bold text-white mt-1 block">{sz.count} companies</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white font-sans mb-3">Top Companies by Published Briefs</h4>
                    {(!companyAnalytics.topCompaniesByOpportunities || companyAnalytics.topCompaniesByOpportunities.length === 0) ? (
                      <p className="text-xs text-slate-500 font-mono italic">No published project briefs recorded.</p>
                    ) : (
                      <div className="space-y-2">
                        {companyAnalytics.topCompaniesByOpportunities.map((tc: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg text-xs font-mono">
                            <span className="text-slate-200 font-semibold">{tc.companyName}</span>
                            <span className="text-blue-400 font-bold">{tc.count} project mandates</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OPPORTUNITY ANALYTICS */}
          {activeTab === "opportunities" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Mandates</span>
                  <div className="text-2xl font-black text-white font-mono mt-1">{opportunityAnalytics.total || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Active Pipeline</span>
                  <div className="text-2xl font-black text-blue-400 font-mono mt-1">{opportunityAnalytics.active || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Closed Projects</span>
                  <div className="text-2xl font-black text-slate-400 font-mono mt-1">{opportunityAnalytics.closed || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Avg Apps / Project</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    {opportunityAnalytics.averageApplicationsPerOpportunity || 0}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline Status Breakdown */}
                <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-bold text-white font-sans">Project Mandates by Pipeline Stage</h4>
                  {(!opportunityAnalytics.statusDistribution || opportunityAnalytics.statusDistribution.length === 0) ? (
                    <p className="text-xs text-slate-500 font-mono italic">No project status data recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {opportunityAnalytics.statusDistribution.map((st: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-mono">
                          <span className="font-semibold text-white">{st.status}</span>
                          <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-400 font-bold border border-blue-800/40">
                            {st.count} briefs
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Budget Tier Distribution */}
                <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-bold text-white font-sans">Project Budget Tier Distribution</h4>
                  {(!opportunityAnalytics.budgetTierDistribution || opportunityAnalytics.budgetTierDistribution.length === 0) ? (
                    <p className="text-xs text-slate-500 font-mono italic">No budget tier data recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {opportunityAnalytics.budgetTierDistribution.map((bt: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-200">{bt.tier} Tier</span>
                            <span className="text-purple-400 font-bold">{bt.count} mandates</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, (bt.count / Math.max(1, opportunityAnalytics.total)) * 100)}%` }}
                              className="h-full bg-purple-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: APPLICATIONS & FUNNEL */}
          {activeTab === "applications" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Applications</span>
                  <div className="text-2xl font-black text-white font-mono mt-1">{applicationAnalytics.total || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Pending Review</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">{applicationAnalytics.pending || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Shortlisted</span>
                  <div className="text-2xl font-black text-blue-400 font-mono mt-1">{applicationAnalytics.shortlisted || 0}</div>
                </div>
                <div className="bg-[#0E1118] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Accepted Proposals</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{applicationAnalytics.accepted || 0}</div>
                </div>
              </div>

              {/* Multi-Stage Conversion Funnel */}
              <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">Application Conversion Funnel</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Stage-by-stage conversion from initial talent pitch to mandate acceptance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(applicationAnalytics.funnel || []).map((stage: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-2 relative">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>STAGE {idx + 1}</span>
                        <span className="text-white font-bold">{stage.percentage}%</span>
                      </div>
                      <div className="text-xl font-black text-white font-mono">{stage.stage}</div>
                      <div className="text-xs font-mono text-emerald-400 font-bold">{stage.count} proposals</div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
                        <div
                          style={{ width: `${stage.percentage}%` }}
                          className={`h-full rounded-full ${
                            idx === 3 ? "bg-emerald-500" : idx === 2 ? "bg-blue-500" : idx === 1 ? "bg-purple-500" : "bg-slate-400"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Opportunities Receiving Applications */}
              <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <h4 className="text-sm font-bold text-white font-sans">Opportunities Receiving Most Applications</h4>
                {(!applicationAnalytics.topOpportunities || applicationAnalytics.topOpportunities.length === 0) ? (
                  <p className="text-xs text-slate-500 font-mono italic">No applications recorded on project briefs.</p>
                ) : (
                  <div className="space-y-2">
                    {applicationAnalytics.topOpportunities.map((to: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-mono">
                        <div>
                          <div className="font-bold text-white">{to.title}</div>
                          <div className="text-[10px] text-slate-400">Company: {to.companyName}</div>
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-bold">
                          {to.count} pitches
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: PLATFORM ACTIVITY FEED */}
          {activeTab === "activity" && (
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Platform Event Stream</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Immutable activity log of administrative decisions, account state transitions, and operations events.
                  </p>
                </div>
                <Link
                  href="/admin/audit-log"
                  className="text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Full Audit Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-slate-500">
                  No activity events recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentActivity.map((act: any) => (
                    <div key={act.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{act.actor_name || "System Admin"}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 uppercase">
                            {act.action}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">({act.entity_type})</span>
                        </div>
                        <p className="text-slate-400 font-mono text-[11px]">{act.change_summary}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
