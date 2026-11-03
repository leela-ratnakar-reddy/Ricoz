"use client";

import React from "react";
import { Building2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { EditorialBadge } from "@/components/ui/EditorialDecorations";

export const WhoIsItForSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-[#FFF9F3] border-b border-[#E6D8CF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="mb-4">
            <EditorialBadge variant="burgundy">
              DUAL PATHWAY ECOSYSTEM
            </EditorialBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
            Built For Forward-Thinking Companies and Elite Creatives.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#76665F] leading-relaxed font-sans font-normal">
            RICOZ bridges enterprise organizations seeking transformational design craft with verified senior principals operating at the height of their disciplines.
          </p>
        </div>

        {/* 2-COLUMN DUAL PATHWAY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Pathway 1: For Companies */}
          <div className="bg-white rounded-3xl border border-[#E6D8CF] p-8 sm:p-10 shadow-subtle hover:shadow-card hover:border-[#C7A99A] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#541719]/10 text-[#541719] flex items-center justify-center shadow-subtle">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-sans font-bold text-[#541719] bg-[#541719]/10 px-3 py-1 rounded-full border border-[#541719]/20">
                  For Companies & Brands
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#38241F] mb-4 tracking-tight">
                Enterprise Mandates Without Agency Friction
              </h3>

              <p className="text-sm sm:text-base text-[#76665F] leading-relaxed mb-6 font-sans font-normal">
                Assemble vetted 5-specialist squads or individual principals in days, not months. Protect capital with milestone-based escrow governance and guaranteed 100% IP assignment.
              </p>

              <div className="space-y-3 pt-2 mb-8">
                {[
                  "Access top 1% vetted creative principals directly",
                  "AI-assisted squad assembly tailored to your exact industry",
                  "Bilateral NDA execution and milestone escrow protection",
                  "Zero retainer lock-in or unvetted junior substitutions",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#38241F] font-medium font-sans">
                    <CheckCircle2 className="w-4 h-4 text-[#541719] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E6D8CF] flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/companies"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#541719] text-[#FFF9F3] font-semibold text-xs hover:bg-[#3E1012] transition-colors shadow-burgundy"
              >
                <span>Explore Company Solutions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/start-project"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[#E6D8CF] bg-white text-[#38241F] font-semibold text-xs hover:bg-[#FFF9F3] transition-colors"
              >
                <span>Start a Project</span>
              </Link>
            </div>
          </div>

          {/* Pathway 2: For Creatives */}
          <div className="bg-[#38241F] text-[#FFF9F3] rounded-3xl border border-[#C7A99A]/30 p-8 sm:p-10 shadow-card flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#541719]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#541719] text-[#FFF9F3] flex items-center justify-center shadow-burgundy">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xs font-sans font-bold text-[#E0CEC3] bg-[#541719]/60 px-3 py-1 rounded-full border border-[#C7A99A]/40">
                  For Senior Creatives
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFF9F3] mb-4 tracking-tight">
                High-Impact Mandates With Transparent Rates
              </h3>

              <p className="text-sm sm:text-base text-[#E0CEC3] leading-relaxed mb-6 font-sans font-normal">
                Work directly with ambitious founders and enterprise brand teams on category-defining initiatives. Set your own transparent hourly rates and work without pitch fees.
              </p>

              <div className="space-y-3 pt-2 mb-8">
                {[
                  "Curated invitations to enterprise rebrand and product mandates",
                  "Direct peer collaboration with senior discipline leaders",
                  "Guaranteed payment releases via secured escrow contracts",
                  "Dedicated portfolio dossier spotlighted to verified clients",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#E0CEC3] font-medium font-sans">
                    <CheckCircle2 className="w-4 h-4 text-[#C7A99A] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 relative z-10 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/creatives"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FFF9F3] text-[#38241F] font-semibold text-xs hover:bg-white transition-colors"
              >
                <span>Creative Network Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register?role=designer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[#C7A99A]/40 text-[#FFF9F3] font-semibold text-xs hover:bg-[#541719]/40 transition-colors"
              >
                <span>Apply to Join Network</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
