"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Handshake,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { Department } from "@/lib/admin/types";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRange, setSelectedRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDept) params.append("departmentId", selectedDept);
      if (selectedRange) params.append("range", selectedRange);

      const [repRes, deptRes] = await Promise.all([
        fetch(`/api/admin/reports?${params.toString()}`),
        fetch("/api/admin/departments"),
      ]);

      if (repRes.ok) {
        const d = await repRes.json();
        if (d.success) setData(d.reports);
      }
      if (deptRes.ok) {
        const deptJson = await deptRes.json();
        if (deptJson.success) setDepartments(deptJson.departments);
      }
    } catch (err) {
      console.error("Reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDept, selectedRange]);

  const handleExport = (type: string) => {
    window.location.href = `/api/admin/reports/export?type=${type}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/[0.04] rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const taskVelocity = data?.taskVelocity || {};
  const deptStats = data?.deptStats || [];
  const clientStages = data?.clientStages || [];
  const vendorStatus = data?.vendorStatus || [];
  const supportSLA = data?.supportSLA || {};

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Reports, Metrics & Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Database-backed operational indicators, cross-department velocity, and CSV exports.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#0A0D14]">{d.name}</option>
            ))}
          </select>

          <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5 font-mono text-[11px]">
            {["7d", "30d", "90d"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedRange === r ? "bg-red-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. VELOCITY & EFFICIENCY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Task Completion Rate
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {taskVelocity.completionRate || 0}%
          </div>
          <div className="text-xs text-slate-400">
            {taskVelocity.completedTasks || 0} of {taskVelocity.totalTasks || 0} tasks resolved
          </div>
        </div>

        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Active Overdue Work
          </div>
          <div className={`text-3xl font-black font-mono ${taskVelocity.overdueTasks > 0 ? "text-red-400" : "text-white"}`}>
            {taskVelocity.overdueTasks || 0}
          </div>
          <div className="text-xs text-slate-400">
            Tasks past due date requiring intervention
          </div>
        </div>

        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Blocked Impediments
          </div>
          <div className={`text-3xl font-black font-mono ${taskVelocity.blockedTasks > 0 ? "text-amber-400" : "text-white"}`}>
            {taskVelocity.blockedTasks || 0}
          </div>
          <div className="text-xs text-slate-400">
            Tasks flagged with active blocker notes
          </div>
        </div>

        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Support SLA Compliance
          </div>
          <div className="text-3xl font-black text-purple-400 font-mono">
            {supportSLA.slaRate || 100}%
          </div>
          <div className="text-xs text-slate-400">
            {supportSLA.resolvedTickets || 0} of {supportSLA.totalTickets || 0} tickets resolved
          </div>
        </div>
      </div>

      {/* 3. DEPARTMENT WORKLOAD & VELOCITY MATRIX */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">
          Departmental Task Velocity Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#07090F] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Total Tasks</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Overdue</th>
                <th className="py-3 px-4">Blocked</th>
                <th className="py-3 px-4 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {deptStats.map((d: any) => {
                const total = d.total_tasks || 0;
                const completed = d.completed_tasks || 0;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 100;
                return (
                  <tr key={d.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-white">{d.name}</td>
                    <td className="py-3 px-4 font-mono">{d.total_tasks}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{d.completed_tasks}</td>
                    <td className={`py-3 px-4 font-mono ${d.overdue_tasks > 0 ? "text-red-400 font-bold" : "text-slate-500"}`}>
                      {d.overdue_tasks}
                    </td>
                    <td className={`py-3 px-4 font-mono ${d.blocked_tasks > 0 ? "text-amber-400 font-bold" : "text-slate-500"}`}>
                      {d.blocked_tasks}
                    </td>
                    <td className="py-3 px-4 font-mono text-right font-bold text-slate-200">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. REAL CSV EXPORT SUITE */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Operational Data Export Center
            </h3>
            <p className="text-xs text-slate-400">
              Download sanitized, comma-separated CSV archives directly from the database for reporting and external compliance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Export 1: Tasks */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white">Tasks & Workflows</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Full work register including priority, blocker notes, escalations, and due dates.
              </p>
            </div>
            <button
              onClick={() => handleExport("tasks")}
              className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Tasks CSV</span>
            </button>
          </div>

          {/* Export 2: Clients */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white">Enterprise Clients</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Contact information, onboarding progression stages, and follow-up milestones.
              </p>
            </div>
            <button
              onClick={() => handleExport("clients")}
              className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Clients CSV</span>
            </button>
          </div>

          {/* Export 3: Vendors */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white">Vendor Partners</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Verified creative studios, compliance documents, and verification audit statuses.
              </p>
            </div>
            <button
              onClick={() => handleExport("vendors")}
              className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Vendors CSV</span>
            </button>
          </div>

          {/* Export 4: Tickets */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white">Support & SLA Log</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Customer ticket references, categories, resolution timestamps, and SLA metrics.
              </p>
            </div>
            <button
              onClick={() => handleExport("tickets")}
              className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Tickets CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
