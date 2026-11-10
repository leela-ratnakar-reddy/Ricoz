"use client";

import React, { useEffect, useState } from "react";
import {
  getUsers,
  getDepartments,
  getRoles,
  getPermissions,
  getUserOverrides,
  createUser,
  updateUser,
  revokeUserSessions,
  addOverride,
  deleteOverride,
  assignDepartmentHead,
} from "@/lib/demo";
import {
  Users2,
  Shield,
  ShieldCheck,
  KeyRound,
  History,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Laptop,
  Trash2,
  Edit2,
  ChevronRight,
  ShieldAlert,
  Building2,
  Lock,
  UserX,
  UserCheck,
  RefreshCw,
} from "lucide-react";

interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: string;
  roleName: string;
  hierarchyLevel: number;
  departmentId: string | null;
  departmentName: string;
  status: "active" | "suspended";
  avatar: string;
  lastLoginAt: string | null;
  createdAt: string;
  activeSessionsCount: number;
  overridesCount: number;
}

interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  head_user_id: string | null;
  head_user_name: string | null;
  member_count: number;
  active_task_count: number;
}

interface RoleDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  hierarchyLevel: number;
  permissions: string[];
  userCount: number;
}

interface PermissionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  module: string;
  action: string;
}

interface UserOverride {
  id: string;
  adminUserId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  permissionSlug: string;
  permissionName: string;
  module: string;
  effect: "allow" | "deny";
  grantedByName: string;
  reason: string;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminTeamPage() {
  const [activeTab, setActiveTab] = useState<"members" | "departments" | "matrix" | "overrides" | "sessions">("members");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [overrides, setOverrides] = useState<UserOverride[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("team_member");
  const [newUserDept, setNewUserDept] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideUser, setOverrideUser] = useState("");
  const [overridePerm, setOverridePerm] = useState("");
  const [overrideEffect, setOverrideEffect] = useState<"allow" | "deny">("deny");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideExpires, setOverrideExpires] = useState("");

  const [reassignHeadDept, setReassignHeadDept] = useState<Department | null>(null);
  const [selectedHeadUserId, setSelectedHeadUserId] = useState("");

