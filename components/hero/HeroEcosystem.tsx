"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ArrowRight, Plus, Check } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";

// 5-Card Radial Talent Definition
interface RadialTalent {
  id: string;
  name: string;
  role: string;
  match: number;
  initials: string;
  skills: string;
  angleDeg: number; // Angle in degrees (-90 = Top)
  sequenceOrder: number; // 1 to 5: Sarah -> David -> Alex -> Priya -> Maya
}

// 5 evenly spaced angles around 360° (72° interval)
// Top: David Chen (-90°)
// Upper-Right: Alex Carter (-18°)
// Lower-Right: Priya Mehta (+54°)
// Lower-Left: Maya Patel (+126°)
// Upper-Left: Sarah Kim (+198° or -162°)
const TALENT_LIST: RadialTalent[] = [
  {
    id: "david",
    name: "David Chen",
    role: "Motion Designer",
    match: 83,
    initials: "DC",
    skills: "3D Animation • Spatial",
    angleDeg: -90,
    sequenceOrder: 2,
  },
  {
    id: "alex",
    name: "Alex Carter",
    role: "Creative Director",
    match: 91,
    initials: "AC",
    skills: "Creative Direction • Systems",
    angleDeg: -18,
    sequenceOrder: 3,
  },
  {
    id: "priya",
    name: "Priya Mehta",
    role: "UI/UX Designer",
    match: 87,
    initials: "PM",
    skills: "Design Tokens • Prototyping",
    angleDeg: 54,
    sequenceOrder: 4,
  },
  {
    id: "maya",
    name: "Maya Patel",
    role: "Art Director",
    match: 89,
    initials: "MP",
    skills: "Editorial Systems • Art Direction",
    angleDeg: 126,
    sequenceOrder: 5,
  },
  {
    id: "sarah",
    name: "Sarah Kim",
    role: "Brand Designer",
    match: 94,
    initials: "SK",
    skills: "Brand Systems • Packaging",
    angleDeg: 198,
    sequenceOrder: 1,
  },
];

// Exactly 5 Floating Role-Label Metadata Pills (positioned around the 5 talent cards)
interface FloatingRolePill {
  id: string;
  text: string;
  style: React.CSSProperties;
  floatY: number[];
  duration: number;
  delay: number;
}

const ROLE_PILLS: FloatingRolePill[] = [
  {
    id: "motion",
    text: "Motion Design",
    style: { top: "5%", left: "24%" },
    floatY: [-3, 3, -3],
    duration: 4.2,
    delay: 0,
  },
  {
    id: "brand",
    text: "Brand Identity",
    style: { top: "51%", left: "4%" },
    floatY: [3, -3, 3],
    duration: 4.8,
    delay: 0.6,
  },
  {
    id: "creative",
    text: "Creative Direction",
    style: { top: "24%", right: "4%" },
    floatY: [-3, 3, -3],
    duration: 5.1,
    delay: 0.3,
  },
  {
    id: "art",
    text: "Art Direction",
    style: { top: "89%", left: "14%" },
    floatY: [3, -3, 3],
    duration: 4.5,
    delay: 0.5,
  },
  {
    id: "uiux",
    text: "UI/UX Design",
    style: { top: "89%", right: "14%" },
    floatY: [-3, 3, -3],
    duration: 5.4,
    delay: 0.9,
  },
];

