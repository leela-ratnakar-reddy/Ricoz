"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import { MatchScore } from "@/components/MatchScore";
import { getProjects, getDesigners, sendMessage, startOrGetConversation } from "@/lib/storage";
import { calculateMatch } from "@/lib/matching";
import { Project, Designer } from "@/types";
import {
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Send,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DesignerOpportunitiesPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [proposalPitch, setProposalPitch] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const projs = getProjects();
    setProjects(projs);
    const designers = getDesigners();
    if (designers.length > 0) {
      setDesigner(designers[0]); // Alex Morgan
    }
  }, []);

  if (!designer) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalPitch.trim() || !selectedProject) return;

    // Send proposal as initial message to demo company thread
    const conv = startOrGetConversation(designer);
    sendMessage(
      conv.id,
      `[Proposal for "${selectedProject.title}"]: ${proposalPitch.trim()}`,
      designer.name
    );

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedProject(null);
      setProposalPitch("");
      router.push("/dashboard/designer/messages");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="designer" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* HEADER */}
          <div className="pb-8 mb-8 border-b border-surface-border">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-1">
              OPPORTUNITIES BOARD
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Rebranding Project Mandates
            </h1>
            <p className="text-xs text-brand-muted font-mono mt-1">
              Active enterprise briefs seeking Creative Directors and Senior Brand Identity Designers
            </p>
          </div>

          <div className="space-y-4">
            {projects.map((proj) => {
              const match = calculateMatch(proj, designer);

              return (
                <div
                  key={proj.id}
                  className="bg-surface/80 border border-surface-border rounded-xl p-6 sm:p-8 hover:border-accent/40 transition-all shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-xs text-brand font-mono uppercase">
                        {proj.companyName}
                      </span>
                      <span className="text-xs text-surface-border">•</span>
                      <span className="text-xs font-mono text-brand-muted">
                        {proj.industry} Sector
                      </span>
                      <span className="text-xs text-surface-border">•</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent/10 text-accent border border-accent/20">
                        {proj.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg sm:text-xl text-white font-sans">
                      {proj.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-brand-secondary line-clamp-2">
                      Target Audience: {proj.targetAudience}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.requiredServices.map((srv) => (
                        <span
                          key={srv}
                          className="text-[11px] font-mono text-brand-secondary bg-surface-elevated px-2.5 py-0.5 rounded border border-surface-border/50"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-brand-muted pt-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-muted" />
                        Timeline: {proj.timeline}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-brand-muted" />
                        Budget: {proj.budgetRange}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-surface-border">
                    <MatchScore
                      score={match.score}
                      size="md"
                      showBreakdownToggle
                      breakdown={match.breakdown}
                      keyStrengths={match.keyStrengths}
                    />

                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedProject(proj);
                        setProposalPitch(
                          `Hi ${proj.companyName} team, I've reviewed your brief for "${proj.title}". Based on my work with similar enterprise brands in ${proj.industry}, I'd be interested in discussing lead creative direction.`
                        );
                      }}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Express Interest
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* PROPOSAL / EXPRESS INTEREST MODAL */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="express-interest-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-lg bg-surface border border-surface-border rounded-xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider block">
                  {selectedProject.companyName}
                </span>
                <h3 id="express-interest-title" className="font-semibold text-base text-white font-sans">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="p-1 text-brand-muted hover:text-brand"
                aria-label="Close express interest dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-accent mx-auto" />
                <h4 className="font-medium text-base text-brand">
                  Interest Expressed!
                </h4>
                <p className="text-xs text-brand-secondary font-mono">
                  Your pitch was sent to {selectedProject.companyName}. Redirecting to your messaging thread...
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Your Intro & Perspective
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={proposalPitch}
                    onChange={(e) => setProposalPitch(e.target.value)}
                    className="w-full p-3 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40 leading-relaxed font-sans"
                  />
                </div>

                <div className="p-3 bg-surface-elevated border border-surface-border rounded text-[11px] text-brand-secondary font-mono">
                  Your day rate ({designer.dayRate}) and portfolio case studies will be attached automatically.
                </div>

                <div className="pt-2 border-t border-surface-border flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProject(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    Send to Executive Team
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
