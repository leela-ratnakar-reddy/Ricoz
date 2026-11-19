"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
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
  Globe,
  Download,
  Filter,
  ChevronLeft,
  Layers,
  Users,
} from "lucide-react";
import { adminApi } from "@/lib/admin/apiClient";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    verified: 0,
    active: 0,
    suspended: 0,
    companiesWithProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal & Action State
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.companies.list({
        search: search.trim() || undefined,
        industry: industryFilter || undefined,
        companySize: sizeFilter || undefined,
        isVerified: verificationFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      });

      if (res.success) {
        setCompanies(res.companies || []);
        setMetrics(res.metrics || {});
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err: any) {
      console.error("Failed to load companies:", err);
      setActionError(err?.message || "Failed to load enterprise companies");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, industryFilter, sizeFilter, verificationFilter, statusFilter, page]);

  const openCompanyDetails = async (companyId: string) => {
    try {
      setDetailLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await adminApi.companies.get(companyId);
      if (res.success && res.company) {
        setSelectedCompany(res.company);
      }
    } catch (err: any) {
      console.error("Failed to fetch company details:", err);
      setActionError(err?.message || "Failed to load company details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "active" | "suspended" | "deactivated") => {
    if (!selectedCompany) return;
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await adminApi.companies.update(selectedCompany.id, { status: newStatus });
      if (res.success) {
        setActionSuccess(`Company account status updated to '${newStatus}'`);
        setSelectedCompany((prev: any) => ({ ...prev, status: newStatus }));
        fetchCompanies();
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!selectedCompany) return;
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const newVerified = !selectedCompany.is_verified;
      const res = await adminApi.companies.update(selectedCompany.id, { is_verified: newVerified });
      if (res.success) {
        setActionSuccess(`Company verification set to ${newVerified ? "VERIFIED" : "UNVERIFIED"}`);
        setSelectedCompany((prev: any) => ({ ...prev, is_verified: newVerified }));
        fetchCompanies();
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
            <span className="text-xs uppercase tracking-widest text-red-500 font-mono">Corporate Directory</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Enterprise Client Accounts</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage corporate partners, verify business credentials, and monitor creative project procurement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/reports/export?type=companies"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <button
            onClick={fetchCompanies}
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
            <span>TOTAL ENTERPRISES</span>
            <Building2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-light text-white">{metrics.total}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Registered clients</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>VERIFIED CORPORATE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-light text-emerald-400">{metrics.verified}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            {metrics.total > 0 ? Math.round((metrics.verified / metrics.total) * 100) : 0}% authenticated
          </div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>ACTIVE CLIENTS</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-light text-white">{metrics.active}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">In good standing</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
            <span>WITH MANDATES</span>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-light text-white">{metrics.companiesWithProjects}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Procurement active</div>
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
            placeholder="Search company, contact person, email, domain..."
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
            <option value="true">Verified Corporate</option>
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

          {(search || verificationFilter || statusFilter || industryFilter || sizeFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setVerificationFilter("");
                setStatusFilter("");
                setIndustryFilter("");
                setSizeFilter("");
                setPage(1);
              }}
              className="text-xs text-neutral-400 hover:text-white font-mono underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-neutral-900/40 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/80 border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Lead Contact</th>
                <th className="px-6 py-3">Industry / Scale</th>
                <th className="px-6 py-3">Mandates Posted</th>
                <th className="px-6 py-3">Verification</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-mono text-xs">
                    Loading enterprise companies directory...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-mono text-xs">
                    No enterprise client accounts found matching criteria.
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white overflow-hidden shrink-0">
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt={c.company_name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center gap-1.5">
                            {c.company_name || c.full_name || "Enterprise Account"}
                            {c.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          {c.website_url && (
                            <a
                              href={c.website_url.startsWith("http") ? c.website_url : `https://${c.website_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 font-mono mt-0.5"
                            >
                              <Globe className="w-3 h-3" />
                              {c.website_url.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-neutral-200 text-xs">{c.contact_name || c.full_name || "—"}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {c.business_email || c.email}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="text-white">{c.industry || "General Industry"}</div>
                      <div className="text-neutral-500 text-[11px]">{c.company_size || "Scale unlisted"}</div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="text-white">{c.projects_count || 0} mandates</div>
                      <div className="text-neutral-500 text-[11px]">
                        {c.received_applications_count || 0} proposals received
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {c.is_verified ? (
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
                          c.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : c.status === "suspended"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-neutral-800 text-neutral-400 border border-white/10"
                        }`}
                      >
                        {c.status || "active"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openCompanyDetails(c.id)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs font-mono transition-colors"
                      >
                        Manage
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
            Showing {companies.length > 0 ? (page - 1) * 15 + 1 : 0} to{" "}
            {Math.min(page * 15, totalCount)} of {totalCount} enterprises
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

      {/* Company Detail Modal / Slideout */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-white/15 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-neutral-800 border border-white/15 flex items-center justify-center text-lg font-mono font-bold text-white overflow-hidden">
                  <Building2 className="w-7 h-7 text-neutral-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-light text-white">
                      {selectedCompany.company_name || selectedCompany.full_name}
                    </h2>
                    {selectedCompany.is_verified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    Contact: {selectedCompany.contact_name || selectedCompany.full_name} •{" "}
                    {selectedCompany.business_email || selectedCompany.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
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
                  <div className="text-neutral-500">INDUSTRY</div>
                  <div className="text-white mt-1">{selectedCompany.industry || "Unspecified"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">SCALE / SIZE</div>
                  <div className="text-white mt-1">{selectedCompany.company_size || "—"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">BILLING COUNTRY</div>
                  <div className="text-white mt-1">{selectedCompany.billing_country || "International"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">APPLICATIONS IN</div>
                  <div className="text-white mt-1">{selectedCompany.totalApplicationsReceived || 0} received</div>
                </div>
              </div>

              {/* Website */}
              {selectedCompany.website_url && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Corporate Domain</h3>
                  <a
                    href={selectedCompany.website_url.startsWith("http") ? selectedCompany.website_url : `https://${selectedCompany.website_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono text-red-400 hover:text-red-300 underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {selectedCompany.website_url}
                  </a>
                </div>
              )}

              {/* Mandates Posted */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Posted Creative Mandates ({selectedCompany.projects?.length || 0})
                </h3>
                {selectedCompany.projects && selectedCompany.projects.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCompany.projects.map((proj: any) => (
                      <div key={proj.id} className="p-3 bg-neutral-950/40 rounded border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white font-medium">{proj.title}</div>
                          <div className="text-xs text-neutral-400 font-mono mt-0.5">
                            Tier: {proj.budget_tier || "Standard"} • Timeline: {proj.timeline || "TBD"} • {proj.applications_count || 0} applications
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-white/10">
                          {proj.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 font-mono">No project briefs submitted by this company yet.</p>
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
                    selectedCompany.is_verified
                      ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {selectedCompany.is_verified ? "Revoke Verification" : "Grant Corporate Badge"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedCompany.status !== "active" && (
                  <button
                    onClick={() => handleUpdateStatus("active")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Activate
                  </button>
                )}
                {selectedCompany.status !== "suspended" && (
                  <button
                    onClick={() => handleUpdateStatus("suspended")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Suspend Enterprise
                  </button>
                )}
                {selectedCompany.status !== "deactivated" && (
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
