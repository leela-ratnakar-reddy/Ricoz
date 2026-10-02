"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import { PortfolioVisual } from "@/components/PortfolioVisual";
import { EmptyState } from "@/components/EmptyState";
import {
  getDesigners,
  addPortfolioItem,
  deletePortfolioItem,
  updateDesignerProfile,
} from "@/lib/storage";
import { Designer, PortfolioProject, Industry } from "@/types";
import { INDUSTRIES } from "@/data/mockData";
import { Plus, Trash2, Edit3, X, Layers } from "lucide-react";

export default function DesignerPortfolioPage() {
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioProject | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [industry, setIndustry] = useState<Industry>("Technology");
  const [year, setYear] = useState("2025");
  const [servicesInput, setServicesInput] = useState("Creative Direction, Visual Identity Systems");
  const [description, setDescription] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [impact, setImpact] = useState("");

  const loadDesigner = () => {
    const list = getDesigners();
    if (list.length > 0) {
      setDesigner(list[0]);
    }
  };

  useEffect(() => {
    loadDesigner();
    window.addEventListener("brandroom_designers_updated", loadDesigner);
    return () => window.removeEventListener("brandroom_designers_updated", loadDesigner);
  }, []);

  if (!designer) return null;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setClient("");
    setIndustry("Technology");
    setYear("2025");
    setServicesInput("Creative Direction, Visual Identity Systems");
    setDescription("");
    setChallenge("");
    setSolution("");
    setImpact("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj: PortfolioProject) => {
    setEditingItem(proj);
    setTitle(proj.title);
    setClient(proj.client);
    setIndustry(proj.industry);
    setYear(proj.year);
    setServicesInput(proj.services.join(", "));
    setDescription(proj.description);
    setChallenge(proj.challenge || "");
    setSolution(proj.solution || "");
    setImpact(proj.impact || "");
    setModalOpen(true);
  };

  const handleDelete = (projId: string) => {
    deletePortfolioItem(designer.id, projId);
    loadDesigner();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const services = servicesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingItem) {
      // Edit existing
      const updatedList = (designer.portfolio || []).map((p) => {
        if (p.id === editingItem.id) {
          return {
            ...p,
            title,
            client,
            industry,
            year,
            services,
            description,
            challenge,
            solution,
            impact,
          };
        }
        return p;
      });

      const updatedDesigner: Designer = {
        ...designer,
        portfolio: updatedList,
      };
      updateDesignerProfile(updatedDesigner);
    } else {
      // Add new
      addPortfolioItem(designer.id, {
        title,
        client,
        industry,
        year,
        services,
        description,
        challenge,
        solution,
        impact,
        palette: ["#07080C", "#151820", "#C8FF3D", "#8B5CF6"],
      });
    }

    setModalOpen(false);
    loadDesigner();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="designer" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-surface-border">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-1">
                CURATED WORK
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                Portfolio Management
              </h1>
              <p className="text-xs text-brand-muted font-mono mt-1">
                Published rebranding case studies presented to prospective enterprise clients
              </p>
            </div>

            <Button
              size="md"
              onClick={handleOpenAddModal}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Project Case Study
            </Button>
          </div>

          {designer.portfolio.length === 0 ? (
            <EmptyState
              icon={<Layers className="w-6 h-6 text-accent" />}
              title="No portfolio case studies published"
              description="Add your first rebranding case study to showcase your methodology and commercial impact."
              actionLabel="Add case study"
              onAction={handleOpenAddModal}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {designer.portfolio.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-surface/80 border border-surface-border rounded-xl overflow-hidden hover:border-accent/40 transition-all shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <PortfolioVisual
                      title={proj.title}
                      client={proj.client}
                      industry={proj.industry}
                      palette={proj.palette}
                      aspectRatio="aspect-[16/10]"
                    />

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-brand-muted font-mono">
                        <span>{proj.industry}</span>
                        <span>{proj.year}</span>
                      </div>

                      <h3 className="font-medium text-base text-brand">
                        {proj.title}
                      </h3>

                      <p className="text-xs text-brand-secondary line-clamp-2 leading-relaxed font-light">
                        {proj.description}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.services.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-mono text-brand-secondary bg-surface-elevated px-2 py-0.5 rounded border border-surface-border/50"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-elevated/40 border-t border-surface-border flex items-center justify-between">
                    <span className="text-xs font-mono text-brand-muted">
                      Client: {proj.client}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(proj)}
                        className="p-1.5 text-brand-secondary hover:text-brand rounded hover:bg-surface-elevated transition-colors"
                        title="Edit project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(proj.id)}
                        className="p-1.5 text-brand-muted hover:text-accent rounded hover:bg-surface-elevated transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="portfolio-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-xl bg-surface border border-surface-border rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 id="portfolio-modal-title" className="font-semibold text-base text-white font-sans">
                {editingItem ? "Edit Case Study" : "Add Rebranding Case Study"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-brand-muted hover:text-brand"
                aria-label="Close case study dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Northstar Cloud Global Identity"
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="e.g. Northstar Technologies"
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as Industry)}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Year of Delivery
                  </label>
                  <input
                    type="text"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Services (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={servicesInput}
                    onChange={(e) => setServicesInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  Project Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of the corporate rebrand..."
                  className="w-full p-3 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  The Enterprise Challenge (Optional)
                </label>
                <input
                  type="text"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="e.g. Fragmented recognition across 4 acquired tools"
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  Strategic Solution (Optional)
                </label>
                <input
                  type="text"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="e.g. Built a monolithic grid-based design language"
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  Measured Commercial Impact (Optional)
                </label>
                <input
                  type="text"
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  placeholder="e.g. 64% increase in brand perception metric"
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingItem ? "Update Case Study" : "Publish Case Study"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
