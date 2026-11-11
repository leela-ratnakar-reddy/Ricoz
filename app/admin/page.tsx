"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  AlertTriangle,
  Building2,
  Handshake,
  LifeBuoy,
  ShieldAlert,
  ArrowRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  Filter,
  Users,
  FileCheck2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Department } from "@/lib/admin/types";
import { getDashboardStats, getDepartments } from "@/lib/demo";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<string>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    try {
      setRefreshing(true);
      const dashData = getDashboardStats(selectedDept || undefined, selectedRange);
      const depts = getDepartments();
      setData(dashData);
      setDepartments(depts);
    } catch (err) {
      console.error("Error loading demo dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-white/[0.04] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const urgentTasks = data?.urgentTasks || [];
  const pendingVendors = data?.pendingVendorList || [];
  const deptWorkloads = data?.deptWorkloads || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER & CONTROLS STRIP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>OPERATIONS SUITE v1.0</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-sans">
            Platform Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-department coordination, workflow bottlenecks, and verified operational health.
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
            >
              <option value="" className="bg-[#0A0D14]">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#0A0D14]">{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5 font-mono text-[11px]">
            {["7d", "30d", "90d"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedRange === r
                    ? "bg-red-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. REAL DATABASE-BACKED KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Task Health */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Tasks
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {kpis.pendingTasks || 0}
            </div>
            <span className="text-xs text-slate-400">active</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
            <span className={`${kpis.overdueTasks > 0 ? "text-red-400 font-bold" : "text-slate-400"}`}>
              {kpis.overdueTasks || 0} overdue
            </span>
            <span className={`${kpis.blockedTasks > 0 ? "text-amber-400 font-bold" : "text-slate-500"}`}>
              {kpis.blockedTasks || 0} blocked
            </span>
            <span className="text-emerald-400">
              {kpis.completedTasks || 0} done
            </span>
          </div>
        </div>

        {/* Card 2: Enterprise Clients */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Clients
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {kpis.activeClients || 0}
            </div>
            <span className="text-xs text-slate-400">active mandates</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
            <span className="text-blue-400">
              {kpis.onboardingClients || 0} onboarding
            </span>
            <span className="text-slate-500">
              {kpis.totalClients || 0} total accounts
            </span>
          </div>
        </div>

        {/* Card 3: Creative Vendor Network */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Handshake className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Vendors
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {kpis.verifiedVendors || 0}
            </div>
            <span className="text-xs text-slate-400">verified partners</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
            <span className={`${kpis.pendingVendors > 0 ? "text-amber-400 font-bold" : "text-slate-500"}`}>
              {kpis.pendingVendors || 0} pending review
            </span>
            <span className="text-slate-500">
              {kpis.totalVendors || 0} partners
            </span>
          </div>
        </div>

        {/* Card 4: Support & Complaints SLA */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Support & SLA
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {kpis.openTickets || 0}
            </div>
            <span className="text-xs text-slate-400">open tickets</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
            <span className={`${kpis.criticalTickets > 0 ? "text-red-400 font-bold" : "text-slate-500"}`}>
              {kpis.criticalTickets || 0} critical
            </span>
            <span className="text-emerald-400 font-semibold">
              {kpis.resolvedTicketsRate || 100}% SLA rate
            </span>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL BOTTLENECKS & CRITICAL ISSUES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Overdue Tasks & Department Workloads */}
        <div className="lg:col-span-7 space-y-6">
          {/* Overdue / Blocked Tasks Panel */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Critical Workflows & Overdue Mandates
                </h3>
              </div>
              <Link
                href="/admin/tasks?status=blocked"
                className="text-[11px] font-mono text-red-400 hover:text-red-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {urgentTasks.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-white/5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">All Workflows On Schedule</p>
                <p className="text-[11px] text-slate-500 mt-1">Zero blocked or overdue tasks currently recorded.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          {task.title}
                        </span>
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          task.priority === "urgent"
                            ? "bg-red-950/80 text-red-400 border-red-800/60"
                            : "bg-amber-950/80 text-amber-400 border-amber-800/60"
                        }`}>
                          {task.priority}
                        </span>
                        {(task.is_escalated === 1 || task.isEscalated) && (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700/50">
                            Escalated
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                        <span>{task.department_name || task.departmentName || "Operations"}</span>
                        <span>•</span>
                        <span>Assignee: {task.assignee_name || task.assigneeName || "Unassigned"}</span>
                        <span>•</span>
                        <span className="text-red-400 font-bold">Due: {task.due_date || task.dueDate || "ASAP"}</span>
                      </div>

                      {(task.blocker_note || task.blockerNote) && (
                        <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-900/30 px-2 py-1 rounded mt-1 font-mono">
                          <span className="font-bold text-amber-400">Blocker: </span>
                          {task.blocker_note || task.blockerNote}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/admin/tasks?id=${task.id}`}
                      className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all text-center"
                    >
                      Resolve &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Workload Distribution */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Cross-Department Workload & Velocity
                </h3>
              </div>
              <Link
                href="/admin/departments"
                className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
              >
                Manage Teams &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {deptWorkloads.map((dept: any) => {
                const total = (dept.active_tasks || 0) + (dept.completed_tasks || 0);
                const pct = total > 0 ? Math.round(((dept.completed_tasks || 0) / total) * 100) : 100;
                return (
                  <div key={dept.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{dept.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ({dept.member_count} team members)
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="text-slate-400">{dept.active_tasks} active</span>
                        {dept.overdue_tasks > 0 && (
                          <span className="text-red-400 font-bold">{dept.overdue_tasks} overdue</span>
                        )}
                        <span className="text-emerald-400 font-semibold">{pct}% done</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Pending Vendors & Live Activity Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pending Vendor Approvals */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Vendor Onboarding Approvals
                </h3>
              </div>
              <Link
                href="/admin/vendors"
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 transition-colors"
              >
                Vetting Portal &rarr;
              </Link>
            </div>

            {pendingVendors.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-white/5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                <p className="text-xs text-slate-300">All Vendors Vetted</p>
                <p className="text-[10px] text-slate-500">No pending document reviews in queue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVendors.map((ven: any) => (
                  <div
                    key={ven.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white">{ven.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {ven.service_category || ven.serviceCategory || "General Vendor"}
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        (ven.verification_status || ven.verificationStatus) === "verified"
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/40"
                          : "bg-amber-950/80 text-amber-400 border-amber-800/40"
                      }`}>
                        {String(ven.verification_status || ven.verificationStatus || "pending_review").replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 mt-2 border-t border-white/5">
                      <span>Docs: {ven.verified_docs_count ?? ven.verifiedDocsCount ?? 0}/{ven.total_docs_count ?? ven.totalDocsCount ?? 0} verified</span>
                      <Link
                        href={`/admin/vendors?id=${ven.id}`}
                        className="text-amber-400 hover:text-amber-300 font-bold"
                      >
                        Review Docs &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Operational Activity Stream */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Audit Activity Stream
                </h3>
              </div>
              <Link
                href="/admin/audit-log"
                className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
              >
                Full Trail &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivity.map((act: any) => (
                <div key={act.id} className="text-xs space-y-1 pb-2.5 border-b border-white/5 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">
                      {act.actor_name || act.actorName || "System Admin"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(act.created_at || act.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                    {act.change_summary || act.changeSummary || "Audit event recorded"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
