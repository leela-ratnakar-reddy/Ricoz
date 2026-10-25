"use client";

import React from "react";
import { Building2, Megaphone, Compass, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export const WhoIsItForSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-[#FFF9F3] border-b border-[#E6D8CF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="mb-4">
            <EditorialBadge variant="burgundy">
              MANDATE ALIGNMENT
            </EditorialBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
            Built For Organizations That Value Distinctive Design.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#76665F] leading-relaxed font-sans font-normal">
            Whether scaling a high-growth venture or spearheading brand transformation inside an enterprise, RICOZ aligns senior creative talent with your exact mandate.
          </p>
        </div>

        {/* VARIED EDITORIAL LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Businesses & Startups (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E6D8CF] p-8 shadow-subtle hover:shadow-card hover:border-[#C7A99A] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#541719]/10 text-[#541719] flex items-center justify-center shadow-subtle">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-sans font-bold text-[#541719] bg-[#541719]/10 px-3 py-1 rounded-full border border-[#541719]/20">
                  High Growth
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-[#38241F] mb-3 tracking-tight">
                Businesses & Startups
              </h3>

              <p className="text-sm text-[#76665F] leading-relaxed mb-6 font-sans font-normal">
                For ambitious companies looking for premier creative professionals to lead branding, category architecture, and high-impact digital experiences.
              </p>
            </div>

            <div className="pt-6 border-t border-[#E6D8CF] space-y-2.5">
              <div className="text-[11px] font-sans font-bold text-[#9E8E87] uppercase tracking-wider mb-2">
                Core Engagement Profiles
              </div>
              {[
                "Seed to Series C brand launches",
                "Category positioning & narrative creation",
                "Complete digital identity and product design",
              ].map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#76665F] font-medium font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#541719] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Marketing & Brand Teams - FEATURED CONTRAST (4 cols) */}
          <div className="lg:col-span-4 bg-[#38241F] text-[#FFF9F3] rounded-3xl border border-[#C7A99A]/30 p-8 shadow-card flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#541719]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#541719] text-[#FFF9F3] flex items-center justify-center shadow-burgundy">
                  <Megaphone className="w-6 h-6" />
                </div>
                <span className="text-xs font-sans font-bold text-[#E0CEC3] bg-[#541719]/40 px-3 py-1 rounded-full border border-[#C7A99A]/40">
                  Enterprise Scale
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-[#FFF9F3] mb-3 tracking-tight">
                Marketing & Brand Teams
              </h3>

              <p className="text-sm text-[#E0CEC3] leading-relaxed mb-6 font-sans font-normal">
                For enterprise brand teams that require specialized senior creative direction without overhead or long agency ramp-ups.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 relative z-10 space-y-2.5">
              <div className="text-[11px] font-sans font-bold text-[#C7A99A] uppercase tracking-wider mb-2">
                Enterprise Mandates
              </div>
              {[
                "Executive brand refresh & global campaigns",
                "Design systems & token governance",
                "Senior creative direction on-demand",
              ].map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#E0CEC3] font-medium font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#C7A99A] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Founders & Leadership (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E6D8CF] p-8 shadow-subtle hover:shadow-card hover:border-[#C7A99A] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#541719]/10 text-[#541719] flex items-center justify-center shadow-subtle">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="text-xs font-sans font-bold text-[#541719] bg-[#541719]/10 px-3 py-1 rounded-full border border-[#541719]/20">
                  Leadership
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-[#38241F] mb-3 tracking-tight">
                Founders & Leadership
              </h3>

              <p className="text-sm text-[#76665F] leading-relaxed mb-6 font-sans font-normal">
                For founders and executives who want direct access to proven creative principals to shape early or transformative brand identity.
              </p>
            </div>

            <div className="pt-6 border-t border-[#E6D8CF] space-y-2.5">
              <div className="text-[11px] font-sans font-bold text-[#9E8E87] uppercase tracking-wider mb-2">
                Strategic Engagements
              </div>
              {[
                "Pre-fundraising narrative & pitch design",
                "Flagship product launch identity",
                "Holistic executive creative advisory",
              ].map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#76665F] font-medium font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#541719] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="mt-14 text-center">
          <Link
            href="/start-project"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#541719] hover:underline"
          >
            <span>Have a specific project mandate in mind? Define your requirements &rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
};