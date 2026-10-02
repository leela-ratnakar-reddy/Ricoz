"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DesignerCard } from "@/components/DesignerCard";
import { EmptyState } from "@/components/EmptyState";
import { getProjects, getDesigners } from "@/lib/storage";
import { rankDesignersForProject } from "@/lib/matching";
import { Project, MatchResult } from "@/types";
import { ArrowRight, FolderKanban } from "lucide-react";

export default function RecommendationsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [matches, setMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    const projs = getProjects();
    const designers = getDesigners();
    setProjects(projs);

    if (projs.length > 0) {
      setSelectedProjectId(projs[0].id);
      const ranked = rankDesignersForProject(projs[0], designers);
      setMatches(ranked);
    }
  }, []);

  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const p = projects.find((x) => x.id === projId);
    if (p) {
      const designers = getDesigners();
      setMatches(rankDesignersForProject(p, designers));
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="company" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-surface-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium">
                  TALENT INTELLIGENCE
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans mt-1">
                Matched Creative Talent
              </h1>
              <p className="text-xs text-brand-muted font-mono mt-1">
                Algorithmic ranking based on your active rebranding parameters
              </p>
            </div>

            {/* PROJECT SELECTOR */}
            {projects.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-brand-muted">Project:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="bg-surface-elevated border border-surface-border rounded-md px-3 py-1.5 text-xs text-brand focus:outline-none focus:border-accent/40 font-mono"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title.slice(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {currentProject && (
            <div className="bg-surface/80 border border-surface-border rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-brand-muted uppercase">Evaluating for:</span>
                <span className="font-medium text-brand">{currentProject.title}</span>
                <span className="text-brand-muted font-mono">({currentProject.industry})</span>
              </div>
              <Link
                href={`/dashboard/company/projects/${currentProject.id}`}
                className="text-xs font-mono text-brand-secondary hover:text-accent flex items-center gap-1 shrink-0 transition-colors"
              >
                <span>Edit Brief Parameters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {matches.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="w-6 h-6 text-accent" />}
              title="No active project to compute matches"
              description="Create a rebranding brief to receive deterministic compatibility rankings."
              actionLabel="Create brief"
              actionHref="/dashboard/company/projects/new"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {matches.map(({ designer, score }) => (
                <DesignerCard
                  key={designer.id}
                  designer={designer}
                  matchScoreOverride={score}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
