"use client";

import React from "react";
import { Check, Shield, Layers, Users, Sparkles, Clock, Lock } from "lucide-react";

export const TrustValueSection: React.FC = () => {
  const pillars = [
    {
      label: "Creative Talent",
      detail: "Curated senior practitioners across 19 disciplines",
      icon: Users,
    },
    {
      label: "Project Focused",
      detail: "Objective matching tied to concrete deliverables",
      icon: Layers,
    },
    {
      label: "Centralized Workflow",
      detail: "Unified from discovery and shortlist to project milestones",
      icon: Clock,
    },
    {
      label: "Built For Modern Teams",
      detail: "Transparent hourly rates, mutual NDAs and escrow protection",
      icon: Lock,
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* QUALITATIVE VALUE STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-16 border-b border-slate-100">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.label}
                className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-red-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-base font-bold text-slate-900 mb-1.5">
                  {pillar.label}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* CONFIDENCE SECTION */}
        <div className="pt-16 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase">
            <span>PLATFORM STANDARDS</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Built to make creative collaboration simpler.
          </h3>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Hiring the right creative professionals shouldn't require navigating opaque agency retainers, sift through thousands of unvetted freelancer bids, or lose track of deliverable files in disconnected email threads. RICOZ provides a reliable foundation where high-growth businesses and elite creative specialists align with clarity, accountability, and legal security.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                Zero Guesswork
              </div>
              <div className="text-sm font-bold text-slate-900 mb-2">
                Documented Track Records
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review verified case studies, past studio leadership, and specific project specialties before you reach out.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                Direct Collaboration
              </div>
              <div className="text-sm font-bold text-slate-900 mb-2">
                Work Directly With Principals
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Collaborate directly with senior practitioners doing the actual design and strategy work, not junior account managers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                Enterprise Safety
              </div>
              <div className="text-sm font-bold text-slate-900 mb-2">
                Standardized IP & Mutual NDAs
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All projects are governed under standardized mutual non-disclosure and comprehensive IP assignment frameworks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
