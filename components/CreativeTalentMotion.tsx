"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";

interface TalentProfile {
  id: string;
  num: string;
  name: string;
  role: string;
  experience: string;
  match: number;
  skills: string[];
  rebrand: string;
  location: string;
}

const ROW_ONE_TALENT: TalentProfile[] = [
  {
    id: "des-1",
    num: "01",
    name: "Alex Morgan",
    role: "Creative Director",
    experience: "15+ yrs • Ex-Pentagram",
    match: 98,
    skills: ["Brand Strategy", "Identity Systems", "Art Direction"],
    rebrand: "Northstar Cloud Global Identity",
    location: "London / New York",
  },
  {
    id: "des-2",
    num: "02",
    name: "Maya Chen",
    role: "Brand Identity Designer",
    experience: "12+ yrs • Ex-Collins",
    match: 96,
    skills: ["Typography Systems", "Design Tokens", "Packaging"],
    rebrand: "Vertex OS Generational Shift",
    location: "San Francisco",
  },
  {
    id: "des-3",
    num: "03",
    name: "David Laurent",
    role: "Creative Director",
    experience: "16+ yrs • Luxury Lead",
    match: 95,
    skills: ["Editorial Systems", "Monolith Rebranding", "Art Direction"],
    rebrand: "Maison Vaneau Rebrand",
    location: "Paris / Geneva",
  },
  {
    id: "des-4",
    num: "04",
    name: "Sofia Bennett",
    role: "Typography Specialist",
    experience: "11+ yrs • Type Foundry Principal",
    match: 99,
    skills: ["Custom Variable Type", "Logotypes", "Font Engineering"],
    rebrand: "Chrono Precision Chronometry",
    location: "Berlin / Zurich",
  },
];

const ROW_TWO_TALENT: TalentProfile[] = [
  {
    id: "des-5",
    num: "05",
    name: "Daniel Kim",
    role: "Art Director",
    experience: "13+ yrs • Spatial & 3D Lead",
    match: 94,
    skills: ["3D Creative Direction", "Motion Branding", "Generative Identity"],
    rebrand: "Kinetix Robotics Global Overhaul",
    location: "Seoul / Tokyo",
  },
  {
    id: "des-6",
    num: "06",
    name: "Elena Rossi",
    role: "Brand Strategist",
    experience: "14+ yrs • Ex-Wolff Olins",
    match: 97,
    skills: ["Brand Architecture", "Executive Verbal Tone", "Market Repositioning"],
    rebrand: "Altus Capital Transformation",
    location: "Milan / London",
  },
  {
    id: "des-7",
    num: "07",
    name: "Marcus Reed",
    role: "Visual Identity Designer",
    experience: "10+ yrs • Scaleup Specialist",
    match: 93,
    skills: ["Enterprise UI Design", "Vector Craft", "B2B Design Systems"],
    rebrand: "TensorScale Infrastructure",
    location: "New York / Austin",
  },
  {
    id: "des-8",
    num: "08",
    name: "Nora Williams",
    role: "Packaging & Identity Designer",
    experience: "12+ yrs • Tactile Specialist",
    match: 95,
    skills: ["Sustainable Packaging", "Luxury Materials", "Unboxing Architecture"],
    rebrand: "Hæst Nordic Botanicals",
    location: "Copenhagen / Oslo",
  },
];

