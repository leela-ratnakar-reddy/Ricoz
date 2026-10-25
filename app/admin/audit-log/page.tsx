"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Terminal,
  Activity,
  Lock,
} from "lucide-react";
import { AuditLog } from "@/lib/admin/types";

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entityFilter) params.append("entityType", entityFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/audit-log?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        if (d.success) setLogs(d.logs);
      }
    } catch (err) {
      console.error("Audit log error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, search]);

  const roleColors: Record<string, string> = {
    super_admin: "text-red-400 bg-red-950/80 border-red-800/60",
    ops_admin: "text-amber-400 bg-amber-950/80 border-amber-800/60",
    dept_manager: "text-blue-400 bg-blue-950/80 border-blue-800/60",
    team_member: "text-emerald-400 bg-emerald-950/80 border-emerald-800/60",
    auditor: "text-purple-400 bg-purple-950/80 border-purple-800/60",
    system: "text-slate-400 bg-slate-800 border-slate-700",
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Immutable Security Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Cryptographically timestamped record of administrative operations, permissions, and entity modifications.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Access Restricted to Authorized Auditors</span>
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Entities</option>
            <option value="task" className="bg-[#0A0D14]">Tasks</option>
            <option value="client" className="bg-[#0A0D14]">Clients</option>
            <option value="vendor" className="bg-[#0A0D14]">Vendors</option>
            <option value="support_ticket" className="bg-[#0A0D14]">Support Tickets</option>
            <option value="sop" className="bg-[#0A0D14]">SOPs</option>
            <option value="admin_user" className="bg-[#0A0D14]">Users & Auth</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-white font-bold">{logs.length}</span> audit events
        </div>
      </div>

      {/* 3. AUDIT LOGS TABLE */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
      ) : logs.length === 0 ? (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-12 text-center text-xs text-slate-500">
          No audit entries found matching search.
        </div>
      ) : (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#07090F] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Change Summary</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {logs.map((log) => {
                  const roleStyle = roleColors[log.actorRole || (log as any).actor_role] || "text-slate-400 bg-slate-800";
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt || (log as any).created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white">{log.actorName || (log as any).actor_name}</div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold uppercase ${roleStyle}`}>
                          {log.actorRole || (log as any).actor_role}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        <div>{log.entityType || (log as any).entity_type}</div>
                        <div className="text-[10px] text-slate-600 truncate max-w-[120px]">
                          {log.entityId || (log as any).entity_id}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                        {log.changeSummary || (log as any).change_summary}
                      </td>
                      <td className="py-3 px-4 text-right text-[10px] text-slate-500 whitespace-nowrap">
                        {log.ipAddress || (log as any).ip_address || "127.0.0.1"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
