"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface MatchLink {
  id: string;
  requirement: string;
  category: string;
  designer: {
    id: string;
    name: string;
    role: string;
    pedigree: string;
    match: number;
    initials: string;
    keyDeliverable: string;
  };
}

const MATCH_LINKS: MatchLink[] = [
  {
    id: "req-1",
    requirement: "Brand Identity",
    category: "Strategic Foundation",
    designer: {
      id: "des-1",
      name: "Sarah Kim",
      role: "Brand Designer",
      pedigree: "Ex-Pentagram • 10+ yrs",
      match: 94,
      initials: "SK",
      keyDeliverable: "Monolithic logotype, custom guidelines & color science",
    },
  },
  {
    id: "req-2",
    requirement: "Visual Systems",
    category: "Architectural Scale",
    designer: {
      id: "des-2",
      name: "Alex Carter",
      role: "Creative Director",
      pedigree: "Global Lead • 14+ yrs",
      match: 91,
      initials: "AC",
      keyDeliverable: "Enterprise token matrix & typographic hierarchy",
    },
  },
  {
    id: "req-3",
    requirement: "UI/UX Architecture",
    category: "Digital Experience",
    designer: {
      id: "des-3",
      name: "Priya Mehta",
      role: "UI/UX Designer",
      pedigree: "Design Systems Lead • 9+ yrs",
      match: 87,
      initials: "PM",
      keyDeliverable: "Multi-platform Figma library & developer handoff",
    },
  },
  {
    id: "req-4",
    requirement: "Motion & Spatial",
    category: "Dynamic Brand Expression",
    designer: {
      id: "des-5",
      name: "David Chen",
      role: "Motion Designer",
      pedigree: "Spatial & 3D • 8+ yrs",
      match: 83,
      initials: "DC",
      keyDeliverable: "Kinetic brand behaviors, Lottie micro-interactions",
    },
  },
];

export function VisualMatchingCanvas() {
  const [activeLinkId, setActiveLinkId] = useState<string>("req-1");
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full relative py-8 select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Project Pill — Open & Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-10 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent font-mono text-xs font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>PROJECT: Premium Lifestyle Rebrand</span>
          </div>
          <span className="text-brand-muted text-xs font-mono hidden md:inline">
            // 4 Specialized Dimensions Mapped
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-brand-secondary">
          <span>Deterministic Compatibility</span>
          <span className="text-accent font-bold">98% Avg Confidence</span>
        </div>
      </div>

      {/* Open Interactive Constellation Rows */}
      <div className="pt-8 space-y-4">
        {MATCH_LINKS.map((item, idx) => {
          const isActive = activeLinkId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setActiveLinkId(item.id)}
              onMouseEnter={() => setActiveLinkId(item.id)}
              className={`relative rounded-2xl transition-all duration-300 p-4 sm:p-6 cursor-pointer backdrop-blur-md ${
                isActive
                  ? "bg-surface-elevated/90 border border-accent/50 shadow-glow"
                  : "bg-surface/30 border border-white/5 hover:border-white/15"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Left: Requirement Node */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-accent text-background"
                        : "bg-white/5 text-brand-muted border border-white/10"
                    }`}
                  >
                    0{idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-muted block">
                      {item.category}
                    </span>
                    <h4
                      className={`text-base sm:text-lg font-bold transition-colors ${
                        isActive ? "text-accent" : "text-white"
                      }`}
                    >
                      {item.requirement}
                    </h4>
                  </div>
                </div>

                {/* Center: Luminous Animated Connector Beam */}
                <div className="hidden md:flex md:col-span-3 items-center justify-center px-2">
                  <div className="relative w-full flex items-center">
                    <div
                      className={`h-[1.5px] w-full transition-colors duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-accent via-accent to-accent shadow-glow"
                          : "bg-white/10"
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        animate={shouldReduceMotion ? {} : { x: ["0%", "100%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute w-2 h-2 rounded-full bg-accent shadow-glow"
                      />
                    )}
                  </div>
                </div>

                {/* Right: Matched Creative Specialist */}
                <div className="md:col-span-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 border transition-all ${
                        isActive
                          ? "bg-surface-elevated border-accent text-accent shadow-glow"
                          : "bg-surface border-white/10 text-white"
                      }`}
                    >
                      {item.designer.initials}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {item.designer.name}
                        </span>
                        <span className="text-[10px] font-mono text-brand-muted truncate">
                          • {item.designer.role}
                        </span>
                      </div>
                      <p className="text-xs text-brand-secondary font-mono truncate mt-0.5">
                        {isActive
                          ? item.designer.keyDeliverable
                          : item.designer.pedigree}
                      </p>
                    </div>
                  </div>

                  {/* Match Percentage Pill */}
                  <div
                    className={`font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded-full shrink-0 transition-all ${
                      isActive
                        ? "bg-accent text-background shadow-glow"
                        : "bg-white/5 text-brand-muted border border-white/10"
                    }`}
                  >
                    {item.designer.match}% MATCH
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
