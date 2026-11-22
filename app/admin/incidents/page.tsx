"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  X,
  AlertCircle,
  RefreshCw,
  FileText,
  ChevronRight,
  Shield,
  Check,
} from "lucide-react";
import { AdminUser } from "@/lib/admin/types";
import { adminApi } from "@/lib/admin/apiClient";

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    open: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [migrationPending, setMigrationPending] = useState(false);

  // Filters
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Modals & Forms
  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Incident State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSeverity, setNewSeverity] = useState("high");
  const [newCategory, setNewCategory] = useState("platform_sla");
  const [newAssignee, setNewAssignee] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/incidents");
      const json = await res.json();
      if (json.success) {
        setIncidents(json.incidents || []);
        setMetrics(json.metrics || {});
        setMigrationPending(Boolean(json.tablePendingMigration));
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    adminApi.team.listUsers().then((res) => {
      if (res.success && res.users) {
        setTeamMembers(res.users);
      }
    });
  }, []);

  const handleDeclareIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          severity: newSeverity,
          category: newCategory,
          assigneeId: newAssignee || null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setDeclareModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        await fetchIncidents();
      } else {
        setFormError(json.error || "Failed to declare incident");
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to declare incident");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredIncidents = incidents.filter((i) => {
    if (severityFilter && i.severity !== severityFilter) return false;
    if (statusFilter && i.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        i.title?.toLowerCase().includes(q) ||
        i.incident_ref?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. WAR ROOM TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
              <span>Incident War Room</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60 font-bold uppercase">
                ACTIVE MONITORING
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Emergency operational escalation, platform outages, contract disputes, and incident resolution tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchIncidents}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs font-mono text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-400" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setDeclareModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md shadow-red-900/40"
          >
            <Plus className="w-4 h-4" />
            <span>Declare Incident</span>
          </button>
        </div>
      </div>

      {/* Migration Notice Banner if using Live Task/Ticket Telemetry */}
      {migrationPending && (
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-center justify-between gap-4 text-xs font-mono text-blue-200">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Telemetry Mode Active:</strong> Sourcing live escalations from active task blockers and critical SLA tickets. Schema migration prepared at <code className="bg-black/40 px-1 py-0.5 rounded text-blue-300">lib/admin/migrations/002_incident_war_room.sql</code>.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 shrink-0">
            Rule 13 Compliant
          </span>
        </div>
      )}

      {/* 2. SEVERITY METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Critical */}
        <div className="p-4 rounded-2xl bg-[#0E1118] border border-red-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-wider">Critical Severity</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{metrics.critical || 0}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Requires immediate intervention</div>
        </div>

        {/* High */}
        <div className="p-4 rounded-2xl bg-[#0E1118] border border-amber-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">High Severity</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{metrics.high || 0}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Urgent deliverable risks</div>
        </div>

        {/* Medium & Low */}
        <div className="p-4 rounded-2xl bg-[#0E1118] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Medium / Low</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{(metrics.medium || 0) + (metrics.low || 0)}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Operational standard issues</div>
        </div>

        {/* Open Active */}
        <div className="p-4 rounded-2xl bg-[#0E1118] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">Active Queue</span>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{metrics.open || 0}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">{metrics.resolved || 0} resolved total</div>
        </div>
      </div>

      {/* 3. FILTERS STRIP */}
      <div className="p-3 rounded-xl bg-[#0E1118] border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incident title, ref, or details..."
            className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0A0D14] border border-white/10 text-slate-300 focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0A0D14] border border-white/10 text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* 4. INCIDENT LOG TABLE */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading incident war room telemetry...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-white">All Operational Systems Normal</p>
            <p className="text-xs font-mono text-slate-400">
              No active incidents or critical blockers matching current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090F] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Ref / Incident</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Admin</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="text-red-400">{inc.incident_ref}</span>
                        <span>•</span>
                        <span className="truncate max-w-xs">{inc.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-sm mt-0.5">
                        {inc.description}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          inc.severity === "critical"
                            ? "bg-red-950/80 text-red-400 border-red-800/60"
                            : inc.severity === "high"
                            ? "bg-amber-950/80 text-amber-400 border-amber-800/60"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] uppercase text-slate-400">
                      {inc.category?.replace("_", " ")}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          inc.status === "resolved" || inc.status === "closed"
                            ? "bg-emerald-950/80 text-emerald-400"
                            : inc.status === "investigating"
                            ? "bg-amber-950/80 text-amber-400"
                            : "bg-red-950/80 text-red-400"
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {inc.assigned_admin_name || "Unassigned"}
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {new Date(inc.created_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncident(inc);
                        }}
                        className="text-xs font-mono text-red-400 hover:text-white"
                      >
                        Triage &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. DECLARE INCIDENT MODAL */}
      {declareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-red-900/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Declare Operational Incident</h3>
              </div>
              <button
                onClick={() => setDeclareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleDeclareIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Critical Billing Gateway Webhook Timeout"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Description & Impact *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain symptoms, affected user groups, or deliverable impact..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Severity *
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0D14] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0D14] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="platform_sla">Platform SLA</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="billing">Billing & Financial</option>
                    <option value="talent_dispute">Talent Dispute</option>
                    <option value="security">Security & Access</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Incident Lead / Assignee
                </label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0D14] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                >
                  <option value="">Assign to Me / Primary Admin</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-[11px] font-mono text-red-300">
                Declaration triggers an immutable audit log record. Human confirmation required.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDeclareModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono uppercase tracking-wider disabled:opacity-50"
                >
                  {actionLoading ? "Declaring..." : "Confirm & Declare"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. INCIDENT DETAILS & RESOLUTION DRAWER */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-red-400">
                    {selectedIncident.incident_ref}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40 font-bold">
                    {selectedIncident.severity}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedIncident.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Impact & Details</span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">{selectedIncident.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-500 block text-[10px]">Category</span>
                <span className="text-white uppercase">{selectedIncident.category}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-500 block text-[10px]">Current Status</span>
                <span className="text-amber-400 uppercase font-bold">{selectedIncident.status}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] font-mono text-slate-400">
              <div>Lead: <strong className="text-white">{selectedIncident.assigned_admin_name || "Unassigned"}</strong></div>
              <div>Reported: <strong className="text-white">{new Date(selectedIncident.created_at).toLocaleString()}</strong></div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <Link
                href="/admin/tasks"
                className="text-xs font-mono text-slate-400 hover:text-white inline-flex items-center gap-1"
              >
                <span>Cross-check Kanban &rarr;</span>
              </Link>
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
