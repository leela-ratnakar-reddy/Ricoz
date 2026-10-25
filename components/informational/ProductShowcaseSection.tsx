"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Star
} from "lucide-react";
import { TalentAvatar } from "@/components/ui/TalentAvatar";
import { CaseStudyArtwork } from "@/components/ui/CaseStudyArtwork";
import { CaseStudyModal, CaseStudyItem } from "@/components/informational/CaseStudyModal";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export const ProductShowcaseSection: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseStudyItem | null>(null);

  const apexAiCase: CaseStudyItem = {
    id: "apex-ai",
    title: "Apex AI — Enterprise Brand System & Token Architecture",
    client: "Apex AI Autonomous Systems",
    specialistName: "Mateo Silva & Dominic Sterling",
    specialistRole: "Art Director & Design Systems Architect",
    specialistAvatar: "/images/talent/mateo-silva.jpg",
    discipline: "Design Systems & Visual Identity",
    deliverables: [
      "Enterprise Identity Mark",
      "Figma Tokens Sync",
      "Governance Web Portal",
      "Executive Typeface Specimen",
    ],
    challenge:
      "Apex AI needed to unify 4 subsidiary software products under one coherent design language while preparing for global Series B scaling.",
    solution:
      "Created tokenized design architecture, dark/light multi-theme Figma library, and audited typographic hierarchy.",
    timeline: "8 Weeks",
    image: "/images/talent/portfolio/apex-ai-enterprise-brand-system-governance-portal.jpg",
    palette: ["#38241F", "#541719", "#C7A99A", "#FBF6F0"],
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FFF9F3] border-b border-[#E6D8CF] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">
        {/* ROW 1: REAL-TIME MATCHING & TALENT EVALUATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text (Left) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <EditorialBadge variant="burgundy">
                REAL-TIME MATCHING ENGINE
              </EditorialBadge>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
              See RICOZ In Action.
            </h2>

            <p className="text-base sm:text-lg text-[#76665F] leading-relaxed font-sans font-normal">
              Instead of browsing generic freelancer profiles or sending blind inquiries, RICOZ structures your creative mandate into concrete disciplines, sector experience, and deliverable milestones.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#541719] shrink-0 mt-0.5" />
                <span className="text-sm text-[#38241F] font-sans font-medium">
                  Multi-dimensional matching based on industry background, aesthetic craft, and enterprise scale.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#541719] shrink-0 mt-0.5" />
                <span className="text-sm text-[#38241F] font-sans font-medium">
                  Instant match score breakdowns showing exact reasons why a candidate fits your project.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#541719] shrink-0 mt-0.5" />
                <span className="text-sm text-[#38241F] font-sans font-medium">
                  Transparent hourly rates and confirmed availability updated weekly.
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/ai-match"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-sm hover:bg-[#3E1012] transition-colors shadow-burgundy focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
              >
                <span>Test Live Match Engine</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mockup (Right) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-[#E6D8CF] p-6 sm:p-7 shadow-card relative">
              <div className="flex items-center justify-between border-b border-[#E6D8CF] pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#541719]" />
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#38241F]">
                    Squad Match Result
                  </span>
                </div>
                <span className="text-xs font-sans font-bold text-[#541719] bg-[#541719]/10 px-3 py-1 rounded-full border border-[#541719]/20">
                  2 Principals Matched
                </span>
              </div>

              {/* Match Card 1: Mateo Silva */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#E6D8CF] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <TalentAvatar
                      src="/images/talent/mateo-silva.jpg"
                      alt="Mateo Silva"
                      initials="MS"
                      size={48}
                    />
                    <div>
                      <div className="text-sm font-serif font-bold text-[#38241F]">Mateo Silva</div>
                      <div className="text-xs text-[#541719] font-medium font-sans">Art Director & Visual Identity Lead</div>
                      <div className="text-[11px] text-[#76665F] font-sans">11 yrs exp • Ex-Koto / Wolff Olins</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#541719]/10 text-[#541719] border border-[#541719]/20 text-xs font-sans font-bold">
                      96% Match
                    </span>
                    <div className="text-[11px] font-mono text-[#38241F] mt-1">$155/hr</div>
                  </div>
                </div>

                {/* Match Card 2: Camille Dupuis */}
                <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#E6D8CF] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <TalentAvatar
                      src="/images/talent/camille-dupuis.jpg"
                      alt="Camille Dupuis"
                      initials="CD"
                      size={48}
                    />
                    <div>
                      <div className="text-sm font-serif font-bold text-[#38241F]">Camille Dupuis</div>
                      <div className="text-xs text-[#541719] font-medium font-sans">Packaging & Luxury Print Director</div>
                      <div className="text-[11px] text-[#76665F] font-sans">13 yrs exp • Paris, FR</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#541719]/10 text-[#541719] border border-[#541719]/20 text-xs font-sans font-bold">
                      95% Match
                    </span>
                    <div className="text-[11px] font-mono text-[#38241F] mt-1">$170/hr</div>
                  </div>
                </div>
              </div>

              {/* Bottom Stat Bar */}
              <div className="mt-5 pt-4 border-t border-[#E6D8CF] flex items-center justify-between text-xs text-[#76665F] font-sans">
                <span>Verified Match Criteria: Tech & Rebrand</span>
                <span className="font-semibold text-[#38241F]">Kickoff window: 1-2 wks</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: LIVE CASE STUDY ARTWORK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Mockup (Left) */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div
              onClick={() => setSelectedCase(apexAiCase)}
              className="bg-white rounded-3xl border border-[#E6D8CF] p-6 sm:p-7 shadow-card relative cursor-pointer group hover:border-[#C7A99A] transition-all"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedCase(apexAiCase);
              }}
              aria-label="View Apex AI Case Study"
            >
              {/* Robust Case Study Artwork with Image Fallback */}
              <CaseStudyArtwork
                src="/images/talent/portfolio/apex-ai-enterprise-brand-system-governance-portal.jpg"
                title="Apex AI — Enterprise Brand System & Governance"
                discipline="Design Systems & Architecture"
                deliverables={["Brand Identity", "Design Tokens", "Governance Portal"]}
                palette={["#38241F", "#541719", "#C7A99A", "#FBF6F0"]}
                aspectRatio="aspect-[16/10]"
                className="mb-4"
              />

              <div className="flex items-center justify-between text-xs text-[#76665F] pt-1 font-sans">
                <div className="flex items-center gap-2">
                  <EditorialStar size={12} color="#541719" />
                  <span className="font-serif font-bold text-[#38241F]">Featured Enterprise Case Study</span>
                </div>
                <span className="text-[#541719] font-bold group-hover:underline flex items-center gap-1">
                  <span>Open Full Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Text (Right) */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div>
              <EditorialBadge variant="burgundy">
                SPECIALIZED DISCIPLINE CRAFT
              </EditorialBadge>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
              Find The Right Creative Expertise.
            </h2>

            <p className="text-base sm:text-lg text-[#76665F] leading-relaxed font-sans font-normal">
              Great creative execution requires specialized focus. RICOZ gives you access to pre-vetted professionals across 19 critical creative disciplines.
            </p>

            {/* Discipline Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                "Creative Director",
                "Brand Strategist",
                "Brand Identity Designer",
                "UI/UX Designer",
                "Motion Designer",
                "Design Systems Specialist",
                "Packaging Designer",
                "Art Director",
                "Typographer",
                "Copywriter",
                "Brand Photographer",
                "Visual Identity Designer",
              ].map((role) => (
                <span
                  key={role}
                  className="px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-[#FFF9F3] border border-[#E6D8CF] text-[#38241F] hover:border-[#C7A99A] transition-colors"
                >
                  {role}
                </span>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/talent"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#541719] hover:underline"
              >
                <span>Browse all 19 creative specializations &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CASE STUDY MODAL */}
      <CaseStudyModal
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        caseStudy={selectedCase}
      />
    </section>
  );
};