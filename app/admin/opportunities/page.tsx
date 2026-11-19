"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  RefreshCw,
  Mail,
  Calendar,
  DollarSign,
  Download,
  Filter,
  ChevronLeft,
  Building2,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";
import { adminApi } from "@/lib/admin/apiClient";

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    discovery: 0,
    matching: 0,
    active: 0,
    closed: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [budgetTierFilter, setBudgetTierFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal & Action State
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.opportunities.list({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        budgetTier: budgetTierFilter || undefined,
        page,
        limit: 15,
      });

      if (res.success) {
        setOpportunities(res.opportunities || []);
        setMetrics(res.metrics || {});
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err: any) {
      console.error("Failed to load opportunities:", err);
      setActionError(err?.message || "Failed to load opportunities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search, statusFilter, budgetTierFilter, page]);

  const openOppDetails = async (oppId: string) => {
    try {
      setDetailLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await adminApi.opportunities.get(oppId);
      if (res.success && res.opportunity) {
        setSelectedOpp(res.opportunity);
      }
    } catch (err: any) {
      console.error("Failed to fetch opportunity details:", err);
      setActionError(err?.message || "Failed to load opportunity details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOpp) return;
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await adminApi.opportunities.update(selectedOpp.id, { status: newStatus });
      if (res.success) {
        setActionSuccess(`Opportunity lifecycle transitioned to '${newStatus}'`);
        setSelectedOpp((prev: any) => ({ ...prev, status: newStatus }));
        fetchOpportunities();
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to update status");
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
            <span className="text-xs uppercase tracking-widest text-red-500 font-mono">Mandate Lifecycle</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Opportunities & Mandates</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Oversee corporate creative briefs, monitor talent matching progress, and govern project delivery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/reports/export?type=opportunities"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <button
            onClick={fetchOpportunities}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>TOTAL MANDATES</span>
            <Briefcase className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-light text-white">{metrics.total}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Published projects</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>DISCOVERY PHASE</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-light text-amber-400">{metrics.discovery}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Scoping & intake</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>MATCHING PHASE</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-light text-blue-400">{metrics.matching}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Talent proposals open</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>ACTIVE MANDATES</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-light text-emerald-400">{metrics.active}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">In production</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>TOTAL PROPOSALS</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-light text-white">{metrics.totalApplications}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Applications received</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-neutral-900/40 border border-white/10 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by mandate title, company, industry..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-white/10 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-neutral-900 border border-white/10 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="">All Lifecycles</option>
            <option value="Discovery">Discovery</option>
            <option value="Matching">Matching</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={budgetTierFilter}
            onChange={(e) => {
              setBudgetTierFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-neutral-900 border border-white/10 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="">All Budget Tiers</option>
            <option value="Emerging">Emerging / Foundation</option>
            <option value="Growth">Growth / Strategic</option>
            <option value="Enterprise">Enterprise / Global</option>
          </select>

          {(search || statusFilter || budgetTierFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setBudgetTierFilter("");
                setPage(1);
              }}
              className="text-xs text-neutral-400 hover:text-white font-mono underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-neutral-900/40 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/80 border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-3">Mandate Title</th>
                <th className="px-6 py-3">Corporate Client</th>
                <th className="px-6 py-3">Industry / Timeline</th>
                <th className="px-6 py-3">Budget Tier</th>
                <th className="px-6 py-3">Proposals</th>
                <th className="px-6 py-3">Lifecycle</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-mono text-xs">
                    Loading project mandates...
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-mono text-xs">
                    No opportunities found matching criteria.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{opp.title}</div>
                      <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                        {opp.project_brief || "No brief excerpt available."}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-neutral-200 text-xs font-medium">{opp.company_name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{opp.company_email}</div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="text-white">{opp.industry || "General"}</div>
                      <div className="text-neutral-500 text-[11px]">{opp.timeline || "Flexible"}</div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="text-white">{opp.budget_tier || "Standard"}</div>
                      <div className="text-neutral-500 text-[11px]">{opp.budget_range || "—"}</div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="text-neutral-200">{opp.applications_count || 0} proposals</div>
                      <div className="text-emerald-400 text-[11px]">{opp.accepted_count || 0} accepted</div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${
                          opp.status?.toLowerCase() === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : opp.status?.toLowerCase() === "matching"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : opp.status?.toLowerCase() === "discovery"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-neutral-800 text-neutral-400 border border-white/10"
                        }`}
                      >
                        {opp.status || "Discovery"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openOppDetails(opp.id)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs font-mono transition-colors"
                      >
                        Inspect
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
            Showing {opportunities.length > 0 ? (page - 1) * 15 + 1 : 0} to{" "}
            {Math.min(page * 15, totalCount)} of {totalCount} opportunities
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

      {/* Opportunity Detail Modal / Slideout */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-white/15 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest text-red-500 font-mono">
                    {selectedOpp.budget_tier || "Standard"} Mandate
                  </span>
                  <span className="text-xs font-mono text-neutral-400">• {selectedOpp.company_name}</span>
                </div>
                <h2 className="text-2xl font-light text-white">{selectedOpp.title}</h2>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
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
              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-950/60 rounded-lg border border-white/5 font-mono text-xs">
                <div>
                  <div className="text-neutral-500">CURRENT STATUS</div>
                  <div className="text-white mt-1 uppercase">{selectedOpp.status}</div>
                </div>
                <div>
                  <div className="text-neutral-500">TIMELINE</div>
                  <div className="text-white mt-1">{selectedOpp.timeline || "TBD"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">BUDGET RANGE</div>
                  <div className="text-white mt-1">{selectedOpp.budget_range || "Negotiable"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">APPLICANTS</div>
                  <div className="text-white mt-1">{selectedOpp.applications?.length || 0} received</div>
                </div>
              </div>

              {/* Brief Content */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Mandate Brief & Scope</h3>
                <p className="text-sm text-neutral-300 bg-neutral-950/40 p-4 rounded-lg border border-white/5 leading-relaxed whitespace-pre-line">
                  {selectedOpp.project_brief || "No brief description provided."}
                </p>
              </div>

              {/* Corporate Specs */}
              {(selectedOpp.rebranding_goals || selectedOpp.target_audience || selectedOpp.brand_personality) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedOpp.rebranding_goals && (
                    <div className="p-3 bg-neutral-950/40 rounded border border-white/5 text-xs">
                      <div className="text-neutral-500 font-mono uppercase mb-1">Goals</div>
                      <div className="text-neutral-200">{selectedOpp.rebranding_goals}</div>
                    </div>
                  )}
                  {selectedOpp.target_audience && (
                    <div className="p-3 bg-neutral-950/40 rounded border border-white/5 text-xs">
                      <div className="text-neutral-500 font-mono uppercase mb-1">Target Demographic</div>
                      <div className="text-neutral-200">{selectedOpp.target_audience}</div>
                    </div>
                  )}
                  {selectedOpp.brand_personality && (
                    <div className="p-3 bg-neutral-950/40 rounded border border-white/5 text-xs">
                      <div className="text-neutral-500 font-mono uppercase mb-1">Brand Voice</div>
                      <div className="text-neutral-200">{selectedOpp.brand_personality}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Proposals Received */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Proposals Submitted ({selectedOpp.applications?.length || 0})
                </h3>
                {selectedOpp.applications && selectedOpp.applications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOpp.applications.map((app: any) => (
                      <div key={app.id} className="p-4 bg-neutral-950/40 rounded border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-sm">{app.talent_name}</span>
                            <span className="text-xs font-mono text-neutral-400">({app.talent_email})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-emerald-400">
                              Proposed: ${app.proposed_rate || "—"}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-white/10">
                              {app.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-300 line-clamp-2 bg-neutral-900/50 p-2.5 rounded border border-white/5">
                          {app.pitch || "No pitch statement provided."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 font-mono">No talent proposals received yet.</p>
                )}
              </div>
            </div>

            {/* Footer Lifecycle Controls */}
            <div className="p-6 border-t border-white/10 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-mono text-neutral-400">
                Change Lifecycle Phase:
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus("Discovery")}
                  disabled={actionLoading || selectedOpp.status === "Discovery"}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-mono uppercase tracking-wider disabled:opacity-30"
                >
                  Discovery
                </button>
                <button
                  onClick={() => handleUpdateStatus("Matching")}
                  disabled={actionLoading || selectedOpp.status === "Matching"}
                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-mono uppercase tracking-wider disabled:opacity-30"
                >
                  Matching
                </button>
                <button
                  onClick={() => handleUpdateStatus("Active")}
                  disabled={actionLoading || selectedOpp.status === "Active"}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono uppercase tracking-wider disabled:opacity-30"
                >
                  Active
                </button>
                <button
                  onClick={() => handleUpdateStatus("Closed")}
                  disabled={actionLoading || selectedOpp.status === "Closed"}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-white/10 rounded text-xs font-mono uppercase tracking-wider disabled:opacity-30"
                >
                  Close Mandate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
