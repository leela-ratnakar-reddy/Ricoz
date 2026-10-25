"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  X,
  AlertCircle,
  Building2,
  Send,
  Lock,
} from "lucide-react";
import { SupportTicket, TicketPriority, TicketStatus, TicketCategory, AdminUser, Client } from "@/lib/admin/types";

export default function AdminSupportPage() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState<string>(initialRef);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [newResponse, setNewResponse] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // New Ticket Form
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newCategory, setNewCategory] = useState<TicketCategory>("billing");
  const [newPriority, setNewPriority] = useState<TicketPriority>("medium");
  const [newSubject, setNewSubject] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAssigneeId, setNewAssigneeId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/support?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTickets(data.tickets);
          if (initialRef && !selectedTicket) {
            const found = data.tickets.find((t: SupportTicket) => t.ticketRef === initialRef);
            if (found) openTicketDetail(found);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [memRes, cliRes] = await Promise.all([
        fetch("/api/admin/departments/members"),
        fetch("/api/admin/clients"),
      ]);

      if (memRes.ok) {
        const d = await memRes.json();
        if (d.success) setTeamMembers(d.members);
      }
      if (cliRes.ok) {
        const c = await cliRes.json();
        if (c.success) setClients(c.clients);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter, search]);

  const openTicketDetail = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResolutionNotes(ticket.resolutionNotes || "");
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedTicket(data.ticket);
          setResponses(data.responses || []);
        }
      }
    } catch {
      // fallback
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: newClientId || null,
          customerName: newCustName,
          customerEmail: newCustEmail,
          category: newCategory,
          subject: newSubject,
          description: newDesc,
          priority: newPriority,
          assignedUserId: newAssigneeId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to open ticket");
        setSaving(false);
        return;
      }

      setCreateModalOpen(false);
      setNewCustName("");
      setNewCustEmail("");
      setNewSubject("");
      setNewDesc("");
      fetchTickets();
    } catch {
      setFormError("Server error during ticket submission.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (status: TicketStatus) => {
    if (!selectedTicket) return;

    try {
      const res = await fetch(`/api/admin/support/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolutionNotes: status === "resolved" ? resolutionNotes : selectedTicket.resolution_notes,
        }),
      });

      if (res.ok) {
        setSelectedTicket((prev: any) => (prev ? { ...prev, status } : null));
        fetchTickets();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handlePostResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newResponse.trim()) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/support/${selectedTicket.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newResponse,
          isInternalNote,
        }),
      });

      if (res.ok) {
        setNewResponse("");
        openTicketDetail(selectedTicket);
      }
    } finally {
      setSaving(false);
    }
  };

  const priorityBadges: Record<TicketPriority, { label: string; color: string }> = {
    critical: { label: "Critical", color: "bg-red-950/80 text-red-400 border-red-800/60" },
    high: { label: "High", color: "bg-amber-950/80 text-amber-400 border-amber-800/60" },
    medium: { label: "Medium", color: "bg-blue-950/80 text-blue-400 border-blue-800/60" },
    low: { label: "Low", color: "bg-slate-800 text-slate-300 border-slate-700" },
  };

  const statusBadges: Record<TicketStatus, { label: string; color: string }> = {
    open: { label: "Open", color: "bg-blue-950/80 text-blue-400 border-blue-800/40" },
    pending: { label: "Pending", color: "bg-amber-950/80 text-amber-400 border-amber-800/40" },
    escalated: { label: "Escalated", color: "bg-red-950/80 text-red-400 border-red-800/40" },
    resolved: { label: "Resolved", color: "bg-emerald-950/80 text-emerald-400 border-emerald-800/40" },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Customer Support & Complaints SLA
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Client inquiries, service quality issues, dispute escalations, and resolution audit.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Open Ticket</span>
        </button>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, customer..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Statuses</option>
            <option value="open" className="bg-[#0A0D14]">Open</option>
            <option value="pending" className="bg-[#0A0D14]">Pending</option>
            <option value="escalated" className="bg-[#0A0D14]">Escalated</option>
            <option value="resolved" className="bg-[#0A0D14]">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Priorities</option>
            <option value="critical" className="bg-[#0A0D14]">Critical</option>
            <option value="high" className="bg-[#0A0D14]">High</option>
            <option value="medium" className="bg-[#0A0D14]">Medium</option>
            <option value="low" className="bg-[#0A0D14]">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Categories</option>
            <option value="billing" className="bg-[#0A0D14]">Billing & Escrow</option>
            <option value="talent_matching" className="bg-[#0A0D14]">Talent Matching</option>
            <option value="service_quality" className="bg-[#0A0D14]">Service Quality</option>
            <option value="onboarding" className="bg-[#0A0D14]">Onboarding</option>
            <option value="platform_bug" className="bg-[#0A0D14]">Platform Issue</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-white font-bold">{tickets.length}</span> tickets
        </div>
      </div>

      {/* 3. TICKETS TABLE */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
      ) : tickets.length === 0 ? (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <LifeBuoy className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No support tickets found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Zero active customer tickets match selected filters.
          </p>
        </div>
      ) : (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090F] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Ticket Ref</th>
                  <th className="py-3 px-4">Subject & Customer</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {tickets.map((t) => {
                  const pBadge = priorityBadges[t.priority] || { label: t.priority, color: "bg-slate-800 text-slate-300" };
                  const sBadge = statusBadges[t.status] || { label: t.status, color: "bg-slate-800 text-slate-300" };

                  return (
                    <tr
                      key={t.id}
                      onClick={() => openTicketDetail(t)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {t.ticketRef}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{t.subject}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {t.customerName} &lt;{t.customerEmail}&gt;
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {t.clientName || "Direct Inquiry"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {t.category.replace("_", " ")}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${pBadge.color}`}>
                          {pBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sBadge.color}`}>
                          {sBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {t.assignedUserName || "Unassigned"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openTicketDetail(t);
                          }}
                          className="text-xs font-mono text-slate-400 hover:text-white"
                        >
                          Resolve &rarr;
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

      {/* 4. TICKET RESOLUTION & THREAD MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-400">
                    {selectedTicket.ticket_ref || selectedTicket.ticketRef}
                  </span>
                  <span>•</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {(selectedTicket.category || "").replace("_", " ")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                <div className="flex items-center gap-1.5">
                  {(["open", "pending", "escalated", "resolved"] as TicketStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all ${
                        selectedTicket.status === st
                          ? "bg-red-600 text-white"
                          : "bg-white/[0.04] text-slate-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-slate-400">
                Customer: <strong className="text-white">{selectedTicket.customer_name || selectedTicket.customerName}</strong>
              </div>
            </div>

            {/* Original Inquiry Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Customer Issue Statement
              </span>
              <p className="text-xs text-slate-300 bg-white/[0.01] p-3 rounded-lg border border-white/5 leading-relaxed font-sans">
                {selectedTicket.description}
              </p>
            </div>

            {/* Resolution notes if resolved */}
            {selectedTicket.status === "resolved" && selectedTicket.resolution_notes && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 font-mono space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolution Summary</span>
                </div>
                <p>{selectedTicket.resolution_notes}</p>
              </div>
            )}

            {/* Response & Communication History */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Response History ({responses.length})</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {responses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No replies or internal notes logged yet.</p>
                ) : (
                  responses.map((r) => (
                    <div
                      key={r.id}
                      className={`p-2.5 rounded-lg text-xs space-y-1 border ${
                        r.is_internal_note
                          ? "bg-amber-950/20 border-amber-900/40"
                          : "bg-white/[0.02] border-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-slate-200">
                          {r.user_name} ({r.user_role}) {r.is_internal_note ? "• Internal Note" : "• Client Response"}
                        </span>
                        <span>{new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-slate-300 font-sans">{r.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Response / Internal Note */}
              <form onSubmit={handlePostResponse} className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  required
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Record customer reply or private operational note..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="internal-note-check"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-white/10 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="internal-note-check" className="text-[11px] font-mono text-slate-400 cursor-pointer">
                      Internal team note (not sent to client)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !newResponse.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-white transition-colors disabled:opacity-50"
                  >
                    Post Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. OPEN TICKET MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Open Support Ticket</h3>
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

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Related Client Company
                  </label>
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="" className="bg-[#0A0D14]">Direct Customer Inquiry</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0A0D14]">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="billing" className="bg-[#0A0D14]">Billing & Escrow</option>
                    <option value="talent_matching" className="bg-[#0A0D14]">Talent Matching</option>
                    <option value="service_quality" className="bg-[#0A0D14]">Service Quality</option>
                    <option value="onboarding" className="bg-[#0A0D14]">Onboarding</option>
                    <option value="platform_bug" className="bg-[#0A0D14]">Platform Bug</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Priority *
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="low" className="bg-[#0A0D14]">Low</option>
                    <option value="medium" className="bg-[#0A0D14]">Medium</option>
                    <option value="high" className="bg-[#0A0D14]">High</option>
                    <option value="critical" className="bg-[#0A0D14]">Critical (SLA Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Assignee
                  </label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="" className="bg-[#0A0D14]">Assign to Me</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#0A0D14]">{m.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Question regarding milestone escrow release"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Issue Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detailed customer inquiry or reported dispute..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
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
                  {saving ? "Opening..." : "Open Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