export function HeroEcosystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Controlled Animation Sequence:
  // 1: Sarah -> RICOZ
  // 2: David -> RICOZ
  // 3: Alex -> RICOZ
  // 4: Priya -> RICOZ
  // 5: Maya -> RICOZ
  // 6: All Connected -> Atomic RICOZ core pulses & "MATCH FOUND" appears
  // 0: Reset
  const [animStep, setAnimStep] = useState<number>(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [shortlisted, setShortlisted] = useState<string[]>(["sarah", "alex"]);

  // Sequential progression timer
  useEffect(() => {
    const stepDurations = [700, 1000, 1000, 1000, 1000, 1000, 3200];
    const timer = setTimeout(() => {
      setAnimStep((prev) => (prev >= 6 ? 0 : prev + 1));
    }, stepDurations[animStep] || 1000);

    return () => clearTimeout(timer);
  }, [animStep]);

  const toggleShortlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShortlisted((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // =========================================================================
  // MATHEMATICAL RADIAL GEOMETRY
  // All 5 cards share the EXACT SAME RADIUS from the center (50%, 50%)
  // =========================================================================
  const RADIUS_SVG = 345; // Radial distance to card centers in 1000x1000 coordinate space
  const RADIUS_LINE_START = 270; // Distance from center where connection line begins at card boundary
  const RADIUS_PERCENT = 34.5; // Radial distance in CSS container percentage

  // Precompute mathematical positions for all 5 cards
  const cardsData = TALENT_LIST.map((talent) => {
    const rad = (talent.angleDeg * Math.PI) / 180;
    const cosVal = Math.cos(rad);
    const sinVal = Math.sin(rad);

    // CSS Percentage coordinate (anchored at 50%, 50%)
    const cssLeft = 50 + cosVal * RADIUS_PERCENT;
    const cssTop = 50 + sinVal * RADIUS_PERCENT;

    // SVG coordinates in 1000x1000 space
    const cardSvgX = 500 + cosVal * RADIUS_SVG;
    const cardSvgY = 500 + sinVal * RADIUS_SVG;

    // Line start (card boundary):
    const lineStartX = 500 + cosVal * RADIUS_LINE_START;
    const lineStartY = 500 + sinVal * RADIUS_LINE_START;

    // Line end: Exact mathematical center of RICOZ core (500, 500)
    const lineEndX = 500;
    const lineEndY = 500;

    return {
      ...talent,
      rad,
      cssLeft: `${cssLeft.toFixed(3)}%`,
      cssTop: `${cssTop.toFixed(3)}%`,
      cardSvgX: Number(cardSvgX.toFixed(1)),
      cardSvgY: Number(cardSvgY.toFixed(1)),
      lineStartX: Number(lineStartX.toFixed(1)),
      lineStartY: Number(lineStartY.toFixed(1)),
      lineEndX,
      lineEndY,
    };
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[640px] mx-auto select-none"
    >
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full blur-[140px] opacity-35 bg-radial-gradient from-accent/25 via-violet/15 to-transparent" />
      </div>

      {/* =========================================================================
          DESKTOP & TABLET: PERFECT RADIAL 5-CARD TALENT MATCHING NETWORK
          Center: RICOZ "R" node at (50%, 50%) with Atomic / Molecular Intelligence Core
          Perimeter: 5 cards equally spaced at 72° on a uniform radius
      ========================================================================= */}
      <div className="hidden sm:block relative w-full h-[600px] lg:h-[640px]">
        {/* Exactly 5 Floating Role-Label Metadata Pills (positioned around the 5 talent cards) */}
        {ROLE_PILLS.map((pill) => (
          <motion.div
            key={pill.id}
            style={pill.style}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: pill.floatY,
                    opacity: [0.7, 0.92, 0.7],
                  }
            }
            transition={{
              duration: pill.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: pill.delay,
            }}
            whileHover={{ y: -3, opacity: 1, scale: 1.04 }}
            className="absolute z-15 pointer-events-auto hidden md:block cursor-default group"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/90 hover:bg-surface-elevated/95 backdrop-blur-md border border-white/10 hover:border-accent/40 shadow-sm hover:shadow-[0_0_15px_rgba(200,255,61,0.25)] transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_#C8FF3D] shrink-0" />
              <span className="text-[10px] font-mono tracking-wider text-brand-secondary group-hover:text-white uppercase transition-colors whitespace-nowrap">
                {pill.text}
              </span>
            </div>
          </motion.div>
        ))}

        {/* =====================================================================
            RADIAL CONNECTION LINES SVG
            Converges strictly into the mathematical center of the network (500, 500)
        ===================================================================== */}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 5 STRAIGHT RADIAL CONNECTION LINES */}
          {cardsData.map((talent) => {
            const isConnected = animStep >= talent.sequenceOrder || animStep === 6;
            const isCurrentlyConnecting = animStep === talent.sequenceOrder;
            const isHovered = hoveredId === talent.id;

            return (
              <g key={`radial-line-${talent.id}`}>
                {/* Straight Base Line terminating at exact center (500, 500) */}
                <line
                  x1={talent.lineStartX}
                  y1={talent.lineStartY}
                  x2={talent.lineEndX}
                  y2={talent.lineEndY}
                  stroke={
                    isHovered || isConnected
                      ? "#C8FF3D"
                      : "#242733"
                  }
                  strokeWidth={isHovered || isCurrentlyConnecting ? "2.5" : "1.5"}
                  strokeDasharray={isConnected ? "none" : "4 5"}
                  opacity={isConnected ? 0.95 : 0.3}
                  className="transition-all duration-300"
                />

                {/* Card Edge Endpoint Dot */}
                <circle
                  cx={talent.lineStartX}
                  cy={talent.lineStartY}
                  r={isHovered ? "4" : "2.5"}
                  fill={isConnected ? "#C8FF3D" : "#323746"}
                  opacity={isConnected ? 1 : 0.4}
                />

                {/* Traveling Signal Particle moving along line toward RICOZ core center */}
                {(isCurrentlyConnecting || animStep === 6) && !shouldReduceMotion && (
                  <motion.circle
                    r="3.5"
                    fill="#C8FF3D"
                    filter="url(#nodeGlow)"
                    initial={{
                      cx: talent.lineStartX,
                      cy: talent.lineStartY,
                      opacity: 0,
                    }}
                    animate={{
                      cx: [talent.lineStartX, talent.lineEndX],
                      cy: [talent.lineStartY, talent.lineEndY],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Central Radar Pulse Wave radiating from (500, 500) when all 5 are connected */}
          {animStep === 6 && !shouldReduceMotion && (
            <motion.circle
              cx="500"
              cy="500"
              r="40"
              stroke="#C8FF3D"
              strokeWidth="1.5"
              fill="none"
              initial={{ r: 40, opacity: 0.8 }}
              animate={{ r: 160, opacity: 0 }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </svg>

        {/* =====================================================================
            CENTRAL MATCHING CORE CONTAINER (One Single Fixed Center Point)
            Anchor for:
            - Layer 1: Ambient Background Glow
            - Layer 2: Orbital Rings (Orbit 1, 2, 3, 4)
            - Layer 3: Traveling Electron Particles
            - Layer 4: Stationary Circular RICOZ Core (80px x 80px)
            - Layer 5: Static R Logo & RICOZ Wordmark
            - Layer 6: MATCH FOUND Status Badge (Positioned strictly below core)
        ===================================================================== */}
        <div
          id="matching-core"
          className="absolute pointer-events-none z-20"
          style={{
            position: "absolute",
            inset: "50% auto auto 50%",
            transform: "translate(-50%, -50%)",
            width: "220px",
            height: "220px",
          }}
        >
          {/* Layer 1: Ambient Background Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            {/* Breathing soft glow */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? { opacity: 0.25 }
                  : {
                      opacity: [0.18, 0.38, 0.18],
                      scale: [0.94, 1.06, 0.94],
                    }
              }
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-36 h-36 rounded-full bg-accent/20 blur-xl pointer-events-none"
            />
            {/* Static inner diffusion glow */}
            <div className="absolute w-24 h-24 rounded-full bg-accent/15 blur-md pointer-events-none" />
          </div>

          {/* Layer 2 & 3: Orbital Rings & Traveling Particles SVG (Centered at 0, 0) */}
          <svg
            viewBox="-110 -110 220 220"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            <defs>
              <filter id="orbitGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="coreParticleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Orbit 1: 0° tilt ellipse (~120px diameter) */}
            <motion.g
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "0px 0px" }}
            >
              <ellipse
                cx="0"
                cy="0"
                rx="60"
                ry="40"
                fill="none"
                stroke="#C8FF3D"
                strokeWidth="1"
                strokeOpacity={animStep === 6 ? "0.6" : "0.32"}
                filter="url(#orbitGlow)"
              />
              {/* Traveling particles on Orbit 1 */}
              <circle
                cx="60"
                cy="0"
                r="2.5"
                fill="#C8FF3D"
                filter="url(#coreParticleGlow)"
              />
              <circle cx="-60" cy="0" r="2" fill="#C8FF3D" opacity="0.85" />
            </motion.g>

            {/* Orbit 2: 60° tilt ellipse (~142px diameter) */}
            <motion.g
              animate={shouldReduceMotion ? {} : { rotate: -360 }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "0px 0px" }}
            >
              <ellipse
                cx="0"
                cy="0"
                rx="71"
                ry="44"
                transform="rotate(60 0 0)"
                fill="none"
                stroke="#C8FF3D"
                strokeWidth="1"
                strokeOpacity={animStep === 6 ? "0.55" : "0.28"}
                filter="url(#orbitGlow)"
              />
              {/* Traveling particles on Orbit 2 (deterministic constants) */}
              <circle
                cx="35.5"
                cy="61.5"
                r="2.5"
                fill="#C8FF3D"
                filter="url(#coreParticleGlow)"
              />
              <circle
                cx="-35.5"
                cy="-61.5"
                r="2"
                fill="#C8FF3D"
                opacity="0.85"
              />
            </motion.g>

            {/* Orbit 3: 120° tilt ellipse (~164px diameter) */}
            <motion.g
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "0px 0px" }}
            >
              <ellipse
                cx="0"
                cy="0"
                rx="82"
                ry="46"
                transform="rotate(120 0 0)"
                fill="none"
                stroke="#C8FF3D"
                strokeWidth="1"
                strokeOpacity={animStep === 6 ? "0.5" : "0.25"}
                filter="url(#orbitGlow)"
              />
              {/* Traveling particles on Orbit 3 (deterministic constants) */}
              <circle
                cx="-41"
                cy="71"
                r="2.5"
                fill="#C8FF3D"
                filter="url(#coreParticleGlow)"
              />
              <circle
                cx="41"
                cy="-71"
                r="2"
                fill="#C8FF3D"
                opacity="0.85"
              />
            </motion.g>

            {/* Orbit 4: Outer concentric dashed energy ring (~184px diameter) */}
            <motion.g
              animate={shouldReduceMotion ? {} : { rotate: -360 }}
              transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "0px 0px" }}
            >
              <circle
                cx="0"
                cy="0"
                r="92"
                fill="none"
                stroke="rgba(200, 255, 61, 0.22)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <circle cx="92" cy="0" r="2" fill="#C8FF3D" opacity="0.75" />
              <circle cx="-92" cy="0" r="2" fill="#C8FF3D" opacity="0.75" />
            </motion.g>
          </svg>

          {/* Layer 4 & 5: Stationary Circular RICOZ Core (80px x 80px)
              Positioned exactly at the center of the 220px x 220px container */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-surface-elevated/95 backdrop-blur-md border-2 border-accent/80 flex flex-col items-center justify-center p-2 z-10 shadow-[0_0_24px_rgba(200,255,61,0.25)] select-none"
          >
            {/* Perfectly static R logo */}
            <BrandMark size={26} withGlow={false} />
            {/* Perfectly static RICOZ text */}
            <span className="font-mono text-[8px] font-extrabold tracking-widest text-accent uppercase mt-0.5 select-none">
              RICOZ
            </span>
          </div>

          {/* Layer 6: MATCH FOUND Status Badge
              Anchored strictly below the core so it NEVER offsets the vertical center */}
          <div
            className="absolute top-[calc(50%+52px)] left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5 whitespace-nowrap select-none"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                animStep === 6 ? "bg-accent animate-ping" : "bg-accent animate-pulse"
              }`}
            />
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-secondary font-semibold">
              {animStep === 6 ? "MATCH FOUND" : "SMART MATCHING"}
            </span>
          </div>
        </div>

        {/* =====================================================================
            EXACTLY 5 TALENT CARDS (Uniform Radial Distance, Strictly Horizontal)
        ===================================================================== */}
        {cardsData.map((talent) => {
          const isHovered = hoveredId === talent.id;
          const isConnected = animStep >= talent.sequenceOrder || animStep === 6;
          const isShortlisted = shortlisted.includes(talent.id);

          return (
            <div
              key={talent.id}
              style={{
                position: "absolute",
                top: talent.cssTop,
                left: talent.cssLeft,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredId(talent.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`z-30 transition-all duration-300 cursor-pointer ${
                isHovered ? "scale-105 z-40" : ""
              }`}
            >
              {/* Card Container: Strictly Horizontal, Fixed Uniform Size */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [-2, 2, -2] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: talent.sequenceOrder * 0.4,
                }}
                className={`w-[185px] sm:w-[195px] h-[84px] sm:h-[88px] rounded-xl p-3 sm:p-3.5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${
                  isHovered || isConnected
                    ? "bg-surface-elevated/95 border border-accent/60 shadow-glow"
                    : "bg-surface/80 border border-white/10 hover:border-white/20 shadow-2xl"
                }`}
              >
                {/* Header: Monogram Avatar, Name/Role, Match % */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-accent/30 text-accent font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {talent.initials}
                    </div>
                    <div className="truncate min-w-0">
                      <h4 className="text-xs font-bold text-white leading-tight truncate">
                        {talent.name}
                      </h4>
                      <p className="text-[10px] text-brand-muted font-mono leading-none mt-0.5 truncate">
                        {talent.role}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 transition-colors ${
                      isConnected
                        ? "bg-accent/15 text-accent border border-accent/30"
                        : "bg-white/5 text-brand-muted border border-white/10"
                    }`}
                  >
                    {talent.match}%
                  </span>
                </div>

                {/* Footer: Compact Skill Details & Quick Shortlist Toggle */}
                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-brand-secondary truncate max-w-[125px]">
                    {talent.skills}
                  </span>

                  <button
                    onClick={(e) => toggleShortlist(talent.id, e)}
                    className={`p-1 rounded transition-all ${
                      isShortlisted
                        ? "bg-accent text-background"
                        : "bg-white/5 text-brand-muted hover:text-white hover:bg-white/10"
                    }`}
                    title={isShortlisted ? "Shortlisted" : "Add to Shortlist"}
                  >
                    {isShortlisted ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <Plus className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          MOBILE VIEW: ATOMIC-INSPIRED COMPACT HIERARCHY
          Centered on RICOZ with 5 surrounding candidate cards
      ========================================================================= */}
      <div className="block sm:hidden w-full space-y-3 pt-2">
        {/* Project Header */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/10 text-xs font-mono">
          <span className="text-accent flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            PROJECT BRIEF
          </span>
          <span className="text-white font-medium">Premium Lifestyle Rebrand</span>
        </div>

        {/* Central Atomic RICOZ Node on Mobile */}
        <div className="relative p-4 rounded-xl bg-surface-elevated/90 border border-accent/50 shadow-glow text-center flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-accent/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-center gap-2 mb-1">
            <BrandMark size={22} withGlow={false} />
            <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              RICOZ INTELLIGENCE CORE
            </span>
          </div>
          <span className="font-mono text-[10px] text-accent uppercase tracking-wider font-semibold relative z-10">
            {animStep === 6 ? "MATCH FOUND // ACTIVE" : "SMART MATCHING"}
          </span>
        </div>

        {/* 5 Talent Cards on Mobile */}
        <div className="space-y-2">
          {TALENT_LIST.map((talent) => (
            <div
              key={`m-${talent.id}`}
              className={`p-3 rounded-xl transition-all flex items-center justify-between ${
                animStep >= talent.sequenceOrder || animStep === 6
                  ? "bg-surface/90 border border-accent/40 shadow-glow"
                  : "bg-surface/70 border border-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-accent/30 text-accent font-mono text-xs font-bold flex items-center justify-center">
                  {talent.initials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{talent.name}</h4>
                  <p className="text-[10px] text-brand-muted font-mono">{talent.role}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-accent">
                {talent.match}%
              </span>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="pt-2">
          <Link
            href="/designers"
            className="w-full py-2.5 px-3 rounded-xl bg-accent text-background text-center font-mono font-semibold flex items-center justify-center gap-1.5 text-xs shadow-glow"
          >
            <span>Explore Curated Creative Talent</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
