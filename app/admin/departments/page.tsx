"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users2,
  Building,
  Shield,
  Plus,
  Mail,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  AlertCircle,
  Briefcase,
  Layers,
} from "lucide-react";
import { Department, AdminRole } from "@/lib/admin/types";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Member Form State
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("team_member");
  const [newDeptId, setNewDeptId] = useState("dept-ops");
  const [newPassword, setNewPassword] = useState("TempPass2026!");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, memRes] = await Promise.all([
        fetch("/api/admin/departments"),
        fetch("/api/admin/departments/members"),
      ]);

      if (deptRes.ok) {
        const d = await deptRes.json();
        if (d.success) setDepartments(d.departments);
      }
      if (memRes.ok) {
        const m = await memRes.json();
        if (m.success) setMembers(m.members);
      }
    } catch (err) {
      console.error("Error loading departments data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/departments/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          fullName: newName,
          role: newRole,
          departmentId: newDeptId,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to create team member");
        setSaving(false);
        return;
      }

      setAddModalOpen(false);
      setNewEmail("");
      setNewName("");
      fetchData();
    } catch {
      setFormError("Server error while provisioning user.");
    } finally {
      setSaving(false);
    }
  };

  const roleBadges: Record<string, { label: string; color: string }> = {
    super_admin: { label: "Super Admin", color: "bg-red-950/80 text-red-400 border-red-800/60" },
    exec_director: { label: "Executive Director", color: "bg-purple-950/80 text-purple-400 border-purple-800/60" },
    coo: { label: "COO", color: "bg-orange-950/80 text-orange-400 border-orange-800/60" },
    dept_head: { label: "Dept Head", color: "bg-indigo-950/80 text-indigo-400 border-indigo-800/60" },
    ops_manager: { label: "Ops Manager", color: "bg-amber-950/80 text-amber-400 border-amber-800/60" },
    finance_manager: { label: "Finance Manager", color: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60" },
    hr_manager: { label: "HR Manager", color: "bg-pink-950/80 text-pink-400 border-pink-800/60" },
    sales_manager: { label: "Sales Manager", color: "bg-cyan-950/80 text-cyan-400 border-cyan-800/60" },
    marketing_manager: { label: "Marketing Manager", color: "bg-rose-950/80 text-rose-400 border-rose-800/60" },
    tech_manager: { label: "Tech Manager", color: "bg-blue-950/80 text-blue-400 border-blue-800/60" },
    ai_manager: { label: "AI Lead", color: "bg-violet-950/80 text-violet-400 border-violet-800/60" },
    qa_manager: { label: "QA Manager", color: "bg-teal-950/80 text-teal-400 border-teal-800/60" },
    team_member: { label: "Team Member", color: "bg-slate-800/80 text-slate-300 border-slate-700/60" },
    auditor: { label: "Auditor", color: "bg-purple-950/80 text-purple-400 border-purple-800/60" },
    ops_admin: { label: "Ops Admin", color: "bg-amber-950/80 text-amber-400 border-amber-800/60" },
    dept_manager: { label: "Dept Manager", color: "bg-blue-950/80 text-blue-400 border-blue-800/60" },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/[0.04] rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Teams & Department Management
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Organizational structure, role-based access, and objective workload metrics.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* 2. DEPARTMENTS GRID */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-semibold">
          Departmental Infrastructure ({departments.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-[#0E1118] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {dept.member_count} Members
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Head: <strong className="text-slate-200">{dept.head_user_name || "Unassigned"}</strong></span>
                  <span className={`${(dept.overdue_task_count || 0) > 0 ? "text-red-400 font-bold" : "text-slate-400"}`}>
                    {dept.active_task_count} active {dept.overdue_task_count ? `(${dept.overdue_task_count} overdue)` : ""}
                  </span>
                </div>

                <Link
                  href={`/admin/tasks?departmentId=${dept.id}`}
                  className="w-full inline-flex items-center justify-center py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-colors"
                >
                  View Department Tasks &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TEAM MEMBER DIRECTORY & WORKLOAD SUMMARY */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Internal Team Directory & Workload Summary
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {members.length} Authorized Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#07090F] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Active Tasks</th>
                <th className="py-3 px-4">Overdue Work</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {members.map((m) => {
                const badge = roleBadges[m.role] || { label: m.role, color: "bg-slate-800 text-slate-300" };
                return (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-slate-200">
                          {m.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-white">{m.full_name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {m.department_name || "Executive"}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-semibold text-slate-200">{m.active_tasks || 0}</span> tasks
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`${m.overdue_tasks > 0 ? "text-red-400 font-bold" : "text-slate-500"}`}>
                        {m.overdue_tasks || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {m.completed_tasks || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADD TEAM MEMBER MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Provision Team Member</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Liam Sterling"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@ricoz.io"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AdminRole)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="team_member" className="bg-[#0A0D14]">Team Member</option>
                    <option value="dept_manager" className="bg-[#0A0D14]">Dept Manager</option>
                    <option value="ops_admin" className="bg-[#0A0D14]">Ops Admin</option>
                    <option value="auditor" className="bg-[#0A0D14]">Auditor</option>
                    <option value="super_admin" className="bg-[#0A0D14]">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#0A0D14]">{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono uppercase tracking-wider disabled:opacity-50"
                >
                  {saving ? "Provisioning..." : "Provision Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
