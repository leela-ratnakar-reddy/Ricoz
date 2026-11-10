"use client";

import React, { useEffect, useState } from "react";
import {
  Handshake,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  FileText,
  User,
  Shield,
  X,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Vendor, VendorVerificationStatus, VendorOnboardingStage, AdminUser } from "@/lib/admin/types";
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  verifyVendorDocument,
  getDepartmentMembers,
} from "@/lib/demo";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // New Vendor Form
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Custom Typography & Font Engineering");
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCoordinatorId, setNewCoordinatorId] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVendors = () => {
    try {
      setLoading(true);
      const data = getVendors({
        status: statusFilter || undefined,
        stage: stageFilter || undefined,
        search: search || undefined,
      });
      setVendors(data);
    } catch (err) {
      console.error("Error fetching demo vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = () => {
    try {
      const members = getDepartmentMembers();
      setTeamMembers(members as any);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [statusFilter, stageFilter, search]);

  const openVendorDetail = (v: Vendor) => {
    setSelectedVendor(v);
    setNotesDraft(v.notes || "");
    setErrorAlert(null);
    try {
      const res = getVendorById(v.id);
      if (res.vendor) {
        setSelectedVendor(res.vendor);
        setDocuments(res.documents || []);
      }
    } catch {
      // fallback
    }
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      createVendor({
        name: newName,
        serviceCategory: newCategory,
        contactName: newContactName,
        contactEmail: newContactEmail,
        phone: newPhone,
        assignedCoordinatorId: newCoordinatorId || null,
        notes: newNotes,
      });

      setCreateModalOpen(false);
      setNewName("");
      setNewContactName("");
      setNewContactEmail("");
      fetchVendors();
    } catch {
      setFormError("Error creating vendor in demo mode");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDocument = (docId: string, currentStatus: boolean) => {
    if (!selectedVendor) return;
    setErrorAlert(null);

    try {
      verifyVendorDocument(selectedVendor.id, docId, !currentStatus);
      const res = getVendorById(selectedVendor.id);
      if (res.vendor) {
        setSelectedVendor(res.vendor);
        setDocuments(res.documents || []);
      }
      fetchVendors();
    } catch {
      setErrorAlert("Failed to update document verification status in demo mode");
    }
  };

  const handleSetVerificationStatus = (status: VendorVerificationStatus) => {
    if (!selectedVendor) return;
    setErrorAlert(null);

    try {
      const updated = updateVendor(selectedVendor.id, { verificationStatus: status });
      if (updated) {
        setSelectedVendor(updated);
        fetchVendors();
      }
    } catch {
      setErrorAlert("Failed to update vendor verification status");
    }
  };

  const handleUpdateStage = (stage: VendorOnboardingStage) => {
    if (!selectedVendor) return;

    try {
      const updated = updateVendor(selectedVendor.id, { onboardingStage: stage });
      if (updated) {
        setSelectedVendor(updated);
        fetchVendors();
      }
    } catch (err) {
      console.error("Update stage error:", err);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedVendor) return;
    try {
      setSaving(true);
      const updated = updateVendor(selectedVendor.id, { notes: notesDraft });
      if (updated) setSelectedVendor(updated);
      fetchVendors();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (!confirm("Are you sure you want to delete this vendor partner?")) return;
    deleteVendor(vendorId);
    setSelectedVendor(null);
    fetchVendors();
  };

  const verificationBadges: Record<VendorVerificationStatus, { label: string; color: string }> = {
    unverified: { label: "Unverified", color: "bg-slate-800 text-slate-400 border-slate-700" },
    pending_review: { label: "Pending Review", color: "bg-amber-950/80 text-amber-400 border-amber-800/60" },
    verified: { label: "Verified Partner", color: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60" },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Handshake className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Creative Vendor & Partner Network
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Specialized ateliers, type foundries, 3D studios, and verified packaging fabricators.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vendor</span>
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
              placeholder="Search vendor or category..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Verifications</option>
            <option value="verified" className="bg-[#0A0D14]">Verified Partners</option>
            <option value="pending_review" className="bg-[#0A0D14]">Pending Review</option>
            <option value="unverified" className="bg-[#0A0D14]">Unverified</option>
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Stages</option>
            <option value="application" className="bg-[#0A0D14]">Application</option>
            <option value="document_review" className="bg-[#0A0D14]">Document Review</option>
            <option value="vetting" className="bg-[#0A0D14]">Craft Vetting</option>
            <option value="approved" className="bg-[#0A0D14]">Approved</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-white font-bold">{vendors.length}</span> specialized vendors
        </div>
      </div>

      {/* 3. VENDOR TABLE */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
      ) : vendors.length === 0 ? (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <Handshake className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No vendors match filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or register a new creative vendor partner.
          </p>
        </div>
      ) : (
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090F] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Vendor & Atelier</th>
                  <th className="py-3 px-4">Service Category</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Compliance Docs</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {vendors.map((v) => {
                  const vStatus = (v.verificationStatus || v.verification_status || "unverified") as VendorVerificationStatus;
                  const vBadge = verificationBadges[vStatus] || { label: vStatus, color: "bg-slate-800 text-slate-400" };
                  const verifiedDocs = v.verifiedDocsCount || 0;
                  const totalDocs = v.totalDocsCount || 4;

                  return (
                    <tr
                      key={v.id}
                      onClick={() => openVendorDetail(v)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{v.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Coord: {v.assignedCoordinatorName || "Unassigned"}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {v.serviceCategory}
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        <div className="text-slate-200">{v.contactName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{v.contactEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-300">
                          {(v.onboardingStage || v.onboarding_stage || "application").replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${vBadge.color}`}>
                          {vBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className={verifiedDocs === totalDocs ? "text-emerald-400 font-bold" : "text-amber-400"}>
                          {verifiedDocs}/{totalDocs} verified
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openVendorDetail(v);
                          }}
                          className="text-xs font-mono text-slate-400 hover:text-white"
                        >
                          Review &rarr;
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

      {/* 4. VENDOR VETTING & DOCUMENT AUDIT MODAL */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {selectedVendor.service_category || selectedVendor.serviceCategory}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedVendor.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorAlert && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorAlert}</span>
              </div>
            )}

            {/* Verification Control Strip */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Official Verification Status
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Requires All Documents Verified
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(["unverified", "pending_review", "verified"] as VendorVerificationStatus[]).map((st) => {
                  const isCurrent = (selectedVendor.verification_status || selectedVendor.verificationStatus) === st;
                  return (
                    <button
                      key={st}
                      onClick={() => handleSetVerificationStatus(st)}
                      className={`py-2 px-3 rounded-xl text-center text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                        isCurrent
                          ? st === "verified"
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                            : "bg-amber-600 text-white border-amber-500 shadow-sm"
                          : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compliance Document Audit Checklist */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Compliance & Legal Documents Checklist</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {documents.filter((d) => d.is_verified).length}/{documents.length} Authenticated
                </span>
              </div>

              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      doc.is_verified
                        ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                        : "bg-white/[0.02] border-white/5 text-slate-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.document_type}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        File: {doc.file_name} {doc.verified_by_user_name ? `• Verified by ${doc.verified_by_user_name}` : ""}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleDocument(doc.id, Boolean(doc.is_verified))}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                        doc.is_verified
                          ? "bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900"
                          : "bg-white/[0.06] text-slate-300 hover:bg-white/[0.12]"
                      }`}
                    >
                      {doc.is_verified ? "✓ Verified" : "Verify Document"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationship Notes */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-white">Relationship Notes & Directives</div>
              <textarea
                rows={3}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Quality review notes, foundry license scope, or technical constraints..."
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleDeleteVendor(selectedVendor.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-800/50 text-red-400 hover:text-red-300 text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Vendor</span>
                </button>

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

      {/* 5. REGISTER VENDOR MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Register Creative Vendor</h3>
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

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Vendor / Atelier Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Zurich Type Foundry"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Creative Service Category *
                </label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. 3D Spatial Computing & WebGL"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. Lucas Meier"
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
                    placeholder="partner@atelier.ch"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Assigned Coordinator
                </label>
                <select
                  value={newCoordinatorId}
                  onChange={(e) => setNewCoordinatorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                >
                  <option value="" className="bg-[#0A0D14]">Assign to Me</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#0A0D14]">{m.fullName}</option>
                  ))}
                </select>
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
                  {saving ? "Registering..." : "Register Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
