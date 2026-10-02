"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  Calendar,
  Lock,
} from "lucide-react";

interface PodTemplate {
  id: string;
  name: string;
  focus: string;
  duration: string;
  matchScore: number;
  roles: {
    title: string;
    talentName: string;
    experience: string;
    rate: string;
    avatar: string;
    skills: string[];
  }[];
  deliverables: string[];
}

const POD_TEMPLATES: PodTemplate[] = [
  {
    id: "pod-1",
    name: "Enterprise Rebrand Pod",
    focus: "Comprehensive visual identity, global guidelines & variable type system",
    duration: "8–12 Weeks",
    matchScore: 98,
    roles: [
      {
        title: "Principal Creative Director",
        talentName: "Alex Morgan",
        experience: "15+ yrs • Ex-Pentagram",
        rate: "$1,800/day",
        avatar: "AM",
        skills: ["Brand Strategy", "Executive Narrative", "Identity Systems"],
      },
      {
        title: "Senior Identity & Type Lead",
        talentName: "Sofia Bennett",
        experience: "11+ yrs • Type Principal",
        rate: "$1,450/day",
        avatar: "SB",
        skills: ["Custom Typography", "Logotypes", "Design Tokens"],
      },
      {
        title: "Brand Motion & Systems",
        talentName: "Daniel Kim",
        experience: "13+ yrs • Spatial Lead",
        rate: "$1,500/day",
        avatar: "DK",
        skills: ["3D Creative", "Motion Systems", "Micro-interactions"],
      },
    ],
    deliverables: [
      "Master Brand Guidelines & Vector System",
      "Optical Variable Font Family (4 Weights)",
      "Global Motion Toolkit & Lottie Assets",
      "Executive Pitch Deck & Collateral",
    ],
  },
  {
    id: "pod-2",
    name: "Digital Product & Design System Pod",
    focus: "Modern enterprise SaaS overhaul, high-density UI & multi-platform tokens",
    duration: "6–10 Weeks",
    matchScore: 96,
    roles: [
      {
        title: "Lead UI/UX & Systems Architect",
        talentName: "Maya Chen",
        experience: "12+ yrs • Ex-Collins",
        rate: "$1,600/day",
        avatar: "MC",
        skills: ["Design Tokens", "Component Architecture", "Complex Workflows"],
      },
      {
        title: "Senior Product Designer",
        talentName: "Marcus Reed",
        experience: "10+ yrs • Scaleup Lead",
        rate: "$1,350/day",
        avatar: "MR",
        skills: ["Web & Mobile UX", "Figma Variables", "WCAG AAA Systems"],
      },
      {
        title: "Creative Technologist",
        talentName: "David Chen",
        experience: "8+ yrs • Spatial Motion",
        rate: "$1,400/day",
        avatar: "DC",
        skills: ["Interactive Prototyping", "Code-ready Specs", "3D Icons"],
      },
    ],
    deliverables: [
      "Full Figma Multi-Brand Design System",
      "250+ Production React / Tailwind Tokens",
      "Interactive High-Fidelity Prototypes",
      "Developer Handoff Documentation",
    ],
  },
  {
    id: "pod-3",
    name: "Luxury Packaging & Tactile Identity",
    focus: "Physical packaging, unboxing architecture, embossing & sustainable materials",
    duration: "6–8 Weeks",
    matchScore: 95,
    roles: [
      {
        title: "Creative Director (Luxury)",
        talentName: "David Laurent",
        experience: "16+ yrs • Luxury Lead",
        rate: "$1,750/day",
        avatar: "DL",
        skills: ["Luxury Brand Heritage", "Art Direction", "Bespoke Packaging"],
      },
      {
        title: "Tactile & Materials Specialist",
        talentName: "Nora Williams",
        experience: "12+ yrs • Tactile Specialist",
        rate: "$1,400/day",
        avatar: "NW",
        skills: ["Sustainable Papers", "Embossing & Foils", "Die-line Engineering"],
      },
    ],
    deliverables: [
      "Custom Packaging Structural Die-lines",
      "Material & Substrate Specifications",
      "Supplier & Print Production Guidance",
      "3D Product Renderings & Mockups",
    ],
  },
];

