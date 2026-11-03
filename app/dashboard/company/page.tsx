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
import { EditorialStar } from "@/components/ui/EditorialDecorations";
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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="company" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* GREETING & HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#E6D8CF]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#FFF9F3] text-accent border border-[#E6D8CF] shadow-xs mb-2">
                <EditorialStar size={11} className="text-accent" />
                <span>ENTERPRISE COMMAND</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-espresso">
                Welcome, {user.name.split(" ")[0]}
              </h1>
              <p className="text-xs text-muted font-mono mt-1">
                Managing: {user.companyName || "Vantage Robotics"} • Rebrand Pipeline Active
              </p>
            </div>

            <Button
              href="/start-project"
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
              className="bg-white border border-[#E6D8CF] rounded-2xl p-5 hover:border-accent/40 transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">Active Projects</span>
                <FolderKanban className="w-4 h-4 text-taupe group-hover:text-accent transition-colors" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-normal text-espresso">
                {projects.length > 0 ? projects.length : "Pipeline Active"}
              </div>
            </Link>

            <Link
              href="/dashboard/company/recommendations"
              className="bg-white border border-[#E6D8CF] rounded-2xl p-5 hover:border-accent/40 transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">Matched Talent</span>
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-normal text-espresso">
                {recommendedTalent.length > 0 ? `${recommendedTalent.length} Matched` : "57 Curated"}
              </div>
            </Link>

            <Link
              href="/dashboard/company/shortlist"
              className="bg-white border border-[#E6D8CF] rounded-2xl p-5 hover:border-accent/40 transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">Shortlisted</span>
                <Heart className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-normal text-espresso">
                {shortlistCount > 0 ? shortlistCount : "Pipeline Ready"}
              </div>
            </Link>

            <Link
              href="/dashboard/company/messages"
              className="bg-white border border-[#E6D8CF] rounded-2xl p-5 hover:border-accent/40 transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">Messages</span>
                <MessageSquare className="w-4 h-4 text-taupe group-hover:text-accent transition-colors" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-normal text-espresso">
                {unreadMsgCount > 0 ? unreadMsgCount : "0 Active"}
              </div>
            </Link>
          </div>

          {/* ACTIVE PROJECTS SECTION */}
          {activeProject && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                  Featured Active Rebranding Brief
                </h2>
                <Link
                  href="/dashboard/company/projects"
                  className="text-xs font-mono text-muted hover:text-accent flex items-center gap-1 transition-colors font-semibold"
                >
                  <span>All Projects ({projects.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-[#FFF9F3] border border-[#E6D8CF] rounded-2xl p-6 sm:p-8 hover:border-accent/30 transition-all shadow-xs">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-accent/10 text-accent border border-accent/20">
                        Status: {activeProject.status}
                      </span>
                      <span className="text-xs font-mono text-muted">
                        {activeProject.industry} Sector
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-espresso tracking-tight">
                      {activeProject.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted line-clamp-2">
                      Targeting: {activeProject.targetAudience}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-taupe" />
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
                <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                  Recommended Creative Leadership
                </h2>
                <p className="text-xs text-muted mt-0.5 font-mono">
                  Algorithmically ranked for {activeProject?.title || "your active rebrand"}
                </p>
              </div>
              <Link
                href="/dashboard/company/recommendations"
                className="text-xs font-mono text-muted hover:text-accent flex items-center gap-1 transition-colors font-semibold"
              >
                <span>View Full Ranking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedTalent.map(({ designer, score }) => (
                <div
                  key={designer.id}
                  className="bg-white border border-[#E6D8CF] rounded-2xl p-5 flex items-start justify-between gap-4 hover:border-accent/40 transition-all group shadow-2xs"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#E0CEC3]/40 text-espresso font-serif text-sm font-normal flex items-center justify-center shrink-0 border border-[#E6D8CF]">
                      {designer.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/designers/${designer.id}`}
                          className="font-serif text-base font-normal text-espresso group-hover:text-accent transition-colors truncate"
                        >
                          {designer.name}
                        </Link>
                        {designer.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted font-mono truncate">
                        {designer.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted font-mono">
                        <span>{designer.yearsExperience} yrs exp</span>
                        <span>•</span>
                        <span className="text-accent font-semibold">{designer.dayRate}</span>
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
                      className="text-xs font-mono text-muted hover:text-accent transition-colors font-semibold"
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
            <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold mb-4">
              Recent Enterprise Activity
            </h2>

            <div className="bg-white border border-[#E6D8CF] rounded-2xl p-6 divide-y divide-[#E6D8CF] shadow-2xs">
              {[
                {
                  text: "You shortlisted Elena Rostova (Principal Brand Strategist).",
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
                      <div className="w-8 h-8 rounded-full bg-[#FFF9F3] border border-[#E6D8CF] flex items-center justify-center text-accent shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-normal text-espresso">
                        {act.text}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-taupe shrink-0">
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
