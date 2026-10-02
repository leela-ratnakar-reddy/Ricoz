"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { getProjects } from "@/lib/storage";
import { Project } from "@/types";
import { Plus, FolderKanban, ArrowRight, Sparkles } from "lucide-react";

export default function CompanyProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(getProjects());
    const onUpdate = () => setProjects(getProjects());
    window.addEventListener("brandroom_projects_updated", onUpdate);
    return () => window.removeEventListener("brandroom_projects_updated", onUpdate);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="company" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-surface-border">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-1">
                PROJECT PORTFOLIO
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                Rebranding Projects
              </h1>
              <p className="text-xs text-brand-muted font-mono mt-1">
                Active mandates and enterprise talent matching pipelines
              </p>
            </div>

            <Button
              href="/dashboard/company/projects/new"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              New Project Brief
            </Button>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="w-6 h-6 text-accent" />}
              title="No active rebranding briefs found"
              description="Create a structured rebranding brief to define your timeline, budget, and required senior disciplines."
              actionLabel="Create your first brief"
              actionHref="/dashboard/company/projects/new"
            />
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-surface/80 border border-surface-border rounded-xl p-6 sm:p-8 hover:border-accent/40 transition-all shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-accent/10 text-accent border border-accent/20">
                        {proj.status}
                      </span>
                      <span className="text-xs font-mono text-brand-secondary">
                        {proj.industry}
                      </span>
                      <span className="text-xs text-surface-border">•</span>
                      <span className="text-xs font-mono text-brand-muted">
                        Created {proj.createdAt}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/company/projects/${proj.id}`}
                      className="font-medium text-lg sm:text-xl text-brand group-hover:text-accent transition-colors block"
                    >
                      {proj.title}
                    </Link>

                    <p className="text-xs sm:text-sm text-brand-secondary line-clamp-2 font-light">
                      {proj.targetAudience}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-brand-muted pt-1">
                      <span>Timeline: {proj.timeline}</span>
                      <span>•</span>
                      <span>Budget: {proj.budgetRange}</span>
                      <span>•</span>
                      <span className="text-accent font-medium flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {proj.recommendedCount || 8} Matches
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <Button
                      href={`/dashboard/company/projects/${proj.id}`}
                      size="sm"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      View Brief & Matches
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
