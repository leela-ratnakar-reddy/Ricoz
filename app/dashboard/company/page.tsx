"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import { MatchScore } from "@/components/MatchScore";
import { Badge } from "@/components/Badge";
import {
  getProjects,
  getDesigners,
  getShortlist,
  getConversations,
  DEFAULT_USER,
} from "@/lib/storage";
import { rankDesignersForProject } from "@/lib/matching";
import { Project, Designer } from "@/types";
import {
  FolderKanban,
  Sparkles,
  Heart,
  MessageSquare,
  ArrowRight,
  Plus,
  Clock,
  Briefcase,
  ShieldCheck,
} from "lucide-react";

export default function CompanyDashboardPage() {
  const [user, setUser] = useState(DEFAULT_USER);
  const [projects, setProjects] = useState<Project[]>([]);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [recommendedTalent, setRecommendedTalent] = useState<
    { designer: Designer; score: number }[]
  >([]);

  useEffect(() => {
    const projs = getProjects();
    const allDesigners = getDesigners();
    setProjects(projs);
    setShortlistCount(getShortlist().length);
    const convs = getConversations();
    setUnreadMsgCount(convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0));

    // Calculate top recommendations based on the first active project
    if (projs.length > 0) {
      const ranked = rankDesignersForProject(projs[0], allDesigners);
      setRecommendedTalent(ranked.slice(0, 4));
    } else {
      setRecommendedTalent(
        allDesigners.slice(0, 4).map((d) => ({
          designer: d,
          score: d.matchPercentage || 92,
        }))
      );
    }
  }, []);

  const activeProject = projects[0];

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="company" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* GREETING & HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-surface-border">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-1">
                ENTERPRISE COMMAND
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                Welcome, {user.name.split(" ")[0]}
              </h1>
              <p className="text-xs text-brand-muted font-mono mt-1">
                Managing: {user.companyName || "Vantage Robotics"} • Rebrand Pipeline Active
              </p>
            </div>

            <Button
              href="/dashboard/company/projects/new"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              Create New Brief
            </Button>
          </div>

          {/* SUMMARY METRIC CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Link
              href="/dashboard/company/projects"
              className="bg-surface/80 border border-surface-border rounded-xl p-5 hover:border-surface-borderLight transition-all group"
            >
              <div className="flex items-center justify-between text-brand-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Active Projects</span>
                <FolderKanban className="w-4 h-4 text-brand-muted group-hover:text-accent transition-colors" />
              </div>
              <div className="text-2xl font-light text-brand font-mono">
                {projects.length}
              </div>
            </Link>

            <Link
              href="/dashboard/company/recommendations"
              className="bg-surface/80 border border-surface-border rounded-xl p-5 hover:border-surface-borderLight transition-all group"
            >
              <div className="flex items-center justify-between text-brand-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Matched Talent</span>
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl font-light text-brand font-mono">
                {recommendedTalent.length > 0 ? "12" : "0"}
              </div>
            </Link>

            <Link
              href="/dashboard/company/shortlist"
              className="bg-surface/80 border border-surface-border rounded-xl p-5 hover:border-surface-borderLight transition-all group"
            >
              <div className="flex items-center justify-between text-brand-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Shortlisted</span>
                <Heart className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl font-light text-brand font-mono">
                {shortlistCount}
              </div>
            </Link>

            <Link
              href="/dashboard/company/messages"
              className="bg-surface/80 border border-surface-border rounded-xl p-5 hover:border-surface-borderLight transition-all group"
            >
              <div className="flex items-center justify-between text-brand-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Messages</span>
                <MessageSquare className="w-4 h-4 text-brand-muted group-hover:text-accent transition-colors" />
              </div>
              <div className="text-2xl font-light text-brand font-mono">
                {unreadMsgCount}
              </div>
            </Link>
          </div>

          {/* ACTIVE PROJECTS SECTION */}
          {activeProject && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
                  Featured Active Rebranding Brief
                </h2>
                <Link
                  href="/dashboard/company/projects"
                  className="text-xs font-mono text-brand-secondary hover:text-accent flex items-center gap-1 transition-colors"
                >
                  <span>All Projects ({projects.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-surface/80 border border-surface-border rounded-xl p-6 sm:p-8 hover:border-accent/30 transition-all shadow-subtle">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-accent/10 text-accent border border-accent/20">
                        Status: {activeProject.status}
                      </span>
                      <span className="text-xs font-mono text-brand-muted">
                        {activeProject.industry} Sector
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                      {activeProject.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-brand-secondary line-clamp-2">
                      Targeting: {activeProject.targetAudience}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-brand-secondary pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-muted" />
                        Timeline: {activeProject.timeline}
                      </span>
                      <span>•</span>
                      <span>Budget: {activeProject.budgetRange}</span>
                      <span>•</span>
                      <span className="text-accent font-semibold">
                        {activeProject.recommendedCount || 8} Recommended Matches
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <Button
                      href={`/dashboard/company/projects/${activeProject.id}`}
                      size="md"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      View Project Brief
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECOMMENDED TALENT SECTION */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
                  Recommended Creative Leadership
                </h2>
                <p className="text-xs text-brand-muted mt-0.5 font-mono">
                  Algorithmically ranked for {activeProject?.title || "your active rebrand"}
                </p>
              </div>
              <Link
                href="/dashboard/company/recommendations"
                className="text-xs font-mono text-brand-secondary hover:text-accent flex items-center gap-1 transition-colors"
              >
                <span>View Full Ranking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedTalent.map(({ designer, score }) => (
                <div
                  key={designer.id}
                  className="bg-surface/80 border border-surface-border rounded-xl p-5 flex items-start justify-between gap-4 hover:border-accent/40 transition-all group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-surface-elevated text-brand font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-surface-border">
                      {designer.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/designers/${designer.id}`}
                          className="font-medium text-sm text-brand group-hover:text-accent transition-colors truncate"
                        >
                          {designer.name}
                        </Link>
                        {designer.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-brand-secondary font-mono truncate">
                        {designer.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-brand-muted font-mono">
                        <span>{designer.yearsExperience} yrs exp</span>
                        <span>•</span>
                        <span className="text-accent">{designer.dayRate}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {designer.skills.slice(0, 2).map((s) => (
                          <Badge key={s} variant="subtle" size="sm">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <MatchScore score={score} size="sm" />
                    <Link
                      href={`/designers/${designer.id}`}
                      className="text-xs font-mono text-brand-secondary hover:text-accent transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY TIMELINE */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-medium mb-4">
              Recent Enterprise Activity
            </h2>

            <div className="bg-surface/80 border border-surface-border rounded-xl p-6 divide-y divide-surface-border">
              {[
                {
                  text: "You shortlisted Emma Carter (Brand Identity Lead).",
                  time: "Today, 11:20 AM",
                  icon: Heart,
                },
                {
                  text: "You viewed 3 Creative Director profiles for Vantage Robotics.",
                  time: "Yesterday, 04:15 PM",
                  icon: Briefcase,
                },
                {
                  text: "Your project brief 'Global Industrial Rebranding & Visual Architecture' was finalized.",
                  time: "Sep 29, 02:40 PM",
                  icon: FolderKanban,
                },
                {
                  text: "Algorithmic match calculation updated 12 candidate profiles.",
                  time: "Sep 28, 09:10 AM",
                  icon: Sparkles,
                },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-accent shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-normal text-brand-secondary">
                        {act.text}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-brand-muted shrink-0">
                      {act.time}
                    </span>
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
