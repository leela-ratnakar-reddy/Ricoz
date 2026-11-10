"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  BookOpen,
  Edit3,
  X,
  AlertCircle,
  Building,
  ShieldCheck,
} from "lucide-react";
import { SOP, Department } from "@/lib/admin/types";
import { getSOPs, getSOPById, createSOP, updateSOP, deleteSOP, getDepartments } from "@/lib/demo";

export default function AdminSOPsPage() {
  const [sops, setSops] = useState<SOP[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("");
  const [search, setSearch] = useState("");
  const [activeSop, setActiveSop] = useState<SOP | null>(null);

  // Modals & Editing
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState("dept-ops");
  const [newCategory, setNewCategory] = useState("Quality Assurance");
  const [newVersion, setNewVersion] = useState("v1.0");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSops = () => {
    try {
      setLoading(true);
      const data = getSOPs({
        departmentId: selectedDept || undefined,
        search: search || undefined,
      });
      setSops(data);
      if (data.length > 0 && !activeSop) {
        setActiveSop(data[0]);
      }
    } catch (err) {
      console.error("Error loading demo SOPs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepts = () => {
    try {
      const d = getDepartments();
      setDepartments(d);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  useEffect(() => {
    fetchSops();
  }, [selectedDept, search]);

  const handleCreateSop = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const newCreated = createSOP({
        title: newTitle,
        departmentId: newDept,
        category: newCategory,
        version: newVersion,
        summary: newSummary,
        contentMarkdown: newContent,
      });

      setCreateModalOpen(false);
      setNewTitle("");
      setNewSummary("");
      setNewContent("");
      setActiveSop(newCreated);
      fetchSops();
    } catch {
      setFormError("Error creating SOP in demo mode");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Standard Operating Procedures (SOPs)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Internal operational standards, compliance checklists, and process version control.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Procedure</span>
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
              placeholder="Search documentation..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
          >
            <option value="" className="bg-[#0A0D14]">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#0A0D14]">{d.name}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-white font-bold">{sops.length}</span> standardized SOPs
        </div>
      </div>

      {/* 3. TWO-COLUMN SPLIT: DIRECTORY & READER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): SOP List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ) : sops.length === 0 ? (
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-8 text-center text-xs text-slate-400">
              No SOPs found matching filters.
            </div>
          ) : (
            sops.map((s) => {
              const isSelected = activeSop?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSop(s)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-[#141924] border-red-500/60 shadow-lg"
                      : "bg-[#0E1118] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 uppercase font-bold">
                      {s.departmentName || (s as any).department_name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-red-400 font-bold">
                      {s.version}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {s.summary}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Category: {s.category}</span>
                    <span>Reviewed: {s.lastReviewedAt ? new Date(s.lastReviewedAt).toLocaleDateString() : "Active"}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (7 cols): Document Reader */}
        <div className="lg:col-span-7">
          {activeSop ? (
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Reader Header */}
              <div className="space-y-3 pb-5 border-b border-white/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-slate-300">
                    {activeSop.departmentName || (activeSop as any).department_name}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40">
                    {activeSop.version}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Category: {activeSop.category}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
                  {activeSop.title}
                </h1>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-white/[0.02] p-3 rounded-lg border border-white/5 font-sans">
                  {activeSop.summary}
                </p>

                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                  <span>Author / Owner: <strong className="text-slate-300">{activeSop.ownerName || (activeSop as any).owner_name || "Operations Lead"}</strong></span>
                  <span>Last Reviewed: <strong className="text-slate-300">{activeSop.lastReviewedAt ? new Date(activeSop.lastReviewedAt).toLocaleDateString() : "Recent"}</strong></span>
                </div>
              </div>

              {/* Reader Content Markdown Render */}
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4 font-sans prose prose-invert max-w-none">
                {activeSop.contentMarkdown ? (
                  activeSop.contentMarkdown.split("\n\n").map((para, idx) => {
                    if (para.startsWith("### ")) {
                      return (
                        <h4 key={idx} className="text-sm font-bold text-white uppercase tracking-wider font-mono pt-3 pb-1 border-b border-white/5">
                          {para.replace("### ", "")}
                        </h4>
                      );
                    }
                    if (para.startsWith("- ") || para.startsWith("1. ")) {
                      const lines = para.split("\n");
                      return (
                        <ul key={idx} className="space-y-1.5 pl-4 list-disc text-slate-300">
                          {lines.map((l, lIdx) => (
                            <li key={lIdx}>{l.replace(/^[0-9]+\.\s+|^-\s+/, "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx} className="text-slate-300 leading-relaxed">{para}</p>;
                  })
                ) : (
                  <p className="text-slate-500 italic">No document body content available.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-12 text-center text-xs text-slate-500">
              Select an operational SOP from the directory to review instructions.
            </div>
          )}
        </div>
      </div>

      {/* 4. CREATE SOP MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Author Standard Operating Procedure</h3>
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

            <form onSubmit={handleCreateSop} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Procedure Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Enterprise Client Escrow Milestone Approval Procedure"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#0A0D14]">{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Quality Assurance"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="e.g. v1.0"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Executive Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="One or two sentences explaining the scope and objective of this SOP..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Content Body (Markdown Supported) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="### 1. Purpose&#10;&#10;Detailed instructions, checklists, and escalation paths..."
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
                  {saving ? "Publishing..." : "Publish SOP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
