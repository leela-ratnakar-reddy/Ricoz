"use client";

import React from "react";
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Scale
} from "lucide-react";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export const TrustValueSection: React.FC = () => {
  const pillars = [
    {
      label: "Creative Talent",
      detail: "Curated senior practitioners across 19 disciplines with documented studio backgrounds.",
      icon: Users,
    },
    {
      label: "Project Focused",
      detail: "Objective matching tied to concrete deliverables and business objectives.",
      icon: Layers,
    },
    {
      label: "Centralized Workflow",
      detail: "Unified from initial scoping and candidate review to sprint milestones.",
      icon: Clock,
    },
    {
      label: "Built For Modern Teams",
      detail: "Transparent hourly rate benchmarks and clear milestone review intervals.",
      icon: Lock,
    },
  ];

  const safeguards = [
    {
      title: "Standardized Mutual NDAs",
      status: "Available by Agreement",
      description:
        "Bilateral non-disclosure protection is facilitated prior to confidential brief sharing. Standard template agreements ensure intellectual property and trade secrets remain strictly confidential.",
      icon: Lock,
      badge: "Standard Bilateral Terms",
    },
    {
      title: "Milestone-Based Fund Releases",
      status: "Sprint Review Structure",
      description:
        "Projects proceed in agreed sprint phases (e.g., Discovery → Concept → Delivery). Payment milestones are confirmed upon client review and sign-off, preventing unexpected budget drift.",
      icon: Scale,
      badge: "Phased Deliverable Approvals",
    },
    {
      title: "100% Intellectual Property Assignment",
      status: "Full Client Transfer",
      description:
        "Upon completion of milestones and final invoice settlement, full worldwide copyright, reproduction rights, and raw production files (Figma, vectors, source tokens) are transferred to your company.",
      icon: FileCheck2,
      badge: "Complete Ownership Rights",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-[#E6D8CF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* 1. QUALITATIVE VALUE STRIP */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="mb-3">
              <EditorialBadge variant="burgundy">
                TRANSPARENT ENGAGEMENT STANDARDS
              </EditorialBadge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#38241F] tracking-tight">
              Honest Principles for High-Craft Engagements
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.label}
                  className="p-6 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] hover:border-[#C7A99A] transition-all group shadow-subtle"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#541719]/10 text-[#541719] flex items-center justify-center mb-4 group-hover:bg-[#541719] group-hover:text-[#FFF9F3] transition-all shadow-subtle">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-base font-serif font-bold text-[#38241F] mb-1.5">
                    {pillar.label}
                  </div>
                  <p className="text-xs text-[#76665F] leading-relaxed font-sans font-normal">
                    {pillar.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. LEGAL & FINANCIAL SAFEGUARDS */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#38241F] text-[#FFF9F3] border border-[#C7A99A]/30 shadow-card">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#541719]/40 border border-[#C7A99A]/40 text-[#E0CEC3] text-xs font-sans font-bold tracking-wider uppercase mb-3">
              <EditorialStar size={10} color="#E0CEC3" />
              <span>LEGAL & FINANCIAL SAFEGUARDS</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Structured Safeguards for Client Peace of Mind
            </h3>
            <p className="text-sm text-[#E0CEC3] mt-2 leading-relaxed font-sans font-normal">
              Transparent parameters governing engagements between visionary companies and independent studio principals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safeguards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl bg-[#261714] border border-[#C7A99A]/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#541719]/40 text-[#E0CEC3] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-sans text-[#E0CEC3] font-bold bg-[#541719]/30 px-2.5 py-0.5 rounded-full border border-[#C7A99A]/30">
                        {item.status}
                      </span>
                    </div>

                    <h4 className="text-base font-serif font-bold text-white mb-2 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-[#E0CEC3] leading-relaxed font-sans font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 mt-5 text-[11px] font-sans text-[#C7A99A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C7A99A] shrink-0" />
                    <span>{item.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legal Notice */}
          <div className="mt-8 pt-6 border-t border-white/10 text-[11px] font-sans text-[#C7A99A] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#C7A99A] shrink-0 mt-0.5" />
            <span>
              Disclaimer: Safeguard provisions are confirmed in individual bilateral engagement contracts between parties. Terms can be customized to match enterprise procurement and compliance requirements.
            </span>
          </div>
        </div>

        {/* 3. CONFIDENCE & AGENCY PARITY */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
            Built to make senior creative collaboration simpler.
          </h3>

          <p className="text-sm sm:text-base text-[#76665F] leading-relaxed font-sans font-normal">
            Hiring the right creative professionals shouldn't require navigating opaque agency retainers, sifting through thousands of unvetted freelancer bids, or losing track of deliverable files in disconnected email threads. RICOZ provides a reliable foundation where high-growth businesses and elite creative specialists align with clarity, accountability, and legal security.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 text-left">
            <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF]">
              <div className="text-xs font-sans font-bold text-[#541719] uppercase tracking-wider mb-1">
                Curatorial Review
              </div>
              <div className="text-sm font-serif font-bold text-[#38241F] mb-1.5">
                Audited Work Portfolios
              </div>
              <p className="text-xs text-[#76665F] leading-relaxed font-sans">
                Review verified case studies, past studio leadership, and concrete deliverables before commissioning work.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF]">
              <div className="text-xs font-sans font-bold text-[#541719] uppercase tracking-wider mb-1">
                Direct Collaboration
              </div>
              <div className="text-sm font-serif font-bold text-[#38241F] mb-1.5">
                Work Directly With Principals
              </div>
              <p className="text-xs text-[#76665F] leading-relaxed font-sans">
                Collaborate directly with senior practitioners doing the actual design and strategy work, without intermediary layers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF]">
              <div className="text-xs font-sans font-bold text-[#541719] uppercase tracking-wider mb-1">
                Milestone Governance
              </div>
              <div className="text-sm font-serif font-bold text-[#38241F] mb-1.5">
                Structured Sign-Offs
              </div>
              <p className="text-xs text-[#76665F] leading-relaxed font-sans">
                All mandates follow milestone checkpoints with explicit review windows before subsequent sprint kickoff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};