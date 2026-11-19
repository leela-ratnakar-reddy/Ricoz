"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Building,
  UserCheck,
  RefreshCw,
  Mail,
  Calendar,
  Layers,
  ChevronLeft,
} from "lucide-react";
import { adminApi } from "@/lib/admin/apiClient";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    talent: 0,
    company: 0,
    verified: 0,
    pendingVerification: 0,
    active: 0,
    suspended: 0,
    deactivated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal & Action State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.platformUsers.list({
        search: search.trim() || undefined,
        accountType: accountTypeFilter || undefined,
        status: statusFilter || undefined,
        isVerified: verificationFilter || undefined,
        page,
        limit: 15,
      });

      if (res.success) {
        setUsers(res.users || []);
        setMetrics(res.metrics || {});
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err: any) {
      console.error("Failed to load platform users:", err);
      setActionError(err?.message || "Failed to load platform users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, accountTypeFilter, statusFilter, verificationFilter, page]);

  const openUserDetails = async (userId: string) => {
    try {
      setDetailLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await adminApi.platformUsers.get(userId);
      if (res.success && res.user) {
        setSelectedUser(res.user);
      }
    } catch (err: any) {
      console.error("Failed to fetch user details:", err);
      setActionError("Failed to fetch full user details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (
    userId: string,
    newStatus: "active" | "suspended" | "deactivated"
  ) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await adminApi.platformUsers.update(userId, {
        status: newStatus,
        reason: `Administrative status change to ${newStatus}`,
      });

      if (res.success) {
        setActionSuccess(`User status updated to ${newStatus}`);
        setTimeout(() => setActionSuccess(null), 3000);
        // Update list locally
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser((prev: any) => ({ ...prev, status: newStatus }));
        }
        fetchUsers();
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setActionError(err?.message || "Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVerification = async (userId: string, currentVerified: boolean) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const nextVerified = !currentVerified;
      const res = await adminApi.platformUsers.update(userId, {
        isVerified: nextVerified,
        reason: `Administrative verification toggle to ${nextVerified ? "verified" : "unverified"}`,
      });

      if (res.success) {
        setActionSuccess(`User verification updated to ${nextVerified ? "Verified" : "Unverified"}`);
        setTimeout(() => setActionSuccess(null), 3000);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_verified: nextVerified } : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser((prev: any) => ({ ...prev, is_verified: nextVerified }));
        }
        fetchUsers();
      }
    } catch (err: any) {
      console.error("Failed to update verification:", err);
      setActionError(err?.message || "Failed to update verification status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>COMMUNITY SUITE</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
            Platform Users
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered creative talent and enterprise company accounts across the Ricoz ecosystem.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={refreshing}
          className="self-start md:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-500" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. LIVE METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0E1118] border border-white/10 rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Total Users
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {metrics.total || 0}
          </div>
        </div>

        <div className="bg-[#0E1118] border border-white/10 rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
            Creative Talent
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {metrics.talent || 0}
          </div>
        </div>

        <div className="bg-[#0E1118] border border-white/10 rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
            Companies
          </span>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">
            {metrics.company || 0}
          </div>
        </div>

        <div className="bg-[#0E1118] border border-white/10 rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block">
            Verified
          </span>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-1">
            {metrics.verified || 0}
          </div>
        </div>

        <div className="bg-[#0E1118] border border-white/10 rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
            Pending Verify
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {metrics.pendingVerification || 0}
          </div>
        </div>

        <div className="bg-[#0E1118] border border-white/10 rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block">
            Suspended
          </span>
          <div className="text-2xl font-black text-red-400 font-mono mt-1">
            {(metrics.suspended || 0) + (metrics.deactivated || 0)}
          </div>
        </div>
      </div>

      {/* 3. ALERTS & NOTIFICATIONS */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-300 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-red-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 4. CONTROLS STRIP */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0E1118] border border-white/10 rounded-xl p-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, headline, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={accountTypeFilter}
              onChange={(e) => {
                setAccountTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
            >
              <option value="" className="bg-[#0A0D14]">All Account Types</option>
              <option value="talent" className="bg-[#0A0D14]">Creative Talent</option>
              <option value="company" className="bg-[#0A0D14]">Enterprise Companies</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
            >
              <option value="" className="bg-[#0A0D14]">All Statuses</option>
              <option value="active" className="bg-[#0A0D14]">Active</option>
              <option value="suspended" className="bg-[#0A0D14]">Suspended</option>
              <option value="deactivated" className="bg-[#0A0D14]">Deactivated</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5">
            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
            >
              <option value="" className="bg-[#0A0D14]">All Verification</option>
              <option value="true" className="bg-[#0A0D14]">Verified</option>
              <option value="false" className="bg-[#0A0D14]">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. USER TABLE */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs font-mono text-slate-400">Querying platform users from PostgreSQL...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white font-sans">No platform users matched</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No registered talent or company accounts match the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-mono uppercase text-slate-400 bg-white/[0.02]">
                  <th className="py-3 px-4">User Identity</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Role / Profile Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {users.map((u) => {
                  const isTalent = u.account_type === "talent";
                  const isVerified = Boolean(u.is_verified);
                  const isSuspended = u.status === "suspended";
                  const isDeactivated = u.status === "deactivated";

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            isTalent
                              ? "bg-emerald-950/70 border border-emerald-700/50 text-emerald-300"
                              : "bg-blue-950/70 border border-blue-700/50 text-blue-300"
                          }`}>
                            {u.full_name ? u.full_name.slice(0, 2) : "CD"}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {u.full_name || "Unnamed User"}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                          isTalent
                            ? "bg-emerald-950/60 border border-emerald-800/40 text-emerald-400"
                            : "bg-blue-950/60 border border-blue-800/40 text-blue-400"
                        }`}>
                          {isTalent ? (
                            <>
                              <Briefcase className="w-2.5 h-2.5" />
                              <span>Talent</span>
                            </>
                          ) : (
                            <>
                              <Building className="w-2.5 h-2.5" />
                              <span>Company</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Profile details */}
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        {isTalent ? (
                          <div>
                            <div className="text-slate-200 truncate font-medium">
                              {u.headline || "Creative Director & Brand Specialist"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {u.talent_location || "Remote"} • {u.hourly_rate || "$150/hr"} • {u.application_count || 0} apps
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-slate-200 truncate font-medium">
                              {u.company_name || "Enterprise Client"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {u.industry || "Technology"} • {u.company_size || "10-50"} • {u.project_count || 0} projects
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          u.status === "active"
                            ? "bg-emerald-950/60 border border-emerald-800/40 text-emerald-400"
                            : isSuspended
                            ? "bg-amber-950/60 border border-amber-800/40 text-amber-400"
                            : "bg-red-950/60 border border-red-800/40 text-red-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            u.status === "active" ? "bg-emerald-400" : isSuspended ? "bg-amber-400" : "bg-red-400"
                          }`} />
                          {u.status}
                        </span>
                      </td>

                      {/* Verification */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                          isVerified
                            ? "bg-emerald-950/50 border border-emerald-800/30 text-emerald-300"
                            : "bg-white/[0.04] border border-white/10 text-slate-400"
                        }`}>
                          {isVerified ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Verified</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Pending</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openUserDetails(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.08] text-[11px] font-mono transition-colors"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => handleToggleVerification(u.id, isVerified)}
                            disabled={actionLoading}
                            title={isVerified ? "Revoke Verification" : "Verify User"}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              isVerified
                                ? "bg-emerald-950/50 border-emerald-800/50 text-emerald-400 hover:bg-red-950/40 hover:border-red-800/40 hover:text-red-300"
                                : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-700/50"
                            }`}
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>

                          {u.status === "active" ? (
                            <button
                              onClick={() => handleUpdateStatus(u.id, "suspended")}
                              disabled={actionLoading}
                              title="Suspend User"
                              className="px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 hover:bg-amber-900/50 text-[10px] font-mono transition-colors"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(u.id, "active")}
                              disabled={actionLoading}
                              title="Reactivate User"
                              className="px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/50 text-[10px] font-mono transition-colors"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3.5 border-t border-white/10 text-xs font-mono text-slate-400 bg-white/[0.01]">
            <span>
              Showing {users.length} of {totalCount} platform users
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0E1118] border border-white/15 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold uppercase text-slate-300 mb-1.5">
                  <span>{selectedUser.account_type} account</span>
                </div>
                <h3 className="text-xl font-bold text-white font-sans">
                  {selectedUser.full_name || "User Details"}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedUser.email} • ID: {selectedUser.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Verification Controls */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">
                      Account Status
                    </span>
                    <span className={`inline-block font-bold capitalize mt-0.5 ${
                      selectedUser.status === "active" ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div className="text-xs">
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">
                      Trust Verification
                    </span>
                    <span className={`inline-block font-bold mt-0.5 ${
                      selectedUser.is_verified ? "text-emerald-400" : "text-slate-400"
                    }`}>
                      {selectedUser.is_verified ? "Verified Official" : "Unverified"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVerification(selectedUser.id, Boolean(selectedUser.is_verified))}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-slate-200 hover:text-white hover:bg-white/[0.1] transition-colors"
                  >
                    {selectedUser.is_verified ? "Revoke Verification" : "Grant Verification"}
                  </button>

                  {selectedUser.status === "active" ? (
                    <button
                      onClick={() => handleUpdateStatus(selectedUser.id, "suspended")}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-800/50 text-xs font-mono text-amber-300 hover:bg-amber-900/60 transition-colors"
                    >
                      Suspend Account
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(selectedUser.id, "active")}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-xs font-mono text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                    >
                      Reactivate Account
                    </button>
                  )}
                </div>
              </div>

              {/* Specialized Profile Data */}
              {selectedUser.account_type === "talent" && selectedUser.specializedProfile && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Specialized Talent Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Headline</span>
                      <span className="text-slate-200 font-medium">
                        {selectedUser.specializedProfile.headline || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Location</span>
                      <span className="text-slate-200 font-medium">
                        {selectedUser.specializedProfile.location || "Remote"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Rate & Experience</span>
                      <span className="text-slate-200 font-medium">
                        {selectedUser.specializedProfile.hourly_rate || "—"} • {selectedUser.specializedProfile.years_experience || 0} years
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Availability</span>
                      <span className="text-slate-200 font-medium">
                        {selectedUser.specializedProfile.availability || "—"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Bio</span>
                      <p className="text-slate-300 mt-1 leading-relaxed">
                        {selectedUser.specializedProfile.bio || "No biography provided."}
                      </p>
                    </div>
                  </div>

                  {/* Applications submitted */}
                  <div>
                    <h5 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Recent Applications ({selectedUser.applications?.length || 0})
                    </h5>
                    {selectedUser.applications && selectedUser.applications.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUser.applications.map((app: any) => (
                          <div key={app.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between text-xs">
                            <div>
                              <div className="font-medium text-white">{app.project_title || "Project Application"}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Company: {app.company_name || "Enterprise"}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">
                              {app.status || "pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No applications submitted yet.</p>
                    )}
                  </div>
                </div>
              )}

              {selectedUser.account_type === "company" && selectedUser.specializedProfile && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Specialized Enterprise Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Company Name</span>
                      <span className="text-slate-200 font-medium">
                        {selectedUser.specializedProfile.company_name || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Contact Person</span>
                      <span className="text-slate-200 font-medium">
                        {selectedUser.specializedProfile.contact_name || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Industry & Size</span>
                      <span className="text-slate-200 font-medium">
                        {selectedUser.specializedProfile.industry || "—"} • {selectedUser.specializedProfile.company_size || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Billing Country</span>
                      <span className="text-slate-200 font-medium">
                        {selectedUser.specializedProfile.billing_country || "Global"}
                      </span>
                    </div>
                  </div>

                  {/* Created Project Briefs */}
                  <div>
                    <h5 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Created Project Briefs ({selectedUser.projects?.length || 0})
                    </h5>
                    {selectedUser.projects && selectedUser.projects.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUser.projects.map((proj: any) => (
                          <div key={proj.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between text-xs">
                            <div>
                              <div className="font-medium text-white">{proj.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Budget: {proj.budget_range || "—"} • {proj.timeline || "8-10 weeks"}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-[10px] font-mono text-blue-300">
                              {proj.status || "Discovery"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No project briefs created yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-slate-200 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
