"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import {
  getProjects,
  getDesigners,
  getConversations,
} from "@/lib/storage";
import { Designer, Project } from "@/types";
import { EditorialStar } from "@/components/ui/EditorialDecorations";
import {
  Eye,
  Briefcase,
  Layers,
  MessageSquare,
  ArrowRight,
  Plus,
  CheckCircle2,
} from "lucide-react";

export default function DesignerDashboardPage() {
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    const designers = getDesigners();
    // Default to Alex Morgan for designer studio view
    const current = designers[0];
    setDesigner(current);
    setProjects(getProjects());
    const convs = getConversations();
    setUnreadMsgCount(convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0));
  }, []);

  if (!designer) return null;

  const profileCompletion = 90; // 90% completed

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="designer" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#E6D8CF]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#FFF9F3] text-accent border border-[#E6D8CF] shadow-xs mb-2">
                <EditorialStar size={11} className="text-accent" />
                <span>CREATIVE DIRECTOR STUDIO</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-espresso">
                Studio Overview — {designer.name}
              </h1>
              <p className="text-xs text-muted font-mono mt-1">
                {designer.role} • {designer.dayRate} • Verified Senior Status
              </p>
            </div>

            <Button
              href="/dashboard/designer/portfolio"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Portfolio Work
            </Button>
          </div>

          {/* PROFILE COMPLETION BANNER */}
          <div className="bg-[#FFF9F3] border border-[#E6D8CF] rounded-2xl p-6 mb-10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <h3 className="font-serif text-lg font-normal text-espresso">
                  Complete your enterprise profile
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  High-completeness profiles receive 3.4x more executive discovery views.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-accent">
                {profileCompletion}% Complete
              </span>
            </div>

            <div className="w-full h-1.5 bg-[#E0CEC3]/40 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-accent transition-all duration-500 rounded-full"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-mono">
              <span className="flex items-center gap-1 text-accent font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bio & Career Tenures Added
              </span>
              <span className="flex items-center gap-1 text-accent font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 3 Rebrand Case Studies Live
              </span>
              <Link
                href="/dashboard/designer/profile"
                className="text-muted hover:text-espresso transition-colors underline"
              >
                Add 1 More Case Study (+10%)
              </Link>
            </div>
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-white border border-[#E6D8CF] rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">Portfolio Views</span>
                <Eye className="w-4 h-4 text-accent" />
              </div>
              <div className="text-3xl font-serif font-normal text-espresso">
                384
              </div>
              <div className="text-[10px] text-accent font-mono mt-1 font-semibold">+24% this week</div>
            </div>

            <Link
              href="/dashboard/designer/opportunities"
              className="bg-white border border-[#E6D8CF] rounded-2xl p-5 hover:border-accent/40 transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">Opportunities</span>
                <Briefcase className="w-4 h-4 text-accent" />
              </div>
              <div className="text-3xl font-serif font-normal text-espresso">
                {projects.length}
              </div>
              <div className="text-[10px] text-muted font-mono mt-1">High compatibility</div>
            </Link>

            <Link
              href="/dashboard/designer/portfolio"
              className="bg-white border border-[#E6D8CF] rounded-2xl p-5 hover:border-accent/40 transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">Live Projects</span>
                <Layers className="w-4 h-4 text-taupe group-hover:text-accent transition-colors" />
              </div>
              <div className="text-3xl font-serif font-normal text-espresso">
                {designer.portfolio.length}
              </div>
              <div className="text-[10px] text-muted font-mono mt-1">Published case studies</div>
            </Link>

            <Link
              href="/dashboard/designer/messages"
              className="bg-white border border-[#E6D8CF] rounded-2xl p-5 hover:border-accent/40 transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">Messages</span>
                <MessageSquare className="w-4 h-4 text-taupe group-hover:text-accent transition-colors" />
              </div>
              <div className="text-3xl font-serif font-normal text-espresso">
                {unreadMsgCount}
              </div>
              <div className="text-[10px] text-muted font-mono mt-1">Client inquiries</div>
            </Link>
          </div>

          {/* MATCHING REBRAND OPPORTUNITIES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                  Incoming Rebranding Mandates
                </h2>
                <p className="text-xs text-muted mt-0.5 font-mono">
                  Enterprise briefs matching your {designer.role} specialization
                </p>
              </div>
              <Link
                href="/dashboard/designer/opportunities"
                className="text-xs font-mono text-muted hover:text-accent flex items-center gap-1 transition-colors font-semibold"
              >
                <span>View all opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-[#E6D8CF] rounded-2xl p-5 hover:border-accent/40 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-espresso">
                        {proj.companyName}
                      </span>
                      <span className="text-xs text-taupe font-mono">•</span>
                      <span className="text-xs text-muted font-mono">
                        {proj.industry}
                      </span>
                    </div>

                    <h4 className="font-serif text-base text-espresso">
                      {proj.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted pt-1">
                      <span>Timeline: {proj.timeline}</span>
                      <span>•</span>
                      <span>Budget: {proj.budgetRange}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-accent/10 text-accent rounded-full border border-accent/20">
                      94% Match
                    </span>
                    <Button
                      href="/dashboard/designer/opportunities"
                      size="sm"
                      variant="secondary"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
