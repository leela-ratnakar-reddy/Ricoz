"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Lock, Layers, Award } from "lucide-react";

const STAGES = [
  {
    step: "01",
    label: "IDEA",
    title: "Strategic Problem Brief",
    desc: "Structured objectives, competitive positioning, and domain benchmarks defined under mutual NDA.",
  },
  {
    step: "02",
    label: "TEAM",
    title: "Curated Specialist Pod",
    desc: "Hand-matched Creative Directors and craft specialists aligned by proven sector history and verified bandwidth.",
  },
  {
    step: "03",
    label: "COLLABORATION",
    title: "Milestone-Gated Sprints",
    desc: "Real-time Slack/Figma alignment, weekly director reviews, and milestone-governed escrow payouts.",
  },
  {
    step: "04",
    label: "CREATIVE OUTPUT",
    title: "Monolithic Brand Delivery",
    desc: "Complete design token systems, optical variable typefaces, guidelines, and 100% intellectual property transfer.",
  },
];

const SHOWCASE_WORKS = [
  {
    title: "Northstar Cloud Global Identity",
    client: "Northstar Technologies",
    industry: "Enterprise Cloud",
    designer: "Alex Morgan (Creative Director)",
    image: "/images/case-studies/northstar-cloud.jpg",
    palette: ["#101218", "#181B24", "#C8FF3D", "#F5F5F0"],
    impact: "+64% enterprise perception rating post-acquisition",
    services: ["Creative Direction", "Design Systems", "Typography"],
  },
  {
    title: "Synthetix Genomic Intelligence",
    client: "Synthetix Bio",
    industry: "Biotechnology",
    designer: "Elena Rostova (Brand Identity Designer)",
    image: "/images/case-studies/synthetix-bio.jpg",
    palette: ["#0E0E14", "#181824", "#8B5CF6", "#F5F5F0"],
    impact: "$120M Series C repositioning & visual architecture",
    services: ["Visual Identity", "Algorithmic Geometry", "Guidelines"],
  },
  {
    title: "Atelier House Hospitality Typeface",
    client: "Atelier House",
    industry: "Luxury Hospitality",
    designer: "Sophie Chen (Typography Specialist)",
    image: "/images/case-studies/atelier-house.jpg",
    palette: ["#141210", "#26221C", "#C8FF3D", "#F5F5F0"],
    impact: "Proprietary 6-weight optical variable font family",
    services: ["Custom Typography", "Lettering", "Wayfinding"],
  },
];

export function CollaborationFlow() {
  const [activeStep, setActiveStep] = useState<number>(3);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full relative py-8 select-none">
      {/* Visual Pipeline Progression (IDEA -> TEAM -> COLLABORATION -> CREATIVE OUTPUT) */}
      <div className="pb-16 border-b border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAGES.map((st, idx) => {
            const isCurrent = activeStep === idx;

            return (
              <div
                key={st.step}
                onClick={() => setActiveStep(idx)}
                className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 relative backdrop-blur-md ${
                  isCurrent
                    ? "bg-surface-elevated/90 border border-accent/50 shadow-glow"
                    : "bg-surface/30 border border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isCurrent ? "text-accent" : "text-brand-muted"
                    }`}
                  >
                    STAGE // {st.step}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-accent/40" />
                </div>

                <div className="font-mono text-[10px] tracking-wider uppercase text-brand-muted mb-1">
                  {st.label}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mb-2 leading-tight">
                  {st.title}
                </h4>
                <p className="text-xs text-brand-secondary leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Creative Output Showcases */}
      <div className="pt-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-1">
              PROVEN RESULTS
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Delivered enterprise transformations.
            </h3>
          </div>
          <Link
            href="/designers"
            className="text-xs font-mono text-brand-secondary hover:text-accent flex items-center gap-1 transition-colors"
          >
            <span>Explore All 18 Studio Case Studies</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOWCASE_WORKS.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl bg-[#111114] border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* TOP: Category badge & Client Header */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5 bg-[#141418]">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-white/5 text-accent border border-accent/25">
                    {item.industry}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {item.client}
                  </span>
                </div>

                {/* MIDDLE: Large visual case-study image (55–65% prominence) */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 border-b border-white/5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  {/* Subtle dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* BOTTOM: Title, Lead, Impact */}
                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      Lead: {item.designer}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300">
                    <span className="text-[10px] font-mono uppercase text-accent font-semibold block mb-0.5">
                      Measured Impact
                    </span>
                    {item.impact}
                  </div>
                </div>
              </div>

              {/* Card Footer: Tags & Review Action */}
              <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs font-mono bg-[#0D0D10]/80">
                <div className="flex flex-wrap gap-1.5">
                  {item.services.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] text-zinc-400 px-2 py-0.5 rounded bg-white/5 border border-white/5"
                    >
                      #{s.replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
                <Link
                  href="/talent"
                  className="text-accent group-hover:text-accent-hover font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Review case study</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
