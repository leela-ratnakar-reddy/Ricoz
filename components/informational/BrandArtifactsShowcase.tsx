"use client";

import React from "react";
import { Layers, FileCode2, Type, Box, FileText } from "lucide-react";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export const BrandArtifactsShowcase: React.FC = () => {
  const artifacts = [
    {
      title: "Visual Identity Systems",
      category: "BRAND ARCHITECTURE",
      description: "Scalable vector logotypes, adaptive symbol marks, responsive lockups, and geometric grid systems.",
      icon: Layers,
      specimen: "Aa",
      tokens: ["Primary Mark", "Clearspace Matrix", "Dark/Light Modes"],
    },
    {
      title: "Design Token Architectures",
      category: "SYSTEMS & ENGINEERING",
      description: "Production Figma variables, semantic color hierarchies, spatial typography ramps, and CSS tokens.",
      icon: FileCode2,
      specimen: "{}",
      tokens: ["Semantic Scales", "CSS Variables", "Cross-Platform Sync"],
    },
    {
      title: "Bespoke Typography Specimens",
      category: "EDITORIAL CRAFT",
      description: "Custom editorial type pairings, hierarchy matrices, micro-typography standards, and multilingual rules.",
      icon: Type,
      specimen: "Ag",
      tokens: ["Display Serifs", "Monospace Numerals", "Leading Geometry"],
    },
    {
      title: "Structural Packaging Suites",
      category: "PHYSICAL & TACTILE",
      description: "Custom dielines, sustainable material palettes, blind letterpress finishes, and tactile finishes.",
      icon: Box,
      specimen: "3D",
      tokens: ["Dieline Precision", "Unboxing Logic", "Pantone Standards"],
    },
    {
      title: "Executive Strategic Playbooks",
      category: "STRATEGIC POSITIONING",
      description: "Category-defining narrative frameworks, pre-IPO market positioning, and verbal brand playbooks.",
      icon: FileText,
      specimen: "Rx",
      tokens: ["Verbal Identity", "Audience Matrix", "Market Narrative"],
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FFF9F3] border-b border-[#E6D8CF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="mb-3">
            <EditorialBadge variant="burgundy">
              AUTHENTIC BRAND ARTIFACTS
            </EditorialBadge>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[#38241F] leading-tight">
            Production Artifacts Shipped Across Mandates
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#76665F] leading-relaxed font-sans">
            We prioritize demonstrable craftsmanship over unverified corporate logos. Every engagement yields rigorous, documented deliverables built for enterprise scale.
          </p>
        </div>

        {/* 5-CARD ARTIFACT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {artifacts.map((artifact) => {
            const Icon = artifact.icon;
            return (
              <div
                key={artifact.title}
                className="bg-white rounded-2xl border border-[#E6D8CF] p-5 shadow-subtle hover:shadow-card hover:border-[#C7A99A] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Specimen Icon & Glyphs */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#541719]/10 text-[#541719] flex items-center justify-center group-hover:bg-[#541719] group-hover:text-[#FFF9F3] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-serif italic font-bold text-lg text-[#C7A99A] group-hover:text-[#541719] transition-colors">
                      {artifact.specimen}
                    </span>
                  </div>

                  <div className="text-[10px] font-sans font-bold tracking-wider text-[#9E8E87] uppercase mb-1">
                    {artifact.category}
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#38241F] mb-2 leading-snug group-hover:text-[#541719] transition-colors">
                    {artifact.title}
                  </h3>

                  <p className="text-xs text-[#76665F] leading-relaxed font-sans mb-4">
                    {artifact.description}
                  </p>
                </div>

                {/* Token Badges */}
                <div className="pt-3 border-t border-[#E6D8CF] space-y-1.5">
                  {artifact.tokens.map((token, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] font-sans text-[#76665F] flex items-center gap-1.5"
                    >
                      <EditorialStar size={8} color="#541719" />
                      <span>{token}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};