export function TeamBuilderVisual() {
  const [activePodId, setActivePodId] = useState<string>("pod-1");

  const activePod = POD_TEMPLATES.find((p) => p.id === activePodId) || POD_TEMPLATES[0];

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-6 sm:p-10 shadow-surface overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-radial-gradient from-accent/10 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-radial-gradient from-violet/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      {/* Header controls: Switch Pod Presets */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-surface-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-1">
            CURATED TEAM FORMATION
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Build your dedicated creative pod
          </h3>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Pre-vetted specialists aligned by complementary skills, unified contracts, and guaranteed bandwidth.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-2">
          {POD_TEMPLATES.map((pod) => (
            <button
              key={pod.id}
              onClick={() => setActivePodId(pod.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activePodId === pod.id
                  ? "bg-accent text-background font-bold shadow-glow"
                  : "bg-surface-elevated text-brand-secondary hover:text-white border border-surface-border hover:border-surface-borderLight"
              }`}
            >
              {pod.name.split(" ")[0]} Pod
            </button>
          ))}
        </div>
      </div>

      {/* Main Pod Visual Layout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePod.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left: Pod Roster Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-brand-muted pb-1">
              <span>POD SPECIALISTS ({activePod.roles.length})</span>
              <span className="text-accent font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                VERIFIED COLLABORATIVE FIT
              </span>
            </div>

            {activePod.roles.map((member, mIdx) => (
              <div
                key={mIdx}
                className="bg-surface-elevated/90 border border-surface-border hover:border-accent/40 rounded-xl p-4 sm:p-5 transition-all duration-300 group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-surface border border-accent/30 text-accent font-mono text-sm font-bold flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-accent transition-colors">
                        {member.talentName}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">
                        LEAD
                      </span>
                    </div>
                    <p className="text-xs text-brand-secondary font-mono">
                      {member.title}
                    </p>
                    <p className="text-[11px] text-brand-muted font-mono mt-0.5">
                      {member.experience}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-border/50">
                  <span className="text-[10px] font-mono text-brand-muted uppercase">
                    Rate Benchmark
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {member.rate}
                  </span>
                  <div className="flex gap-1 mt-1.5">
                    {member.skills.slice(0, 2).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-surface-border text-brand-secondary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Pod Summary, Deliverables & Contract Governance */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-background-secondary border border-surface-border rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <div>
                  <span className="text-[10px] font-mono uppercase text-brand-muted tracking-wider block">
                    PROJECT SCOPE
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {activePod.name}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-accent font-mono block">
                    {activePod.matchScore}%
                  </span>
                  <span className="text-[9px] font-mono text-brand-muted uppercase tracking-wider">
                    POD FIT RATING
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-brand-secondary font-mono">
                  <span>Estimated Timeline</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    {activePod.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between text-brand-secondary font-mono">
                  <span>Contract Structure</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-accent" />
                    Consolidated Master NDA
                  </span>
                </div>
                <div className="flex items-center justify-between text-brand-secondary font-mono">
                  <span>Escrow Protection</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    Milestone-gated Payouts
                  </span>
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div className="pt-4 border-t border-surface-border">
                <span className="text-[10px] font-mono uppercase text-brand-muted tracking-wider block mb-2.5">
                  CORE DELIVERABLES INCLUDED
                </span>
                <div className="space-y-2">
                  {activePod.deliverables.map((item, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-start gap-2 text-xs text-brand-secondary"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-surface-border">
                <Link
                  href="/dashboard/company/projects/new"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-accent text-background font-mono text-xs font-bold hover:bg-accent-hover transition-colors shadow-glow"
                >
                  <span>Shortlist & Request This Pod</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
