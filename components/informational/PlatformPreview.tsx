"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  CheckCircle,
  Bookmark,
  Users,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Shield,
  Star
} from "lucide-react";

export const PlatformPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"talent" | "shortlist" | "workflow">("talent");

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase mb-4">
            <Layers className="w-3.5 h-3.5 text-red-600" />
            <span>PLATFORM PREVIEW</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Everything You Need To Find And Manage Creative Talent.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            From discovering the right creative professionals to shortlisting talent and moving projects forward, RICOZ brings the process into one streamlined experience.
          </p>
        </div>

        {/* INTERACTIVE PREVIEW TABS */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("talent")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "talent"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              01 Talent Discovery
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shortlist")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "shortlist"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              02 Shortlist & Match
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("workflow")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "workflow"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              03 Project Workflow
            </button>
          </div>
        </div>

        {/* LARGE POLISHED PRODUCT MOCKUP CONTAINER */}
        <div className="relative mx-auto max-w-6xl rounded-3xl border border-slate-200/90 bg-slate-900 p-2 sm:p-4 shadow-2xl shadow-slate-300/50">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-slate-400 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-slate-400 font-sans hidden sm:inline">ricoz.com/talent/app</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-sans">
                Active Mandate: Enterprise Series B
              </span>
            </div>
          </div>

          {/* Desktop App Interior */}
          <div className="bg-slate-950 rounded-2xl overflow-hidden text-slate-100 p-4 sm:p-6 lg:p-8">
            {/* Top Workspace Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-wider mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  RICOZ WORKSPACE // CREATIVE SQUAD FORMATION
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Autonomous Cloud Global Rebrand
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  3 of 4 Specialists Shortlisted
                </span>
                <Link
                  href="/start-project"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/30"
                >
                  <span>Launch Mandate</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 3-Column Product Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              {/* Left Column: Project Requirements & Disciplines (3 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Required Disciplines
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-lg bg-slate-800/90 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-white">Brand Strategist</div>
                          <div className="text-[10px] text-slate-400">Elena Rostova matched</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        98%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/90 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-white">Creative Director</div>
                          <div className="text-[10px] text-slate-400">Julian Mercer matched</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        96%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/90 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-white">Design Systems Lead</div>
                          <div className="text-[10px] text-slate-400">Dominic Sterling matched</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        94%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60 border-dashed flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-400">
                          +
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-300">Motion Designer</div>
                          <div className="text-[10px] text-slate-500">Evaluating 3 candidates</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-slate-400 uppercase tracking-wider">
                    Project Parameters
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                    <span>Estimated Timeline</span>
                    <span className="font-mono text-white">8-10 Weeks</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                    <span>Target Budget Tier</span>
                    <span className="font-mono text-white">$65k - $95k</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Governance Standard</span>
                    <span className="text-emerald-400 font-semibold">Mutual NDA Active</span>
                  </div>
                </div>
              </div>

              {/* Center & Right Column: Featured Candidate Evaluation Cards (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Candidate Card 1 */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700">
                        <Image
                          src="/images/talent/marcus-vance.jpg"
                          alt="Elena Rostova"
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">Elena Rostova</span>
                          <span className="text-[11px] font-mono text-slate-400">London, UK</span>
                        </div>
                        <div className="text-xs text-red-400 font-medium">
                          Principal Brand Strategist • Ex-Pentagram / Wolff Olins
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white">$165/hr</div>
                        <div className="text-[10px] text-emerald-400">Available Now</div>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                        98% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Proven track record architecting category-defining positioning and pre-IPO narratives for enterprise tech. Spearheaded the Synthetix AI rebrand and multi-market visual positioning.
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/60 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        Brand Architecture
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        Enterprise SaaS
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        12 yrs exp
                      </span>
                    </div>
                    <Link
                      href="/talent"
                      className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1 text-xs"
                    >
                      <span>View Full Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Candidate Card 2 */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700">
                        <Image
                          src="/images/talent/dominic-sterling.jpg"
                          alt="Dominic Sterling"
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">Dominic Sterling</span>
                          <span className="text-[11px] font-mono text-slate-400">Zurich, CH</span>
                        </div>
                        <div className="text-xs text-red-400 font-medium">
                          Design Systems Lead • Ex-Stripe / Meta
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white">$160/hr</div>
                        <div className="text-[10px] text-emerald-400">Available</div>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                        94% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Built multi-brand token frameworks and component architecture across iOS, Web, and desktop for global FinTech operations. Author of universal design token documentation.
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/60 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        Multi-Brand Tokens
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        Figma Variables
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        11 yrs exp
                      </span>
                    </div>
                    <Link
                      href="/talent"
                      className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1 text-xs"
                    >
                      <span>View Full Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
