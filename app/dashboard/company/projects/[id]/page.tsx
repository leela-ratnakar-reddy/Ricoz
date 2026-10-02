"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { MatchScore } from "@/components/MatchScore";
import { EmptyState } from "@/components/EmptyState";
import {
  getProjectById,
  getDesigners,
  isShortlisted,
  toggleShortlist,
} from "@/lib/storage";
import { rankDesignersForProject } from "@/lib/matching";
import { Project, MatchResult } from "@/types";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [rankedMatches, setRankedMatches] = useState<MatchResult[]>([]);
  const [shortlistMap, setShortlistMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (projectId) {
      const p = getProjectById(projectId);
      if (p) {
        setProject(p);
        const designers = getDesigners();
        const results = rankDesignersForProject(p, designers);
        setRankedMatches(results);

        const initialMap: Record<string, boolean> = {};
        designers.forEach((d) => {
          initialMap[d.id] = isShortlisted(d.id);
        });
        setShortlistMap(initialMap);
      }
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-brand">
        <Navbar />
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
          <DashboardSidebar role="company" />
          <main className="flex-1 p-10">
            <EmptyState
              title="Project brief not found"
              description="This project brief may have been deleted or does not exist."
              actionLabel="Return to projects"
              actionHref="/dashboard/company/projects"
            />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const handleToggleShortlist = (designerId: string) => {
    const nextState = toggleShortlist(designerId);
    setShortlistMap((prev) => ({ ...prev, [designerId]: nextState }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="company" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* BREADCRUMB */}
          <div className="mb-6">
            <Link
              href="/dashboard/company/projects"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-muted hover:text-brand transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all projects</span>
            </Link>
          </div>

          {/* PROJECT HEADER CARD */}
          <div className="bg-surface/80 border border-surface-border rounded-xl p-6 sm:p-8 mb-10 shadow-subtle">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-surface-border">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-accent/10 text-accent border border-accent/20">
                    Status: {project.status}
                  </span>
                  <span className="text-xs font-mono text-brand-secondary">
                    {project.industry} Sector
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                  {project.title}
                </h1>

                <p className="text-sm text-brand-secondary font-mono">
                  {project.companyName} • Created on {project.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  href="/dashboard/company/messages"
                  variant="outline"
                  size="md"
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Messages
                </Button>
              </div>
            </div>

            {/* METRICS & PARAMETERS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 text-xs">
              <div>
                <span className="font-mono uppercase text-brand-muted block mb-1">
                  Budget Parameters
                </span>
                <span className="font-mono font-medium text-brand text-sm">
                  {project.budgetTier} ({project.budgetRange})
                </span>
              </div>

              <div>
                <span className="font-mono uppercase text-brand-muted block mb-1">
                  Timeline
                </span>
                <span className="font-mono font-medium text-brand text-sm">
                  {project.timeline}
                </span>
              </div>

              <div>
                <span className="font-mono uppercase text-brand-muted block mb-1">
                  Start Date
                </span>
                <span className="font-mono font-medium text-brand text-sm">
                  {project.startDate}
                </span>
              </div>

              <div>
                <span className="font-mono uppercase text-brand-muted block mb-1">
                  Availability Rule
                </span>
                <span className="font-mono font-medium text-brand text-sm">
                  {project.availabilityRequirement}
                </span>
              </div>
            </div>

            {/* REQUIREMENTS & PERSONALITY CHIPS */}
            <div className="mt-8 pt-6 border-t border-surface-border space-y-4">
              <div>
                <span className="text-xs font-mono uppercase text-brand-muted font-medium block mb-2">
                  Target Audience
                </span>
                <p className="text-xs text-brand-secondary leading-relaxed font-sans">
                  {project.targetAudience}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-mono uppercase text-brand-muted font-medium block mb-2">
                    Required Disciplines
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.requiredServices.map((srv) => (
                      <span
                        key={srv}
                        className="bg-surface-elevated text-brand border border-surface-border px-2.5 py-1 rounded text-xs font-mono font-medium"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono uppercase text-brand-muted font-medium block mb-2">
                    Brand Personality Attributes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.brandPersonality.map((pers) => (
                      <Badge key={pers} variant="neutral" size="sm">
                        {pers}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDED CREATIVE TALENT SECTION */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest text-accent font-medium">
                    MATCH ENGINE
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white font-sans mt-1">
                  Recommended Creative Talent
                </h2>
                <p className="text-xs text-brand-muted mt-0.5 font-mono">
                  Ranked by sector mastery, senior experience, stylistic synergy, and budget tier.
                </p>
              </div>

              <span className="text-xs font-mono text-brand-muted hidden sm:inline">
                {rankedMatches.length} Evaluated Candidates
              </span>
            </div>

            <div className="space-y-4">
              {rankedMatches.slice(0, 8).map(({ designer, score, breakdown, keyStrengths }) => {
                const isSaved = shortlistMap[designer.id] || false;

                return (
                  <div
                    key={designer.id}
                    className="bg-surface/80 border border-surface-border rounded-xl p-6 hover:border-accent/40 transition-all shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Left: Designer Monogram & Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-14 h-14 rounded-full bg-surface-elevated text-brand font-mono text-base font-bold flex items-center justify-center shrink-0 border border-surface-border">
                        {designer.initials}
                      </div>

                      <div className="min-w-0 space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/designers/${designer.id}`}
                            className="font-medium text-base text-brand hover:text-accent transition-colors"
                          >
                            {designer.name}
                          </Link>
                          {designer.verified && (
                            <span title="Vetted Senior Lead">
                              <ShieldCheck className="w-4 h-4 text-accent" />
                            </span>
                          )}
                          <span className="text-xs text-surface-border">•</span>
                          <span className="text-xs text-brand-muted font-mono">
                            {designer.location}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-brand-secondary">
                          {designer.role} —{" "}
                          <span className="text-brand-muted font-normal font-mono">
                            {designer.yearsExperience} yrs experience
                          </span>
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {designer.skills.slice(0, 3).map((s) => (
                            <Badge key={s} variant="subtle" size="sm">
                              {s}
                            </Badge>
                          ))}
                        </div>

                        {/* Match Strengths list */}
                        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-brand-secondary">
                          {keyStrengths.map((ks, i) => (
                            <span key={i} className="flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                              <span>{ks}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Match Score Breakdown & CTAs */}
                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-surface-border">
                      <div className="flex flex-col items-start md:items-end">
                        <MatchScore
                          score={score}
                          size="md"
                          showBreakdownToggle
                          breakdown={breakdown}
                          keyStrengths={keyStrengths}
                        />
                        <span className="text-[10px] font-mono text-brand-muted mt-1">
                          Click for breakdown
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleShortlist(designer.id)}
                          className={`p-2 rounded border transition-colors ${
                            isSaved
                              ? "bg-accent/10 border-accent/40 text-accent"
                              : "bg-surface-elevated border-surface-border text-brand-muted hover:text-brand"
                          }`}
                          title={isSaved ? "Shortlisted" : "Add to Shortlist"}
                        >
                          <Heart
                            className={`w-4 h-4 ${isSaved ? "fill-accent text-accent" : ""}`}
                          />
                        </button>

                        <Button
                          href={`/designers/${designer.id}`}
                          variant="secondary"
                          size="sm"
                        >
                          Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