  const fetchData = () => {
    setLoading(true);
    setError(null);
    try {
      const uList = getUsers();
      const dList = getDepartments();
      const rList = getRoles();
      const pList = getPermissions();
      const oList = getUserOverrides();

      const mappedUsers: TeamMember[] = uList.map((u) => {
        const r = rList.find((role) => role.slug === u.role);
        const userOverrides = oList.filter((o) => o.adminUserId === u.id);
        return {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          roleName: r ? r.name : u.role,
          hierarchyLevel: r ? r.hierarchyLevel : 13,
          departmentId: u.departmentId,
          departmentName: u.departmentName || "Unassigned",
          status: u.status,
          avatar: u.avatar,
          lastLoginAt: u.lastLoginAt,
          createdAt: u.createdAt,
          activeSessionsCount: 1,
          overridesCount: userOverrides.length,
        };
      });

      setUsers(mappedUsers);
      setDepartments(dList as any);
      setRoles(rList as any);
      setPermissions(pList as any);
      setOverrides(oList as any);
    } catch {
      setError("Failed to load team and access governance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      createUser({
        email: newUserEmail,
        fullName: newUserName,
        role: newUserRole as any,
        departmentId: newUserDept || null,
        password: newUserPassword,
      });
      setSuccessMsg("Team member provisioned successfully (Demo Mode).");
      setShowAddUserModal(false);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPassword("");
      fetchData();
    } catch {
      setError("Error while creating user.");
    }
  };

  const handleToggleUserStatus = (user: TeamMember) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    if (!confirm(`Are you sure you want to ${nextStatus.toUpperCase()} ${user.fullName}?`)) return;

    try {
      updateUser(user.id, { status: nextStatus });
      setSuccessMsg(`User status updated to ${nextStatus}.`);
      fetchData();
    } catch {
      setError("Failed to change user status.");
    }
  };

  const handleRevokeAllSessions = (userId: string, userName: string) => {
    if (!confirm(`Revoke all active sessions for ${userName}?`)) return;
    try {
      revokeUserSessions(userId);
      setSuccessMsg(`All active sessions for ${userName} terminated (Demo Mode).`);
      fetchData();
    } catch {
      setError("Error during session revocation.");
    }
  };

  const handleCreateOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      addOverride({
        userId: overrideUser,
        permissionId: overridePerm,
        effect: overrideEffect,
        reason: overrideReason,
        expiresAt: overrideExpires || null,
      });
      setSuccessMsg("Permission override applied (Demo Mode).");
      setShowOverrideModal(false);
      setOverrideReason("");
      fetchData();
    } catch {
      setError("Error during override assignment.");
    }
  };

  const handleDeleteOverride = (overrideId: string) => {
    if (!confirm("Are you sure you want to remove this permission override?")) return;
    try {
      deleteOverride(overrideId);
      setSuccessMsg("Override removed successfully.");
      fetchData();
    } catch {
      setError("Failed to delete override.");
    }
  };

  const handleReassignHead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignHeadDept) return;
    try {
      assignDepartmentHead(reassignHeadDept.id, selectedHeadUserId || null);
      setSuccessMsg("Department Head reassigned successfully.");
      setReassignHeadDept(null);
      fetchData();
    } catch {
      setError("Failed to update department head.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === "all" || u.departmentId === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Group permissions by module for the permission matrix
  const permissionsByModule = permissions.reduce<Record<string, PermissionItem[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Organizational Governance & RBAC</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Team & Access Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise role hierarchy, 10-department operational boundaries, permission overrides, and security sessions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
            title="Refresh Directory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium font-mono uppercase tracking-wider transition-colors shadow-lg shadow-red-900/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision Member</span>
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 flex items-start justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Total Members</div>
          <div className="text-xl font-bold text-white mt-1 font-mono">{users.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{users.filter((u) => u.status === "active").length} active</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Departments</div>
          <div className="text-xl font-bold text-white mt-1 font-mono">{departments.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">100% operational</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Configured Roles</div>
          <div className="text-xl font-bold text-white mt-1 font-mono">{roles.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">13-tier hierarchy</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Active Overrides</div>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{overrides.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Per-user grants/denials</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto pb-px">
        {[
          { id: "members", label: "Team Members", icon: Users2, count: users.length },
          { id: "departments", label: "Departments", icon: Building2, count: departments.length },
          { id: "matrix", label: "Role & Permission Matrix", icon: Shield, count: roles.length },
          { id: "overrides", label: "Access Overrides", icon: Lock, count: overrides.length },
          { id: "sessions", label: "Security Sessions", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-red-500 text-white bg-white/[0.02]"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? "bg-red-950 text-red-400" : "bg-white/10 text-slate-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: TEAM MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E1118] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="py-2 px-3 rounded-lg bg-[#0E1118] border border-white/10 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-[#0E1118] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Role & Level</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sessions</th>
                    <th className="py-3 px-4">Overrides</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/50 flex items-center justify-center font-mono text-xs text-red-300 font-bold shrink-0">
                            {u.avatar || u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{u.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-950/50 text-red-400 border border-red-900/40">
                          {u.roleName} (L{u.hierarchyLevel})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {u.departmentName}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                            u.status === "active"
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                              : "bg-red-950/60 text-red-400 border border-red-800/40"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {u.activeSessionsCount} active
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {u.overridesCount > 0 ? (
                          <span className="text-amber-400 font-bold">{u.overridesCount} override(s)</span>
                        ) : (
                          <span className="text-slate-600">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`p-1.5 rounded hover:bg-white/10 ${u.status === "active" ? "text-amber-400" : "text-emerald-400"}`}
                            title={u.status === "active" ? "Suspend Account" : "Activate Account"}
                          >
                            {u.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleRevokeAllSessions(u.id, u.fullName)}
                            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-red-400"
                            title="Revoke All Active Sessions"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-500 font-mono">
                        No team members matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="p-5 rounded-xl bg-[#0E1118] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-red-500 uppercase tracking-wider">{d.slug}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                    {d.member_count} Members
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-sans">{d.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {d.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Department Head</div>
                  <div className="text-xs font-medium text-slate-200 mt-0.5">
                    {d.head_user_name || "Unassigned"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setReassignHeadDept(d);
                    setSelectedHeadUserId(d.head_user_id || "");
                  }}
                  className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-colors"
                >
                  Reassign Head
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ROLE & PERMISSION MATRIX */}
      {activeTab === "matrix" && (
        <div className="rounded-xl bg-[#0E1118] border border-white/10 p-5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Thirteen-Tier Organizational Role Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect which operational capabilities are granted, restricted, or audited across roles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3 sticky left-0 bg-[#0E1118] z-10">Module / Permission</th>
                  {roles.map((r) => (
                    <th key={r.id} className="py-2.5 px-2 text-center min-w-[90px]">
                      <div className="font-bold text-slate-200">{r.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">L{r.hierarchyLevel}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {Object.entries(permissionsByModule).map(([moduleName, perms]) => (
                  <React.Fragment key={moduleName}>
                    <tr className="bg-white/[0.02]">
                      <td colSpan={roles.length + 1} className="py-2 px-3 font-bold text-red-400 uppercase text-[10px] tracking-wider">
                        {moduleName} Module ({perms.length})
                      </td>
                    </tr>
                    {perms.map((p) => (
                      <tr key={p.slug} className="hover:bg-white/[0.01]">
                        <td className="py-2 px-3 sticky left-0 bg-[#0E1118] z-10">
                          <div className="text-slate-300 font-medium">{p.name}</div>
                          <div className="text-[9px] text-slate-500">{p.slug}</div>
                        </td>
                        {roles.map((r) => {
                          const isSuperAdmin = r.slug === "super_admin";
                          const isGranted = isSuperAdmin || r.permissions.includes(p.slug);
                          return (
                            <td key={r.id} className="py-2 px-2 text-center">
                              {isGranted ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 mx-auto">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-block text-slate-700">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ACCESS OVERRIDES */}
      {activeTab === "overrides" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Granular Permission Overrides</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Explicit user-level overrides (`ALLOW` or `DENY`). Explicit denials take absolute precedence over inherited roles.
              </p>
            </div>
            <button
              onClick={() => setShowOverrideModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Override</span>
            </button>
          </div>

          <div className="rounded-xl bg-[#0E1118] border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Permission</th>
                  <th className="py-3 px-4">Effect</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Granted By</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {overrides.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{o.userName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{o.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      <div>{o.permissionName}</div>
                      <div className="text-[10px] text-slate-500">{o.permissionSlug}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          o.effect === "allow"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                            : "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                        }`}
                      >
                        {o.effect}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs max-w-xs truncate">{o.reason}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{o.grantedByName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {o.expiresAt ? new Date(o.expiresAt).toLocaleDateString() : "Permanent"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteOverride(o.id)}
                        className="p-1.5 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                        title="Remove Override"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {overrides.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-500 font-mono">
                      No explicit user overrides configured. All users follow their standard role permissions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY SESSIONS */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Active Administrative Sessions</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live browser sessions across team members. Sessions auto-expire after 60 minutes of inactivity or upon suspension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((u) => (
              <div key={u.id} className="p-4 rounded-xl bg-[#0E1118] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-xs">{u.fullName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/50 text-red-400 border border-red-900/40">
                      {u.roleName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300 font-mono text-[11px]">
                      {u.activeSessionsCount} active browser session(s)
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Last Login: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                  </span>
                  {u.activeSessionsCount > 0 && (
                    <button
                      onClick={() => handleRevokeAllSessions(u.id, u.fullName)}
                      className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900/60 border border-red-800/40 text-[10px] font-mono text-red-300 transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: PROVISION TEAM MEMBER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Provision Team Member</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Rachel Thorne"
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="name@ricoz.io"
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Organizational Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#07080C] border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                >
                  {roles.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name} (L{r.hierarchyLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Primary Department</label>
                <select
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#07080C] border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Initial Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[11px] uppercase tracking-wider font-semibold"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE OVERRIDE */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Set Permission Override</h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOverride} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Target User</label>
                <select
                  required
                  value={overrideUser}
                  onChange={(e) => setOverrideUser(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#07080C] border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                >
                  <option value="">Select User...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Permission</label>
                <select
                  required
                  value={overridePerm}
                  onChange={(e) => setOverridePerm(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#07080C] border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                >
                  <option value="">Select Permission...</option>
                  {permissions.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.module}: {p.name} ({p.slug})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Effect</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverrideEffect("deny")}
                    className={`p-2 rounded-lg font-mono text-[11px] font-bold uppercase border transition-colors ${
                      overrideEffect === "deny"
                        ? "bg-rose-950/80 border-rose-600 text-rose-300"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    DENY (Block)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideEffect("allow")}
                    className={`p-2 rounded-lg font-mono text-[11px] font-bold uppercase border transition-colors ${
                      overrideEffect === "allow"
                        ? "bg-emerald-950/80 border-emerald-600 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    ALLOW (Grant)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Business Reason</label>
                <textarea
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why this override is necessary for governance auditing..."
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">Expiration (Optional)</label>
                <input
                  type="date"
                  value={overrideExpires}
                  onChange={(e) => setOverrideExpires(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[11px] uppercase tracking-wider font-semibold"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REASSIGN DEPARTMENT HEAD */}
      {reassignHeadDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0E1118] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Reassign Head: {reassignHeadDept.name}
              </h3>
              <button onClick={() => setReassignHeadDept(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleReassignHead} className="space-y-4 text-xs">
              <p className="text-slate-400 text-xs">
                Designating a department head assigns functional leadership and approvals for this department.
              </p>

              <div>
                <label className="block text-slate-300 font-mono uppercase text-[10px] mb-1">New Department Head</label>
                <select
                  value={selectedHeadUserId}
                  onChange={(e) => setSelectedHeadUserId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#07080C] border border-white/10 text-white font-mono focus:outline-none focus:border-red-500"
                >
                  <option value="">Leave Unassigned</option>
                  {users.filter((u) => u.status === "active").map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.roleName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReassignHeadDept(null)}
                  className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[11px] uppercase tracking-wider font-semibold"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