function TalentCard({ talent, isFeatured = false }: { talent: TalentProfile; isFeatured?: boolean }) {
  return (
    <Link
      href={`/designers/${talent.id}`}
      className={`group block relative select-none rounded-xl transition-all duration-300 ${
        isFeatured
          ? "w-[340px] sm:w-[380px] p-6 sm:p-7 bg-surface-elevated/95 border-2 border-accent/40 shadow-glow"
          : "w-[290px] sm:w-[330px] p-5 sm:p-6 bg-surface/90 border border-surface-border hover:border-accent/40 hover:bg-surface-elevated/80 shadow-surface"
      } backdrop-blur-sm shrink-0`}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-accent tracking-wider">
            {talent.num} //
          </span>
          <span className="font-mono text-[10px] text-brand-muted uppercase tracking-widest truncate max-w-[130px] sm:max-w-[160px]">
            {talent.role}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent font-mono text-[10px] font-semibold tracking-wider shrink-0">
          <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
          <span>{talent.match}% MATCH</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-accent transition-colors flex items-center justify-between">
          <span>{talent.name}</span>
          <ArrowUpRight className="w-4 h-4 text-brand-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </h3>
        <p className="text-xs text-brand-muted font-mono mt-1">
          {talent.experience}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {talent.skills.map((skill, sIdx) => (
          <span
            key={sIdx}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-brand-secondary group-hover:border-surface-borderLight transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-[10px] font-mono text-brand-muted">
        <span className="truncate max-w-[160px]">{talent.location}</span>
        <span className="text-accent/90 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-accent" />
          <span>VERIFIED LEAD</span>
        </span>
      </div>
    </Link>
  );
}

export function CreativeTalentMotion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Row 1: Moves smoothly toward the RIGHT on scroll
  const row1X = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ["0%", "0%"] : ["-14%", "8%"]
  );

  // Row 2: Moves smoothly toward the LEFT on scroll
  const row2X = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ["0%", "0%"] : ["8%", "-14%"]
  );

  // Centerpiece featured card: subtle scaling & controlled rotation
  const featuredScale = useTransform(
    scrollYProgress,
    [0.2, 0.5, 0.8],
    shouldReduceMotion ? [1, 1, 1] : [0.92, 1.0, 0.94]
  );
  const featuredRotate = useTransform(
    scrollYProgress,
    [0.2, 0.5, 0.8],
    shouldReduceMotion ? [0, 0, 0] : [-1.5, 0, 1.5]
  );

  return (
    <section
      ref={containerRef}
      className="py-24 sm:py-32 relative bg-background border-b border-surface-border overflow-x-clip"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-violet/5 blur-[120px] top-1/4 -left-48" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] bottom-1/4 -right-48" />
        <div className="absolute inset-0 bg-subtle-grid opacity-30" />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 sm:mb-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block">
                RICOZ / CREATIVE NETWORK
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05] uppercase font-sans">
                CREATIVE<br />
                TALENT<br />
                <span className="text-accent">IN MOTION.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm sm:text-base text-brand-secondary leading-relaxed">
              Meet senior creative directors, brand identity designers and typography specialists selected for ambitious rebranding projects.
            </p>
          </div>
        </div>

        {/* Row 1 */}
        <div className="mb-6 sm:mb-8 overflow-hidden">
          <motion.div
            style={{ x: row1X }}
            className="flex items-center gap-5 sm:gap-6 pl-4 sm:pl-8 will-change-transform"
          >
            {ROW_ONE_TALENT.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
            {ROW_ONE_TALENT.slice(0, 2).map((talent) => (
              <TalentCard key={`dup1-${talent.id}`} talent={talent} />
            ))}
          </motion.div>
        </div>

        {/* Featured Centerpiece Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12 flex justify-center">
          <motion.div
            style={{ scale: featuredScale, rotate: featuredRotate }}
            className="w-full max-w-2xl bg-surface-elevated/90 border border-surface-border hover:border-accent/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group transition-all"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-radial-gradient from-accent/10 via-transparent to-transparent pointer-events-none rounded-2xl" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-border/60">
              <div className="flex items-center gap-2 font-mono text-xs text-accent">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="font-semibold uppercase tracking-wider">FEATURED REBRAND SPECIALIST</span>
              </div>
              <div className="font-mono text-[11px] text-brand-muted uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                <span>ACTIVE CAPACITY • Q1/Q2</span>
              </div>
            </div>

            <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-8 space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  Alex Morgan
                </h3>
                <p className="text-xs sm:text-sm text-brand-secondary font-mono">
                  Principal Creative Director • 15+ years enterprise leadership
                </p>
                <p className="text-xs text-brand-muted leading-relaxed pt-1">
                  Specialized in global tech transformations, monolithic identity systems, and custom typographic engineering for venture-backed unicorns and FTSE 100 conglomerates.
                </p>
              </div>

              <div className="sm:col-span-4 p-4 rounded-xl bg-surface border border-surface-border text-center space-y-1">
                <div className="text-3xl font-extrabold text-accent font-mono">
                  98%
                </div>
                <div className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">
                  DIRECTOR COMPATIBILITY
                </div>
                <div className="pt-2 text-[10px] font-mono text-brand-secondary">
                  5 Rebrands Delivered
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {["Fintech", "Robotics", "Enterprise SaaS", "Luxury"].map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-brand-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/designers/des-1"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-accent text-background font-mono text-xs font-semibold hover:bg-accent-hover transition-colors shrink-0"
              >
                <span>View Full Studio Case Studies</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Row 2 */}
        <div className="overflow-hidden">
          <motion.div
            style={{ x: row2X }}
            className="flex items-center gap-5 sm:gap-6 pl-4 sm:pl-8 will-change-transform"
          >
            {ROW_TWO_TALENT.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
            {ROW_TWO_TALENT.slice(0, 2).map((talent) => (
              <TalentCard key={`dup2-${talent.id}`} talent={talent} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
