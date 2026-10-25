"use client";

import React from "react";
import {
  Award,
  Sparkles,
  BookmarkCheck,
  Target,
  Kanban,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export const WhyRicozSection: React.FC = () => {
  return (
    <section id="why-ricoz" className="py-20 sm:py-28 bg-[#FBF6F0] border-b border-[#E6D8CF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="mb-4">
            <EditorialBadge variant="burgundy">
              THE RICOZ ADVANTAGE
            </EditorialBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
            Everything You Need To Build The Right Creative Team.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#76665F] leading-relaxed font-sans font-normal">
            Designed for high-growth enterprises and design leaders who require elite creative execution without the bloat of traditional agency retainers or freelance uncertainty.
          </p>
        </div>

        {/* ASYMMETRIC BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* FEATURED BENTO CARD 1: Curated Senior Talent (7 cols) */}
          <div className="lg:col-span-7 bg-[#38241F] text-[#FFF9F3] rounded-3xl p-8 sm:p-10 border border-[#C7A99A]/30 shadow-card flex flex-col justify-between relative overflow-hidden group">
            {/* Subtle Burgundy Aura */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#541719]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#541719] text-[#FFF9F3] flex items-center justify-center shadow-burgundy">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-xs font-sans font-bold text-[#E0CEC3] bg-[#541719]/40 border border-[#C7A99A]/40 px-3.5 py-1 rounded-full uppercase flex items-center gap-1.5">
                  <EditorialStar size={10} color="#E0CEC3" />
                  Curated Studio Principals
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFF9F3] tracking-tight pt-2">
                Curated Senior Creative Talent
              </h3>

              <p className="text-[#E0CEC3] text-sm sm:text-base leading-relaxed font-sans font-normal max-w-xl">
                Discover creative professionals across 19 creative specializations. Pre-vetted from renowned studios (Pentagram, Wolff Olins, Apple, Meta) with documented enterprise case studies.
              </p>

              {/* Visual Pedigree Pills */}
              <div className="pt-4 flex flex-wrap gap-2 text-xs font-sans">
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-[#FFF9F3] border border-white/10">
                  10+ Yrs Avg. Experience
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-[#FFF9F3] border border-white/10">
                  Documented Enterprise Portfolios
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-[#FFF9F3] border border-white/10">
                  Direct Principal Collaboration
                </span>
              </div>
            </div>

            <div className="pt-8 relative z-10 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-sans">
              <span className="text-[#C7A99A]">57 Verified Principals Ready</span>
              <Link
                href="/talent"
                className="text-[#E0CEC3] hover:text-white font-bold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
              >
                <span>Browse Talent Pool</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* FEATURED BENTO CARD 2: Smart Discovery & Matching (5 cols) */}
          <div className="lg:col-span-5 bg-[#FFF9F3] rounded-3xl p-8 border border-[#E6D8CF] shadow-subtle flex flex-col justify-between group hover:border-[#C7A99A] transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#541719] text-[#FFF9F3] flex items-center justify-center shadow-burgundy">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xs font-sans font-bold text-[#541719] bg-[#541719]/10 border border-[#541719]/20 px-3.5 py-1 rounded-full uppercase">
                  Multi-Dimensional
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-[#38241F] tracking-tight pt-2">
                Smart Talent Matching
              </h3>

              <p className="text-[#76665F] text-sm leading-relaxed font-sans font-normal">
                Find relevant professionals based on your mandate's creative criteria. Multi-dimensional alignment matches sector history, aesthetic philosophy, and enterprise scale.
              </p>

              {/* Visual Match Indicators */}
              <div className="space-y-2 pt-2 text-xs font-sans">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6D8CF] shadow-subtle">
                  <span className="text-[#38241F] font-medium">Domain Alignment</span>
                  <span className="font-sans font-bold text-[#541719]">98% Fit</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6D8CF] shadow-subtle">
                  <span className="text-[#38241F] font-medium">Deliverable Competency</span>
                  <span className="font-sans font-bold text-[#541719]">96% Fit</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E6D8CF] mt-6 flex items-center justify-between text-xs font-sans">
              <span className="text-[#9E8E87]">Evidence-Based Recommendations</span>
              <Link
                href="/ai-match"
                className="text-[#541719] font-bold hover:underline flex items-center gap-1"
              >
                <span>Try Matching Engine</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* COMPACT BENTO CARD 3: Easy Shortlisting (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-7 border border-[#E6D8CF] shadow-subtle hover:border-[#C7A99A] hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#541719]/10 text-[#541719] flex items-center justify-center mb-5 group-hover:bg-[#541719] group-hover:text-[#FFF9F3] transition-colors">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#38241F] mb-2">Easy Shortlisting</h3>
              <p className="text-xs sm:text-sm text-[#76665F] leading-relaxed font-sans font-normal">
                Review profiles and organize the talent you want to consider. Compare portfolios side-by-side and assemble multidisciplinary project pods.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E6D8CF] mt-4 text-xs font-sans text-[#9E8E87]">
              Interactive Shortlist Tray Included
            </div>
          </div>

          {/* COMPACT BENTO CARD 4: Project-Based Matching (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-7 border border-[#E6D8CF] shadow-subtle hover:border-[#C7A99A] hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#541719]/10 text-[#541719] flex items-center justify-center mb-5 group-hover:bg-[#541719] group-hover:text-[#FFF9F3] transition-colors">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#38241F] mb-2">Project-Based Matching</h3>
              <p className="text-xs sm:text-sm text-[#76665F] leading-relaxed font-sans font-normal">
                Connect project requirements with creative expertise instead of searching blindly. Every recommendation is backed by documented reasoning.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E6D8CF] mt-4 text-xs font-sans text-[#9E8E87]">
              Deliverable-Driven Alignment
            </div>
          </div>

          {/* COMPACT BENTO CARD 5: Centralized Project Flow (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-7 border border-[#E6D8CF] shadow-subtle hover:border-[#C7A99A] hover:shadow-card transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#541719]/10 text-[#541719] flex items-center justify-center mb-5 group-hover:bg-[#541719] group-hover:text-[#FFF9F3] transition-colors">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#38241F] mb-2">Centralized Project Flow</h3>
              <p className="text-xs sm:text-sm text-[#76665F] leading-relaxed font-sans font-normal">
                Keep important project information and collaboration steps organized in one place. Streamline briefs, contracts, and milestone reviews.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E6D8CF] mt-4 text-xs font-sans text-[#9E8E87]">
              Milestone Escrow & NDAs Built-In
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};