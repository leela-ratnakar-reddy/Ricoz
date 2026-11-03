"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { TalentAvatar } from "@/components/ui/TalentAvatar";
import { EditorialStar, ContourFlourish, EditorialBadge } from "@/components/ui/EditorialDecorations";

interface HeroSectionProps {
  onOpenBriefing?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenBriefing }) => {
  return (
    <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32 overflow-hidden bg-[#FBF6F0] border-b border-[#E6D8CF]">
      {/* Delicate Organic Contour Lines Background */}
      <div className="absolute top-0 right-0 w-full max-w-5xl h-full pointer-events-none opacity-40 overflow-hidden">
        <ContourFlourish className="absolute -top-10 right-10" width={480} height={260} strokeColor="#C7A99A" />
        <ContourFlourish className="absolute bottom-10 left-10" width={420} height={220} strokeColor="#E0CEC3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT: EDITORIAL COPY & CALL TO ACTIONS */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-8">
            {/* EYEBROW */}
            <div>
              <EditorialBadge variant="burgundy">
                CURATED CREATIVE TALENT NETWORK
              </EditorialBadge>
            </div>

            {/* MAIN HEADING - EDITORIAL PLAYFAIR SERIF */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-serif font-black tracking-tight text-[#38241F] leading-[1.12]">
              Great Projects Start With The{" "}
              <span className="italic font-normal text-[#541719] block sm:inline">
                Right Creative Talent.
              </span>
            </h1>

            {/* SUPPORTING TEXT */}
            <p className="text-base sm:text-lg text-[#76665F] max-w-xl leading-relaxed font-sans font-normal">
              RICOZ connects visionary enterprises with curated Creative Directors, Brand Architects, and Specialized Design Teams for transformational brand and product mandates.
            </p>

            {/* CTAS */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
                <Link
                  href="/talent"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-base shadow-burgundy hover:bg-[#3E1012] active:scale-95 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
                >
                  <span>Explore Talent (57)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" />
                </Link>

                <Link
                  href="/start-project"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#FFF9F3] hover:bg-[#FAF2EA] text-[#38241F] border border-[#E6D8CF] font-sans font-semibold text-base shadow-subtle hover:border-[#C7A99A] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
                >
                  <span>Start a Project</span>
                </Link>
              </div>

              {onOpenBriefing && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onOpenBriefing}
                    className="inline-flex items-center gap-2 text-xs text-[#76665F] hover:text-[#541719] font-medium transition-colors group cursor-pointer"
                  >
                    <span>Prefer an executive consultation?</span>
                    <span className="underline decoration-[#E6D8CF] group-hover:decoration-[#541719] underline-offset-4 font-semibold text-[#38241F] group-hover:text-[#541719]">
                      Book a 15-minute briefing call &rarr;
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* QUALITATIVE PLATFORM TRUST PILLARS */}
            <div className="pt-6 border-t border-[#E6D8CF] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-[#76665F] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#541719] shrink-0" />
                <span>Curated Studio Principals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#541719] shrink-0" />
                <span>Project-Based Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#541719] shrink-0" />
                <span>19 Creative Disciplines</span>
              </div>
            </div>
          </div>

          {/* RIGHT: REAL PRODUCT COMPOSITION & MOCKUP */}
          <div className="lg:col-span-6 xl:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Product Card: Real Verified Profile Preview */}
              <div className="bg-white rounded-2xl border border-[#E6D8CF] shadow-card p-6 sm:p-7 relative z-10 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E6D8CF] pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#541719]/10 flex items-center justify-center text-[#541719]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#9E8E87]">
                        Curated Talent Match
                      </div>
                      <div className="text-sm font-serif font-bold text-[#38241F]">
                        Acme Cloud // Global Brand Architecture
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#541719]/10 text-[#541719] text-xs font-semibold border border-[#541719]/20">
                    <EditorialStar size={10} color="#541719" />
                    98% Match
                  </span>
                </div>

                {/* Primary Talent Profile (Elena Rostova) */}
                <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#E6D8CF] mb-4 hover:border-[#C7A99A] transition-all">
                  <div className="flex items-start gap-4">
                    <TalentAvatar
                      src="/images/talent/elena-rostova.jpg"
                      alt="Elena Rostova"
                      initials="ER"
                      size={54}
                      priority
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-serif font-bold text-[#38241F] text-base truncate">
                          Elena Rostova
                        </div>
                        <span className="text-xs font-mono font-bold text-[#38241F] bg-white px-2 py-0.5 rounded-full border border-[#E6D8CF]">
                          $165/hr
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#541719] mb-2 font-sans">
                        Brand Strategist & Architecture Lead
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-white text-[#76665F] border border-[#E6D8CF]">
                          Ex-Pentagram
                        </span>
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-white text-[#76665F] border border-[#E6D8CF]">
                          Tech Category Creation
                        </span>
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-white text-[#76665F] border border-[#E6D8CF]">
                          12 yrs exp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Talent Profile (Julian Mercer) */}
                <div className="p-4 rounded-xl bg-white border border-[#E6D8CF] shadow-subtle mb-4">
                  <div className="flex items-start gap-4">
                    <TalentAvatar
                      src="/images/talent/julian-mercer.jpg"
                      alt="Julian Mercer"
                      initials="JM"
                      size={54}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-serif font-bold text-[#38241F] text-base truncate">
                          Julian Mercer
                        </div>
                        <span className="text-xs font-mono font-bold text-[#38241F] bg-[#FFF9F3] px-2 py-0.5 rounded-full border border-[#E6D8CF]">
                          $210/hr
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#541719] mb-2 font-sans">
                        Creative Director & Design Systems Lead
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]">
                          Ex-Wired / Apple
                        </span>
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]">
                          Design Tokens
                        </span>
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]">
                          16 yrs exp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Shortlist Action Strip */}
                <div className="pt-3 border-t border-[#E6D8CF] flex items-center justify-between text-xs text-[#76665F]">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <TalentAvatar
                        src="/images/talent/elena-rostova.jpg"
                        alt="Elena Rostova"
                        initials="ER"
                        size={24}
                        className="rounded-full border-2 border-white"
                      />
                      <TalentAvatar
                        src="/images/talent/julian-mercer.jpg"
                        alt="Julian Mercer"
                        initials="JM"
                        size={24}
                        className="rounded-full border-2 border-white"
                      />
                      <TalentAvatar
                        src="/images/talent/camille-dupuis.jpg"
                        alt="Camille Dupuis"
                        initials="CD"
                        size={24}
                        className="rounded-full border-2 border-white"
                      />
                    </div>
                    <span className="font-semibold text-[#38241F]">3 Specialists Shortlisted</span>
                  </div>
                  <Link
                    href="/start-project"
                    className="text-[#541719] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Assemble Squad</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Floating Pill Accent 1: Top Right */}
              <div className="hidden sm:flex absolute -top-4 -right-4 z-20 items-center gap-2 px-4 py-2 rounded-full bg-[#38241F] text-[#FFF9F3] text-xs font-semibold shadow-card border border-[#C7A99A]/40">
                <ShieldCheck className="w-4 h-4 text-[#C7A99A]" />
                <span>Verified Studio Portfolios</span>
              </div>

              {/* Floating Pill Accent 2: Bottom Left */}
              <div className="hidden sm:flex absolute -bottom-4 -left-4 z-20 items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFF9F3] text-[#38241F] text-xs font-bold shadow-card border border-[#E6D8CF]">
                <EditorialStar size={12} color="#541719" />
                <span>Mutual NDA Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};