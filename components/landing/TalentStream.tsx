"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";

interface StreamTalent {
  id: string;
  name: string;
  role: string;
  pedigree: string;
  match: number;
  highlight: string;
  specialties: string[];
}

const TALENT_ROW_1: StreamTalent[] = [
  {
    id: "des-1",
    name: "Alex Morgan",
    role: "Creative Director",
    pedigree: "Ex-Pentagram • London",
    match: 98,
    highlight: "Led global repositioning for Northstar Cloud",
    specialties: ["Brand Strategy", "Identity Systems", "Art Direction"],
  },
  {
    id: "des-2",
    name: "Maya Chen",
    role: "Brand Designer",
    pedigree: "Ex-Collins • San Francisco",
    match: 96,
    highlight: "Crafted generative token architecture for Vertex OS",
    specialties: ["Typography Systems", "Design Tokens", "Packaging"],
  },
  {
    id: "des-3",
    name: "David Laurent",
    role: "Art Director",
    pedigree: "Luxury Lead • Paris",
    match: 95,
    highlight: "Helmed Maison Vaneau haute horlogerie rebrand",
    specialties: ["Editorial Systems", "Tactile Luxury", "Exhibition"],
  },
  {
    id: "des-4",
    name: "Sofia Bennett",
    role: "Typography Principal",
    pedigree: "Type Foundry Lead • Zurich",
    match: 99,
    highlight: "Engineered proprietary variable font family for Chrono",
    specialties: ["Custom Variable Type", "Logotypes", "Font Craft"],
  },
];

const TALENT_ROW_2: StreamTalent[] = [
  {
    id: "des-5",
    name: "Daniel Kim",
    role: "Motion Designer",
    pedigree: "Spatial & 3D Lead • Seoul",
    match: 94,
    highlight: "Designed kinetic brand world for Kinetix Robotics",
    specialties: ["3D Creative", "Motion Branding", "Generative Identity"],
  },
  {
    id: "des-6",
    name: "Elena Rossi",
    role: "Product Designer",
    pedigree: "Ex-Wolff Olins • Milan",
    match: 97,
    highlight: "Restructured digital ecosystem for Altus Capital",
    specialties: ["Design Systems", "Enterprise UX", "Verbal Tone"],
  },
  {
    id: "des-7",
    name: "Marcus Reed",
    role: "UI/UX Designer",
    pedigree: "Scaleup Specialist • New York",
    match: 93,
    highlight: "Orchestrated multi-brand UI overhaul for TensorScale",
    specialties: ["Enterprise UI", "Design Systems", "Component Craft"],
  },
  {
    id: "des-8",
    name: "Nora Williams",
    role: "Brand Designer",
    pedigree: "Tactile Specialist • Copenhagen",
    match: 95,
    highlight: "Pioneered zero-waste luxury packaging for Hæst",
    specialties: ["Sustainable Packaging", "Luxury Materials", "Unboxing"],
  },
];

export function TalentStream() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full relative overflow-hidden py-12 select-none">
      {/* Edge Blur masks for cinematic fade */}
      <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

      {/* Row 1: Flowing Leftward */}
      <div className="mb-6 overflow-hidden">
        <motion.div
          animate={shouldReduceMotion ? {} : { x: ["0%", "-50%"] }}
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center gap-6 w-max will-change-transform"
        >
          {[...TALENT_ROW_1, ...TALENT_ROW_1].map((talent, idx) => {
            const isHovered = hoveredId === `${talent.id}-${idx}`;

            return (
              <Link
                key={`r1-${talent.id}-${idx}`}
                href={`/designers/${talent.id}`}
                onMouseEnter={() => setHoveredId(`${talent.id}-${idx}`)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-300 w-[300px] sm:w-[350px] shrink-0 backdrop-blur-md ${
                  isHovered
                    ? "bg-surface-elevated/95 border border-accent/60 shadow-glow -translate-y-1"
                    : "bg-surface/50 border border-white/10 hover:border-white/20 shadow-surface"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                    {talent.role}
                  </span>
                  <span className="font-mono text-[10px] text-brand-muted px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {talent.match}% MATCH
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-white group-hover:text-accent transition-colors flex items-center gap-1">
                    <span>{talent.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-accent" />
                  </h4>
                  <span className="text-[11px] text-brand-muted font-mono">
                    {talent.pedigree}
                  </span>
                </div>

                <p className="text-xs text-brand-secondary line-clamp-1 mb-3">
                  {talent.highlight}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                  {talent.specialties.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-brand-secondary"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </motion.div>
      </div>

      {/* Row 2: Flowing Rightward */}
      <div className="overflow-hidden">
        <motion.div
          animate={shouldReduceMotion ? {} : { x: ["-50%", "0%"] }}
          transition={{
            duration: 42,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center gap-6 w-max will-change-transform"
        >
          {[...TALENT_ROW_2, ...TALENT_ROW_2].map((talent, idx) => {
            const isHovered = hoveredId === `${talent.id}-r2-${idx}`;

            return (
              <Link
                key={`r2-${talent.id}-${idx}`}
                href={`/designers/${talent.id}`}
                onMouseEnter={() => setHoveredId(`${talent.id}-r2-${idx}`)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-300 w-[300px] sm:w-[350px] shrink-0 backdrop-blur-md ${
                  isHovered
                    ? "bg-surface-elevated/95 border border-accent/60 shadow-glow -translate-y-1"
                    : "bg-surface/50 border border-white/10 hover:border-white/20 shadow-surface"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                    {talent.role}
                  </span>
                  <span className="font-mono text-[10px] text-brand-muted px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {talent.match}% MATCH
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-white group-hover:text-accent transition-colors flex items-center gap-1">
                    <span>{talent.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-accent" />
                  </h4>
                  <span className="text-[11px] text-brand-muted font-mono">
                    {talent.pedigree}
                  </span>
                </div>

                <p className="text-xs text-brand-secondary line-clamp-1 mb-3">
                  {talent.highlight}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                  {talent.specialties.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-brand-secondary"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
