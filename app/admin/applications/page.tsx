"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Mail,
  DollarSign,
  Download,
  Filter,
  ChevronLeft,
  Briefcase,
  Building2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Star,
} from "lucide-react";
import { adminApi } from "@/lib/admin/apiClient";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    accepted: 0,
    declined: 0,
    avgProposedRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal & Action State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.applications.list({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      });

      if (res.success) {
        setApplications(res.applications || []);
        setMetrics(res.metrics || {});
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err: any) {
      console.error("Failed to load applications:", err);
      setActionError(err?.message || "Failed to load applications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, page]);

  const openAppDetails = async (appId: string) => {
    try {
      setDetailLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await adminApi.applications.get(appId);
      if (res.success && res.application) {
        setSelectedApp(res.application);
      }
    } catch (err: any) {
      console.error("Failed to fetch application details:", err);
      setActionError(err?.message || "Failed to load application details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "pending" | "reviewed" | "shortlisted" | "accepted" | "declined") => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await adminApi.applications.update(selectedApp.id, { status: newStatus });
      if (res.success) {
        setActionSuccess(`Application status transitioned to '${newStatus}' and talent notified.`);
        setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
        fetchApplications();
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to update application status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-red-500 font-mono">Talent Proposals</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Proposals & Applications</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Evaluate specialist proposals, negotiate commercial rates, and orchestrate project assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/reports/export?type=applications"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <button
            onClick={fetchApplications}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>TOTAL PROPOSALS</span>
            <Sparkles className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-light text-white">{metrics.total}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Submitted pitches</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>PENDING REVIEW</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-light text-amber-400">{metrics.pending}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Awaiting triage</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>SHORTLISTED</span>
            <Star className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-light text-purple-400">{metrics.shortlisted}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Under evaluation</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>ACCEPTED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-light text-emerald-400">{metrics.accepted}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Contracts awarded</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>DECLINED</span>
            <ThumbsDown className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl font-light text-neutral-400">{metrics.declined}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Not selected</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>AVG RATE</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-light text-blue-400">${metrics.avgProposedRate}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Average proposed</div>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="p-4 bg-neutral-900/40 border border-white/10 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search talent, mandate, client, proposal pitch..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-white/10 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {["", "pending", "reviewed", "shortlisted", "accepted", "declined"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
                statusFilter === s
                  ? "bg-red-600 text-white font-medium"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-white/10"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-neutral-900/40 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/80 border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-3">Applicant Specialist</th>
                <th className="px-6 py-3">Mandate / Enterprise</th>
                <th className="px-6 py-3">Proposed Rate</th>
                <th className="px-6 py-3">Pitch Preview</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Submitted</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-mono text-xs">
                    Loading applications pipeline...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-mono text-xs">
                    No proposals found matching criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white overflow-hidden shrink-0">
                          {app.talent_avatar ? (
                            <img src={app.talent_avatar} alt={app.talent_name} className="w-full h-full object-cover" />
                          ) : (
                            app.talent_name?.charAt(0)?.toUpperCase() || "T"
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center gap-1.5">
                            {app.talent_name}
                            {app.talent_verified && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">{app.talent_email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-neutral-200 text-xs font-medium">{app.project_title}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {app.company_name} • {app.budget_tier}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs font-medium text-emerald-400">
                      {app.proposed_rate ? `$${app.proposed_rate}` : "Negotiable"}
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-xs text-neutral-400 line-clamp-1 italic">
                        "{app.pitch || "No pitch provided"}"
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${
                          app.status === "accepted"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : app.status === "shortlisted"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : app.status === "reviewed"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : app.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-neutral-800 text-neutral-400 border border-white/10"
                        }`}
                      >
                        {app.status || "pending"}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-neutral-500">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString() : "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openAppDetails(app.id)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs font-mono transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-neutral-900/60 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
          <div>
            Showing {applications.length > 0 ? (page - 1) * 15 + 1 : 0} to{" "}
            {Math.min(page * 15, totalCount)} of {totalCount} proposals
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Application Review Modal / Slideout */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-white/15 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest text-red-500 font-mono">
                    Proposal for {selectedApp.project_title}
                  </span>
                </div>
                <h2 className="text-2xl font-light text-white">Proposal Review</h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Corporate Client: {selectedApp.company_name} • Mandate Tier: {selectedApp.budget_tier}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification / Feedback Banner */}
            {actionSuccess && (
              <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400 font-mono">
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 font-mono">
                {actionError}
              </div>
            )}

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Applicant Card */}
              <div className="p-4 bg-neutral-950/60 rounded-lg border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-sm font-mono font-bold text-white overflow-hidden">
                    {selectedApp.talent_avatar ? (
                      <img src={selectedApp.talent_avatar} alt={selectedApp.talent_name} className="w-full h-full object-cover" />
                    ) : (
                      selectedApp.talent_name?.charAt(0)?.toUpperCase() || "T"
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {selectedApp.talent_name}
                      {selectedApp.talent_verified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">{selectedApp.talent_email}</div>
                    <div className="text-xs text-neutral-300 mt-0.5">{selectedApp.talent_headline}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-neutral-500">PROPOSED RATE</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    ${selectedApp.proposed_rate || "—"}
                  </div>
                </div>
              </div>

              {/* Pitch Statement */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Proposal Statement / Pitch</h3>
                <div className="p-4 bg-neutral-950/40 rounded-lg border border-white/5 text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                  {selectedApp.pitch || "No pitch text provided."}
                </div>
              </div>

              {/* Portfolio Link */}
              {selectedApp.talent_portfolio && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Portfolio Showcase</h3>
                  <a
                    href={selectedApp.talent_portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono text-red-400 hover:text-red-300 underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {selectedApp.talent_portfolio}
                  </a>
                </div>
              )}

              {/* Mandate Brief Excerpt */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Mandate Scope</h3>
                <p className="text-xs text-neutral-400 bg-neutral-950/40 p-3 rounded border border-white/5 line-clamp-3">
                  {selectedApp.project_brief || "No brief text."}
                </p>
              </div>
            </div>

            {/* Footer Pipeline Decision Controls */}
            <div className="p-6 border-t border-white/10 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-mono text-neutral-400">
                Current Status: <span className="uppercase text-white font-medium">{selectedApp.status}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus("reviewed")}
                  disabled={actionLoading || selectedApp.status === "reviewed"}
                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-mono uppercase tracking-wider disabled:opacity-30"
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => handleUpdateStatus("shortlisted")}
                  disabled={actionLoading || selectedApp.status === "shortlisted"}
                  className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-mono uppercase tracking-wider disabled:opacity-30"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleUpdateStatus("accepted")}
                  disabled={actionLoading || selectedApp.status === "accepted"}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-30"
                >
                  Accept & Award
                </button>
                <button
                  onClick={() => handleUpdateStatus("declined")}
                  disabled={actionLoading || selectedApp.status === "declined"}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-white/10 rounded text-xs font-mono uppercase tracking-wider disabled:opacity-30"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
