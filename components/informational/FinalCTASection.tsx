"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { EditorialStar, EditorialBadge, ContourFlourish } from "@/components/ui/EditorialDecorations";

interface FinalCTASectionProps {
  onOpenBriefing?: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onOpenBriefing }) => {
  return (
    <section className="py-20 sm:py-28 bg-[#FBF6F0] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="bg-[#38241F] rounded-3xl p-8 sm:p-14 lg:p-16 text-white shadow-card relative overflow-hidden border border-[#C7A99A]/30">
          {/* Subtle Burgundy Aura & Decorative Contour Flourish */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#541719]/30 rounded-full blur-3xl pointer-events-none" />
          <ContourFlourish className="absolute -bottom-10 -left-10 opacity-20" width={360} height={200} strokeColor="#E0CEC3" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#541719]/40 border border-[#C7A99A]/40 text-[#E0CEC3] text-xs font-sans font-bold tracking-wider uppercase">
              <EditorialStar size={10} color="#E0CEC3" />
              <span>COMMISSION YOUR MANDATE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight">
              Ready To Commission Curated Creative Talent?
            </h2>

            <p className="text-base sm:text-lg text-[#E0CEC3] leading-relaxed font-sans font-normal">
              Tell us what you are building and discover the specialized creative directors, brand architects, and design teams ready for your mandate.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/start-project"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-base hover:bg-[#3E1012] active:scale-95 transition-all shadow-burgundy group"
              >
                <span>Start A Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {onOpenBriefing ? (
                <button
                  type="button"
                  onClick={onOpenBriefing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-[#FFF9F3] border border-white/20 font-sans font-semibold text-base transition-all"
                >
                  <Users className="w-4 h-4 text-[#C7A99A]" />
                  <span>Book Concierge Briefing</span>
                </button>
              ) : (
                <Link
                  href="/talent"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-[#FFF9F3] border border-white/20 font-sans font-semibold text-base transition-all"
                >
                  <Users className="w-4 h-4 text-[#C7A99A]" />
                  <span>Explore Talent (57)</span>
                </Link>
              )}
            </div>

            <div className="pt-6 text-xs text-[#C7A99A] font-sans flex items-center justify-center gap-6">
              <span>✦ Standard Mutual NDA</span>
              <span>✦ Verified Studio Portfolios</span>
              <span>✦ Milestone Escrow Protection</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};