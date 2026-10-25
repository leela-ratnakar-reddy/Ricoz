"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  X,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Client, ClientOnboardingStage, AdminUser } from "@/lib/admin/types";

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [followUpDraft, setFollowUpDraft] = useState("");

  // New Client Form
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("Technology");
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCompanySize, setNewCompanySize] = useState("50-100 employees");
  const [newStage, setNewStage] = useState<ClientOnboardingStage>("inquiry");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newFollowUp, setNewFollowUp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (stageFilter) params.append("stage", stageFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/clients?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setClients(data.clients);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/admin/departments/members");
      if (res.ok) {
        const d = await res.json();
        if (d.success) setTeamMembers(d.members);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    fetchClients();
  }, [stageFilter, search]);

  const openClientDetail = async (c: Client) => {
    setSelectedClient(c);
    setNotesDraft(c.notes || "");
    setFollowUpDraft(c.nextFollowUp || "");
    try {
      const res = await fetch(`/api/admin/clients/${c.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedClient(data.client);
          setChecklist(data.checklist || []);
        }
      }
    } catch {
      // fallback
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          industry: newIndustry,
          contactName: newContactName,
          contactEmail: newContactEmail,
          phone: newPhone,
          companySize: newCompanySize,
          stage: newStage,
          assignedOwnerId: newOwnerId || null,
          notes: newNotes,
          nextFollowUp: newFollowUp || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to create client");
        setSaving(false);
        return;
      }

      setCreateModalOpen(false);
      setNewName("");
      setNewContactName("");
      setNewContactEmail("");
      fetchClients();
    } catch {
      setFormError("Server request error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChecklist = async (itemId: string, currentStatus: boolean) => {
    if (!selectedClient) return;

    try {
      const res = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toggleChecklistId: itemId,
          isCompleted: !currentStatus,
        }),
      });

      if (res.ok) {
        setChecklist((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  is_completed: !currentStatus ? 1 : 0,
                  completed_at: !currentStatus ? new Date().toISOString() : null,
                }
              : item
          )
        );
        fetchClients();
      }
    } catch (err) {
      console.error("Toggle checklist error:", err);
    }
  };

  const handleUpdateStage = async (stage: ClientOnboardingStage) => {
    if (!selectedClient) return;

    try {
      const res = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingStage: stage }),
      });

      if (res.ok) {
        setSelectedClient((prev: any) => (prev ? { ...prev, onboarding_stage: stage } : null));
        fetchClients();
      }
    } catch (err) {
      console.error("Stage update error:", err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    try {
      setSaving(true);
      await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notesDraft,
          nextFollowUp: followUpDraft || null,
        }),
      });
      fetchClients();
    } finally {
      setSaving(false);
    }
  };

  const stageBadges: Record<ClientOnboardingStage, { label: string; color: string }> = {
    inquiry: { label: "Inquiry", color: "bg-slate-800 text-slate-300 border-slate-700" },
    contract_review: { label: "Contract Review", color: "bg-amber-950/80 text-amber-400 border-amber-800/60" },
    kickoff: { label: "Kickoff", color: "bg-blue-950/80 text-blue-400 border-blue-800/60" },
    active: { label: "Active", color: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60" },
    churned: { label: "Churned", color: "bg-red-950/80 text-red-400 border-red-800/60" },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Client Onboarding & Relations
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Enterprise accounts, stage progressions, mutual NDA execution, and checklist tracking.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
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
              placeholder="Search by client or contact..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Stages</option>
            <option value="inquiry" className="bg-[#0A0D14]">Inquiry</option>
            <option value="contract_review" className="bg-[#0A0D14]">Contract Review</option>
            <option value="kickoff" className="bg-[#0A0D14]">Kickoff Scheduled</option>
            <option value="active" className="bg-[#0A0D14]">Active Mandate</option>
            <option value="churned" className="bg-[#0A0D14]">Churned</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-white font-bold">{clients.length}</span> enterprise clients
        </div>
      </div>

      {/* 3. CLIENTS TABLE */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
      ) : clients.length === 0 ? (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No clients found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your search filter or onboarding a new client account.
          </p>
        </div>
      ) : (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090F] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Client Company</th>
                  <th className="py-3 px-4">Industry & Size</th>
                  <th className="py-3 px-4">Primary Contact</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Onboarding Checklist</th>
                  <th className="py-3 px-4">Account Lead</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {clients.map((c) => {
                  const stageKey = (c.onboardingStage || c.onboarding_stage || "inquiry") as ClientOnboardingStage;
                  const badge = stageBadges[stageKey] || { label: stageKey, color: "bg-slate-800 text-slate-300" };
                  const total = c.totalChecklistCount || 5;
                  const completed = c.completedChecklistCount || 0;
                  const pct = Math.round((completed / total) * 100);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => openClientDetail(c)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{c.name}</div>
                        {c.nextFollowUp && (
                          <div className="text-[10px] font-mono text-red-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Follow-up: {c.nextFollowUp}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        <div>{c.industry}</div>
                        <div className="text-[10px] text-slate-500">{c.companySize}</div>
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        <div className="text-slate-200">{c.contactName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{c.contactEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-32 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>{completed}/{total} items</span>
                            <span className="font-bold text-slate-300">{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {c.assignedOwnerName || "Unassigned"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openClientDetail(c);
                          }}
                          className="text-xs font-mono text-slate-400 hover:text-white"
                        >
                          Manage &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CLIENT DETAIL & ONBOARDING CHECKLIST DRAWER */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {selectedClient.industry} // {selectedClient.company_size || selectedClient.companySize}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedClient.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage Selector */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Onboarding Stage
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(["inquiry", "contract_review", "kickoff", "active", "churned"] as ClientOnboardingStage[]).map((stg) => {
                  const isCurrent = (selectedClient.onboarding_stage || selectedClient.onboardingStage) === stg;
                  return (
                    <button
                      key={stg}
                      onClick={() => handleUpdateStage(stg)}
                      className={`py-1.5 px-2 rounded-lg text-center text-[10px] font-mono font-bold uppercase tracking-wider transition-all border ${
                        isCurrent
                          ? "bg-red-600 text-white border-red-500 shadow-sm"
                          : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {stg.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Primary Contact</span>
                <div className="font-bold text-white">{selectedClient.contact_name || selectedClient.contactName}</div>
                <div className="text-slate-400">{selectedClient.contact_email || selectedClient.contactEmail}</div>
                <div className="text-slate-500">{selectedClient.phone || "No phone listed"}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Account Coordination</span>
                <div className="font-bold text-white">Lead: {selectedClient.assigned_owner_name || selectedClient.assignedOwnerName || "Unassigned"}</div>
                <div className="text-slate-400">Follow-up: {selectedClient.next_follow_up || selectedClient.nextFollowUp || "None scheduled"}</div>
              </div>
            </div>

            {/* Onboarding Checklist */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Onboarding Compliance Checklist</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {checklist.filter((i) => i.is_completed).length}/{checklist.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id, Boolean(item.is_completed))}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      item.is_completed
                        ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                        : "bg-white/[0.02] border-white/5 text-slate-300 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          item.is_completed
                            ? "bg-emerald-500 text-black font-bold"
                            : "border border-white/20"
                        }`}
                      >
                        {item.is_completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{item.title}</div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          {item.category}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {item.is_completed ? "Completed" : "Pending Action"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationship Notes & Next Follow-Up */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-white">Relationship Notes & Directives</div>
              <textarea
                rows={3}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Meeting takeaways, custom escrow terms, or special requirements..."
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Next Follow-Up:</span>
                  <input
                    type="date"
                    value={followUpDraft}
                    onChange={(e) => setFollowUpDraft(e.target.value)}
                    className="px-2 py-1 rounded bg-[#0A0D14] border border-white/10 text-white font-mono text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono font-bold transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD CLIENT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add Enterprise Client</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
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

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Helix Robotics Inc."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Industry
                  </label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="Technology" className="bg-[#0A0D14]">Technology</option>
                    <option value="Finance" className="bg-[#0A0D14]">Finance</option>
                    <option value="Healthcare" className="bg-[#0A0D14]">Healthcare</option>
                    <option value="Biotechnology" className="bg-[#0A0D14]">Biotechnology</option>
                    <option value="Consumer" className="bg-[#0A0D14]">Consumer</option>
                    <option value="Media & Entertainment" className="bg-[#0A0D14]">Media</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Company Size
                  </label>
                  <select
                    value={newCompanySize}
                    onChange={(e) => setNewCompanySize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="10-50 employees" className="bg-[#0A0D14]">10-50 employees</option>
                    <option value="50-100 employees" className="bg-[#0A0D14]">50-100 employees</option>
                    <option value="100-250 employees" className="bg-[#0A0D14]">100-250 employees</option>
                    <option value="250-500 employees" className="bg-[#0A0D14]">250-500 employees</option>
                    <option value="500+ employees" className="bg-[#0A0D14]">500+ employees</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Primary Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Onboarding Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as ClientOnboardingStage)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="inquiry" className="bg-[#0A0D14]">Inquiry</option>
                    <option value="contract_review" className="bg-[#0A0D14]">Contract Review</option>
                    <option value="kickoff" className="bg-[#0A0D14]">Kickoff</option>
                    <option value="active" className="bg-[#0A0D14]">Active Mandate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Account Owner
                  </label>
                  <select
                    value={newOwnerId}
                    onChange={(e) => setNewOwnerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="" className="bg-[#0A0D14]">Assign to Me</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#0A0D14]">{m.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono uppercase tracking-wider disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
