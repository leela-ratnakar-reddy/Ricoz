"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Shield,
  ShieldCheck,
  RefreshCw,
  Mail,
  MapPin,
  DollarSign,
  Download,
  Filter,
  ChevronLeft,
  Star,
  Award,
} from "lucide-react";
import { adminApi } from "@/lib/admin/apiClient";

export default function AdminTalentPage() {
  const [talent, setTalent] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    verified: 0,
    active: 0,
    suspended: 0,
    completedProfiles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [minExpFilter, setMinExpFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal & Action State
  const [selectedTalent, setSelectedTalent] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchTalent = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.talent.list({
        search: search.trim() || undefined,
        skill: skillFilter || undefined,
        status: statusFilter || undefined,
        isVerified: verificationFilter || undefined,
        minExp: minExpFilter ? Number(minExpFilter) : undefined,
        page,
        limit: 15,
      });

      if (res.success) {
        setTalent(res.talent || []);
        setMetrics(res.metrics || {});
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err: any) {
      console.error("Failed to load talent:", err);
      setActionError(err?.message || "Failed to load creative talent");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTalent();
  }, [search, skillFilter, statusFilter, verificationFilter, minExpFilter, page]);

  const openTalentDetails = async (talentId: string) => {
    try {
      setDetailLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await adminApi.talent.get(talentId);
      if (res.success && res.talent) {
        setSelectedTalent(res.talent);
      }
    } catch (err: any) {
      console.error("Failed to fetch talent details:", err);
      setActionError(err?.message || "Failed to load talent details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "active" | "suspended" | "deactivated") => {
    if (!selectedTalent) return;
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await adminApi.talent.update(selectedTalent.id, { status: newStatus });
      if (res.success) {
        setActionSuccess(`Specialist status updated to '${newStatus}'`);
        setSelectedTalent((prev: any) => ({ ...prev, status: newStatus }));
        fetchTalent();
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!selectedTalent) return;
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const newVerified = !selectedTalent.is_verified;
      const res = await adminApi.talent.update(selectedTalent.id, { is_verified: newVerified });
      if (res.success) {
        setActionSuccess(`Specialist verification set to ${newVerified ? "VERIFIED" : "UNVERIFIED"}`);
        setSelectedTalent((prev: any) => ({ ...prev, is_verified: newVerified }));
        fetchTalent();
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to update verification");
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
            <span className="text-xs uppercase tracking-widest text-red-500 font-mono">Platform Roster</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Creative Talent Specialists</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage verified brand designers, art directors, and creative consultants across the ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/reports/export?type=talent"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <button
            onClick={fetchTalent}
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
            <span>TOTAL TALENT</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-light text-white">{metrics.total}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Registered specialists</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>VERIFIED</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-light text-emerald-400">{metrics.verified}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            {metrics.total > 0 ? Math.round((metrics.verified / metrics.total) * 100) : 0}% vetted
          </div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>ACTIVE</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-light text-white">{metrics.active}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">In good standing</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>COMPLETED PROFILES</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-light text-white">{metrics.completedProfiles}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">With bio & headline</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>SUSPENDED</span>
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-light text-red-400">{metrics.suspended}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Restricted access</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-neutral-900/40 border border-white/10 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name, email, headline, location..."
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
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-neutral-900 border border-white/10 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="">All Verification</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-neutral-900 border border-white/10 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>

          <select
            value={minExpFilter}
            onChange={(e) => {
              setMinExpFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-neutral-900 border border-white/10 rounded text-xs text-neutral-300 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="">Any Experience</option>
            <option value="3">3+ Years</option>
            <option value="5">5+ Years</option>
            <option value="8">8+ Years</option>
            <option value="10">10+ Years</option>
          </select>

          {(search || verificationFilter || statusFilter || minExpFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setVerificationFilter("");
                setStatusFilter("");
                setMinExpFilter("");
                setPage(1);
              }}
              className="text-xs text-neutral-400 hover:text-white font-mono underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Talent Table */}
      <div className="bg-neutral-900/40 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/80 border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-3">Specialist</th>
                <th className="px-6 py-3">Headline & Location</th>
                <th className="px-6 py-3">Experience / Rate</th>
                <th className="px-6 py-3">Proposals</th>
                <th className="px-6 py-3">Verification</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-mono text-xs">
                    Loading creative talent roster...
                  </td>
                </tr>
              ) : talent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-mono text-xs">
                    No creative talent found matching the selected filters.
                  </td>
                </tr>
              ) : (
                talent.map((t) => {
                  let skillsList: string[] = [];
                  if (Array.isArray(t.skills)) {
                    skillsList = t.skills;
                  } else if (typeof t.skills === "string") {
                    try {
                      skillsList = JSON.parse(t.skills);
                    } catch {
                      skillsList = [];
                    }
                  }

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white overflow-hidden shrink-0">
                            {t.avatar_url ? (
                              <img src={t.avatar_url} alt={t.full_name} className="w-full h-full object-cover" />
                            ) : (
                              t.full_name?.charAt(0)?.toUpperCase() || "T"
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white flex items-center gap-1.5">
                              {t.full_name}
                              {t.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                            <div className="text-xs text-neutral-400 font-mono">{t.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-neutral-200 text-xs line-clamp-1">{t.headline || "—"}</div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {t.location || "Location unlisted"}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="text-white">
                          {t.years_experience ? `${t.years_experience} yrs` : "—"}
                        </div>
                        <div className="text-neutral-400 text-[11px]">
                          {t.hourly_rate ? `$${t.hourly_rate}/hr` : "Rate negotiable"}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="text-neutral-200">
                          {t.applications_count || 0} applied
                        </div>
                        <div className="text-neutral-500 text-[11px]">
                          {t.shortlisted_count || 0} shortlisted
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {t.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono bg-neutral-800 text-neutral-400 border border-white/10">
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${
                            t.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : t.status === "suspended"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-neutral-800 text-neutral-400 border border-white/10"
                          }`}
                        >
                          {t.status || "active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openTalentDetails(t.id)}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs font-mono transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-neutral-900/60 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
          <div>
            Showing {talent.length > 0 ? (page - 1) * 15 + 1 : 0} to{" "}
            {Math.min(page * 15, totalCount)} of {totalCount} specialists
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

      {/* Talent Detail Modal / Slideout */}
      {selectedTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-white/15 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-neutral-800 border border-white/15 flex items-center justify-center text-lg font-mono font-bold text-white overflow-hidden">
                  {selectedTalent.avatar_url ? (
                    <img src={selectedTalent.avatar_url} alt={selectedTalent.full_name} className="w-full h-full object-cover" />
                  ) : (
                    selectedTalent.full_name?.charAt(0)?.toUpperCase() || "T"
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-light text-white">{selectedTalent.full_name}</h2>
                    {selectedTalent.is_verified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedTalent.email}</p>
                  <p className="text-xs text-neutral-300 mt-1">{selectedTalent.headline || "Creative Specialist"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTalent(null)}
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
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-950/60 rounded-lg border border-white/5 font-mono text-xs">
                <div>
                  <div className="text-neutral-500">LOCATION</div>
                  <div className="text-white mt-1">{selectedTalent.location || "Unspecified"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">EXPERIENCE</div>
                  <div className="text-white mt-1">{selectedTalent.years_experience ? `${selectedTalent.years_experience} Yrs` : "—"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">HOURLY RATE</div>
                  <div className="text-white mt-1">{selectedTalent.hourly_rate ? `$${selectedTalent.hourly_rate}/hr` : "Negotiable"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">AVAILABILITY</div>
                  <div className="text-white mt-1">{selectedTalent.availability || "Open"}</div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Creative Biography</h3>
                <p className="text-sm text-neutral-300 bg-neutral-950/40 p-4 rounded-lg border border-white/5 leading-relaxed">
                  {selectedTalent.bio || "No creative biography submitted yet."}
                </p>
              </div>

              {/* Portfolio Link */}
              {selectedTalent.portfolio_url && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Portfolio / Showcase</h3>
                  <a
                    href={selectedTalent.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono text-red-400 hover:text-red-300 underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {selectedTalent.portfolio_url}
                  </a>
                </div>
              )}

              {/* Skills */}
              {selectedTalent.skills && Array.isArray(selectedTalent.skills) && selectedTalent.skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Core Competencies</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTalent.skills.map((s: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-neutral-800 text-neutral-300 rounded text-xs font-mono border border-white/5">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Applications */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Recent Opportunity Proposals ({selectedTalent.applications?.length || 0})
                </h3>
                {selectedTalent.applications && selectedTalent.applications.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTalent.applications.map((app: any) => (
                      <div key={app.id} className="p-3 bg-neutral-950/40 rounded border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white font-medium">{app.project_title || "Project Proposal"}</div>
                          <div className="text-xs text-neutral-400 font-mono mt-0.5">
                            {app.company_name} • Proposed: ${app.proposed_rate || "—"}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-white/10">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 font-mono">No project applications submitted yet.</p>
                )}
              </div>
            </div>

            {/* Footer Administrative Actions */}
            <div className="p-6 border-t border-white/10 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleVerification}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors border ${
                    selectedTalent.is_verified
                      ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {selectedTalent.is_verified ? "Revoke Verification" : "Grant Verified Badge"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedTalent.status !== "active" && (
                  <button
                    onClick={() => handleUpdateStatus("active")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Activate
                  </button>
                )}
                {selectedTalent.status !== "suspended" && (
                  <button
                    onClick={() => handleUpdateStatus("suspended")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Suspend Specialist
                  </button>
                )}
                {selectedTalent.status !== "deactivated" && (
                  <button
                    onClick={() => handleUpdateStatus("deactivated")}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
