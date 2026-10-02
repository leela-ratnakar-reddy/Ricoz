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
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="designer" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-surface-border">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-1">
                CREATIVE DIRECTOR STUDIO
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                Studio Overview — {designer.name}
              </h1>
              <p className="text-xs text-brand-muted font-mono mt-1">
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
          <div className="bg-surface/80 border border-surface-border rounded-xl p-6 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <h3 className="font-medium text-sm text-brand">
                  Complete your enterprise profile
                </h3>
                <p className="text-xs text-brand-secondary mt-0.5 font-light">
                  High-completeness profiles receive 3.4x more executive discovery views.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-accent">
                {profileCompletion}% Complete
              </span>
            </div>

            <div className="w-full h-1 bg-surface-elevated rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-brand-secondary font-mono">
              <span className="flex items-center gap-1 text-accent">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bio & Career Tenures Added
              </span>
              <span className="flex items-center gap-1 text-accent">
                <CheckCircle2 className="w-3.5 h-3.5" /> 3 Rebrand Case Studies Live
              </span>
              <Link
                href="/dashboard/designer/profile"
                className="text-brand-muted hover:text-brand transition-colors underline"
              >
                Add 1 More Case Study (+10%)
              </Link>
            </div>
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-surface/80 border border-surface-border rounded-xl p-5">
              <div className="flex items-center justify-between text-brand-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Portfolio Views</span>
                <Eye className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl font-light text-brand font-mono">
                384
              </div>
              <div className="text-[10px] text-accent font-mono mt-1">+24% this week</div>
            </div>

            <Link
              href="/dashboard/designer/opportunities"
              className="bg-surface/80 border border-surface-border rounded-xl p-5 hover:border-surface-borderLight transition-all group"
            >
              <div className="flex items-center justify-between text-brand-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Opportunities</span>
                <Briefcase className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl font-light text-brand font-mono">
                {projects.length}
              </div>
              <div className="text-[10px] text-brand-muted font-mono mt-1">High compatibility</div>
            </Link>

            <Link
              href="/dashboard/designer/portfolio"
              className="bg-surface/80 border border-surface-border rounded-xl p-5 hover:border-surface-borderLight transition-all group"
            >
              <div className="flex items-center justify-between text-brand-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Live Projects</span>
                <Layers className="w-4 h-4 text-brand-muted group-hover:text-accent transition-colors" />
              </div>
              <div className="text-2xl font-light text-brand font-mono">
                {designer.portfolio.length}
              </div>
              <div className="text-[10px] text-brand-muted font-mono mt-1">Published case studies</div>
            </Link>

            <Link
              href="/dashboard/designer/messages"
              className="bg-surface/80 border border-surface-border rounded-xl p-5 hover:border-surface-borderLight transition-all group"
            >
              <div className="flex items-center justify-between text-brand-muted mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Messages</span>
                <MessageSquare className="w-4 h-4 text-brand-muted group-hover:text-accent transition-colors" />
              </div>
              <div className="text-2xl font-light text-brand font-mono">
                {unreadMsgCount}
              </div>
              <div className="text-[10px] text-brand-muted font-mono mt-1">Client inquiries</div>
            </Link>
          </div>

          {/* MATCHING REBRAND OPPORTUNITIES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
                  Incoming Rebranding Mandates
                </h2>
                <p className="text-xs text-brand-muted mt-0.5 font-mono">
                  Enterprise briefs matching your {designer.role} specialization
                </p>
              </div>
              <Link
                href="/dashboard/designer/opportunities"
                className="text-xs font-mono text-brand-secondary hover:text-accent flex items-center gap-1 transition-colors"
              >
                <span>View all opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="bg-surface/80 border border-surface-border rounded-xl p-5 hover:border-accent/40 transition-all shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-brand">
                        {proj.companyName}
                      </span>
                      <span className="text-xs text-surface-border font-mono">•</span>
                      <span className="text-xs text-brand-muted font-mono">
                        {proj.industry}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm sm:text-base text-white font-sans">
                      {proj.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-brand-muted pt-1">
                      <span>Timeline: {proj.timeline}</span>
                      <span>•</span>
                      <span>Budget: {proj.budgetRange}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-medium px-2.5 py-1 bg-accent/10 text-accent rounded border border-accent/20">
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
