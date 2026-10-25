"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Layers,
  ArrowRight,
  Shield,
  Clock,
  Lock
} from "lucide-react";
import { TalentAvatar } from "@/components/ui/TalentAvatar";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export const PlatformPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"talent" | "shortlist" | "workflow">("talent");

  const tabList = [
    { id: "talent" as const, label: "01 Talent Discovery", title: "Talent Discovery & Dossiers" },
    { id: "shortlist" as const, label: "02 Shortlist & Match", title: "Intelligent Squad Shortlisting" },
    { id: "workflow" as const, label: "03 Project Workflow", title: "Milestone & Sprint Governance" },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FBF6F0] border-b border-[#E6D8CF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="mb-3">
            <EditorialBadge variant="burgundy">
              PLATFORM WORKSPACE PREVIEW
            </EditorialBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
            Everything You Need To Find And Manage Creative Talent.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#76665F] leading-relaxed font-sans font-normal">
            From discovering senior creative specialists to shortlisting talent and executing projects under escrow, RICOZ unites the entire mandate lifecycle into one refined experience.
          </p>
        </div>

        {/* FUNCTIONAL ACCESSIBLE TABS */}
        <div className="flex justify-center mb-8" role="tablist" aria-label="Platform preview modes">
          <div className="inline-flex p-1.5 rounded-full bg-[#FFF9F3] border border-[#E6D8CF] shadow-subtle">
            {tabList.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-sans font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719] ${
                    isSelected
                      ? "bg-[#541719] text-[#FFF9F3] shadow-burgundy font-bold"
                      : "text-[#76665F] hover:text-[#38241F]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* LUXURY EDITORIAL PREVIEW FRAME */}
        <div className="relative mx-auto max-w-6xl rounded-3xl border border-[#E6D8CF] bg-white p-2 sm:p-4 shadow-card">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6D8CF] bg-[#FFF9F3] rounded-t-2xl text-[#76665F] text-xs font-sans">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#541719]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#C7A99A] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#E0CEC3] inline-block" />
              <span className="ml-2 text-[#76665F] font-mono text-[11px] hidden sm:inline">workspace.ricoz.com/mandates</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white border border-[#E6D8CF] text-[#38241F] text-[11px] font-medium shadow-subtle">
                Active Mandate: Autonomous Cloud Series B
              </span>
            </div>
          </div>

          {/* Desktop App Interior */}
          <div className="bg-[#FBF6F0] rounded-b-2xl overflow-hidden text-[#38241F] p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6D8CF]">
              <div>
                <div className="flex items-center gap-2 text-xs font-sans font-bold text-[#541719] uppercase tracking-wider mb-1">
                  <EditorialStar size={10} color="#541719" />
                  RICOZ WORKSPACE // {activeTab.toUpperCase()}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#38241F] tracking-tight">
                  {activeTab === "talent" && "Autonomous Cloud // Creative Specialist Discovery"}
                  {activeTab === "shortlist" && "Squad Assembly & Multi-Dimensional Match"}
                  {activeTab === "workflow" && "Milestone Roadmap & Escrow Governance"}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/start-project"
                  className="px-5 py-2.5 rounded-full bg-[#541719] hover:bg-[#3E1012] text-[#FFF9F3] font-sans font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-burgundy"
                >
                  <span>Commission Mandate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* TAB PANEL 1: TALENT DISCOVERY */}
            {activeTab === "talent" && (
              <div
                id="panel-talent"
                role="tabpanel"
                aria-labelledby="tab-talent"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 animate-in fade-in duration-200"
              >
                {/* Left: Filter Controls */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-[#E6D8CF] text-xs space-y-3 shadow-subtle">
                    <div className="font-bold text-[#76665F] uppercase tracking-wider font-sans">
                      Discovery Filters
                    </div>
                    <div className="space-y-1.5">
                      <div className="p-2.5 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] text-[#38241F] font-medium flex justify-between">
                        <span>Discipline</span>
                        <span className="text-[#541719] font-semibold">Brand Strategist</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] text-[#38241F] font-medium flex justify-between">
                        <span>Min. Experience</span>
                        <span className="text-[#76665F]">10+ Years</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] text-[#38241F] font-medium flex justify-between">
                        <span>Availability</span>
                        <span className="text-[#541719] font-semibold">Immediate</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#E6D8CF] text-xs space-y-2 shadow-subtle">
                    <div className="font-bold text-[#76665F] uppercase tracking-wider font-sans">
                      Curated Talent Pool
                    </div>
                    <div className="text-[#76665F] leading-relaxed">
                      57 verified studio principals across 19 creative disciplines. Every dossier includes verified case studies.
                    </div>
                  </div>
                </div>

                {/* Right: Candidate Dossiers */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Elena Rostova */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E6D8CF] hover:border-[#C7A99A] shadow-subtle transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6D8CF]">
                      <div className="flex items-center gap-3.5">
                        <TalentAvatar
                          src="/images/talent/elena-rostova.jpg"
                          alt="Elena Rostova"
                          initials="ER"
                          size={48}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-[#38241F] text-base">Elena Rostova</span>
                            <span className="text-[11px] font-sans text-[#76665F]">London, UK</span>
                          </div>
                          <div className="text-xs text-[#541719] font-medium font-sans">
                            Principal Brand Strategist • Ex-Pentagram / Wolff Olins
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-[#38241F]">$165/hr</div>
                          <div className="text-[10px] text-[#541719] font-sans font-medium">Available Now</div>
                        </div>
                        <span className="px-3 py-1.5 rounded-full bg-[#541719]/10 text-[#541719] border border-[#541719]/20 text-xs font-bold font-sans">
                          98% Match
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#76665F] mt-3 leading-relaxed font-sans">
                      Specializes in category-defining positioning and pre-IPO narratives for enterprise tech. Spearheaded the Synthetix AI global rebranding.
                    </p>
                  </div>

                  {/* Dominic Sterling */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E6D8CF] hover:border-[#C7A99A] shadow-subtle transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6D8CF]">
                      <div className="flex items-center gap-3.5">
                        <TalentAvatar
                          src="/images/talent/dominic-sterling.jpg"
                          alt="Dominic Sterling"
                          initials="DS"
                          size={48}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-[#38241F] text-base">Dominic Sterling</span>
                            <span className="text-[11px] font-sans text-[#76665F]">Zurich, CH</span>
                          </div>
                          <div className="text-xs text-[#541719] font-medium font-sans">
                            Design Systems Architect • Ex-Stripe / Meta
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-[#38241F]">$160/hr</div>
                          <div className="text-[10px] text-[#541719] font-sans font-medium">Available</div>
                        </div>
                        <span className="px-3 py-1.5 rounded-full bg-[#541719]/10 text-[#541719] border border-[#541719]/20 text-xs font-bold font-sans">
                          94% Match
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#76665F] mt-3 leading-relaxed font-sans">
                      Architected multi-brand token frameworks and component architecture across iOS, Web, and desktop for global FinTech operations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB PANEL 2: SHORTLIST & MATCH */}
            {activeTab === "shortlist" && (
              <div
                id="panel-shortlist"
                role="tabpanel"
                aria-labelledby="tab-shortlist"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 animate-in fade-in duration-200"
              >
                {/* Left: Squad Assembly Tray */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-[#E6D8CF] shadow-subtle">
                    <div className="text-xs font-bold text-[#76665F] uppercase tracking-wider mb-3 font-sans">
                      Selected Squad Pod (3/4)
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#541719]" />
                          <span className="text-xs font-bold text-[#38241F]">Elena Rostova</span>
                        </div>
                        <span className="text-[10px] font-sans text-[#541719] font-semibold">Strategy</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#541719]" />
                          <span className="text-xs font-bold text-[#38241F]">Julian Mercer</span>
                        </div>
                        <span className="text-[10px] font-sans text-[#541719] font-semibold">Creative Dir</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#541719]" />
                          <span className="text-xs font-bold text-[#38241F]">Dominic Sterling</span>
                        </div>
                        <span className="text-[10px] font-sans text-[#541719] font-semibold">Tokens</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Multi-Dimensional Match Engine Breakdown */}
                <div className="lg:col-span-8 p-5 rounded-xl bg-white border border-[#E6D8CF] space-y-4 shadow-subtle">
                  <div className="text-xs font-bold text-[#76665F] uppercase tracking-wider font-sans">
                    Match Rationale & Compatibility Audit
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF]">
                      <div className="text-[#76665F] mb-1">Industry Sector Fit</div>
                      <div className="font-serif font-bold text-[#38241F] text-sm">Enterprise DeepTech</div>
                      <div className="text-[10px] text-[#541719] font-semibold mt-1">99% Alignment</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF]">
                      <div className="text-[#76665F] mb-1">Aesthetic Philosophy</div>
                      <div className="font-serif font-bold text-[#38241F] text-sm">Minimal / Swiss High-Craft</div>
                      <div className="text-[10px] text-[#541719] font-semibold mt-1">96% Alignment</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF]">
                      <div className="text-[#76665F] mb-1">Enterprise Scale</div>
                      <div className="font-serif font-bold text-[#38241F] text-sm">Pre-IPO Series B</div>
                      <div className="text-[10px] text-[#541719] font-semibold mt-1">98% Alignment</div>
                    </div>
                  </div>
                  <p className="text-xs text-[#76665F] leading-relaxed pt-2 font-sans">
                    Candidate Elena Rostova has successfully directed 3 comparable Series B-to-IPO transitions in autonomous systems, minimizing onboarding ramp-up to zero days.
                  </p>
                </div>
              </div>
            )}

            {/* TAB PANEL 3: PROJECT WORKFLOW & GOVERNANCE */}
            {activeTab === "workflow" && (
              <div
                id="panel-workflow"
                role="tabpanel"
                aria-labelledby="tab-workflow"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 animate-in fade-in duration-200"
              >
                {/* Left: Governance Status */}
                <div className="lg:col-span-4 p-4 rounded-xl bg-white border border-[#E6D8CF] text-xs space-y-3 shadow-subtle">
                  <div className="font-bold text-[#76665F] uppercase tracking-wider font-sans">
                    Engagement Safeguards
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] flex items-center gap-2 text-[#38241F]">
                      <Shield className="w-4 h-4 text-[#541719] shrink-0" />
                      <span>Mutual NDA: Bilateral Executed</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] flex items-center gap-2 text-[#38241F]">
                      <Clock className="w-4 h-4 text-[#C7A99A] shrink-0" />
                      <span>Milestone Sign-Off: Client Controlled</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] flex items-center gap-2 text-[#38241F]">
                      <Lock className="w-4 h-4 text-[#541719] shrink-0" />
                      <span>100% IP Assignment: Guaranteed</span>
                    </div>
                  </div>
                </div>

                {/* Right: Milestone Sprints */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="p-3.5 rounded-xl bg-white border border-[#E6D8CF] flex items-center justify-between text-xs shadow-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#541719] text-[#FFF9F3] font-serif font-bold flex items-center justify-center text-[11px]">
                        01
                      </div>
                      <div>
                        <div className="font-serif font-bold text-[#38241F]">Sprint 01: Positioning & Narrative Architecture</div>
                        <div className="text-[11px] text-[#76665F]">Elena Rostova • Executive Dossier</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans font-bold text-[#541719]">Approved</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#541719]/40 flex items-center justify-between text-xs shadow-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#541719] text-[#FFF9F3] font-serif font-bold flex items-center justify-center text-[11px]">
                        02
                      </div>
                      <div>
                        <div className="font-serif font-bold text-[#38241F]">Sprint 02: Core Logomark & Typographic System</div>
                        <div className="text-[11px] text-[#76665F]">Julian Mercer • Vector Standards</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans font-bold text-[#541719] animate-pulse">In Progress</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#E6D8CF] flex items-center justify-between text-xs opacity-75 shadow-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E0CEC3] text-[#38241F] font-serif font-bold flex items-center justify-center text-[11px]">
                        03
                      </div>
                      <div>
                        <div className="font-serif font-bold text-[#76665F]">Sprint 03: Design Tokens & Token Architecture</div>
                        <div className="text-[11px] text-[#9E8E87]">Dominic Sterling • Figma Sync</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans text-[#9E8E87]">Queued</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};