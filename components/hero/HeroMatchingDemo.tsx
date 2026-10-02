"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Plus,
  Check,
  RotateCcw,
  Play,
  Pause,
  Layers,
  Briefcase,
  Star,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";

// Talent Profiles specified for the Hero Demo
interface DemoTalent {
  id: string;
  name: string;
  role: string;
  match: number;
  initials: string;
  experience: string;
  skills: string[];
  location: string;
  orbitClass: string; // Placement in desktop constellation
  coords: { x: number; y: number }; // For SVG connection lines relative to 500x480 coordinate space
}

const DEMO_TALENT: DemoTalent[] = [
  {
    id: "tal-1",
    name: "Sarah Kim",
    role: "Brand Designer",
    match: 94,
    initials: "SK",
    experience: "10+ yrs • Ex-Pentagram",
    skills: ["Brand Identity", "Visual Systems", "Packaging"],
    location: "New York",
    orbitClass: "top-4 right-2 sm:right-6",
    coords: { x: 380, y: 70 },
  },
  {
    id: "tal-2",
    name: "Alex Carter",
    role: "Creative Director",
    match: 91,
    initials: "AC",
    experience: "14+ yrs • Global Rebrand Lead",
    skills: ["Creative Direction", "Systems", "Typography"],
    location: "London",
    orbitClass: "bottom-8 right-2 sm:right-6",
    coords: { x: 380, y: 390 },
  },
  {
    id: "tal-3",
    name: "Priya Mehta",
    role: "UI/UX Designer",
    match: 87,
    initials: "PM",
    experience: "9+ yrs • Design Systems Lead",
    skills: ["UI/UX", "Design Systems", "Prototyping"],
    location: "San Francisco",
    orbitClass: "bottom-8 left-2 sm:left-6",
    coords: { x: 120, y: 390 },
  },
  {
    id: "tal-4",
    name: "David Chen",
    role: "Motion Designer",
    match: 83,
    initials: "DC",
    experience: "8+ yrs • 3D & Spatial Motion",
    skills: ["Motion Design", "3D Motion", "Brand Motion"],
    location: "Berlin",
    orbitClass: "top-4 left-2 sm:left-6",
    coords: { x: 120, y: 70 },
  },
];

const STAGES = [
  { id: 0, label: "Project Brief", subtitle: "Define requirements & goals" },
  { id: 1, label: "Analyzing", subtitle: "Verifying 4 key dimensions" },
  { id: 2, label: "Discovering", subtitle: "Vetting specialized roster" },
  { id: 3, label: "Smart Matching", subtitle: "Calculating compatibility" },
  { id: 4, label: "Match Found", subtitle: "Curated shortlist ready" },
];

export function HeroMatchingDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Animation Stage: 0 to 4
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hoveredTalentId, setHoveredTalentId] = useState<string | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([
    "tal-1",
    "tal-2",
    "tal-3",
  ]);

  // Subtle Mouse Parallax coordinates (-1 to 1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Auto-progress stages when playing
  useEffect(() => {
    if (!isPlaying) return;
    const stageDurations = [3200, 3000, 3000, 3200, 4500];
    const duration = stageDurations[currentStage] || 3200;

    const timer = setTimeout(() => {
      setCurrentStage((prev) => (prev + 1) % STAGES.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentStage, isPlaying]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredTalentId(null);
  };

  const toggleShortlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShortlistedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Center coordinate in 500x480 SVG space
  const centerHub = { x: 250, y: 230 };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[620px] mx-auto select-none"
    >
      {/* Background Soft Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full bg-accent/10 blur-[90px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-violet/10 blur-[80px]" />
      </div>

      {/* =====================================================================
          DESKTOP & TABLET VIEW (Interactive Constellation & Radar Matching)
      ===================================================================== */}
      <div className="hidden sm:block relative w-full h-[520px] rounded-2xl bg-surface/80 border border-surface-border backdrop-blur-md p-6 shadow-2xl overflow-hidden">
        {/* Subtle grid in background */}
        <div className="absolute inset-0 bg-subtle-grid opacity-25 pointer-events-none" />

        {/* Demo Header Bar with Live Indicator & Step Controls */}
        <div className="relative z-20 flex items-center justify-between pb-3 border-b border-surface-border/60 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-white font-semibold tracking-wider text-[11px] uppercase">
              RICOZ MATCH ENGINE // v3.2
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded bg-surface border border-surface-border text-brand-secondary text-[10px]">
              STAGE 0{currentStage + 1} / 05
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause demo" : "Play demo"}
              className="p-1.5 rounded bg-surface hover:bg-surface-elevated border border-surface-border hover:border-accent/40 text-brand-secondary hover:text-accent transition-colors"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => {
                setCurrentStage(0);
                setIsPlaying(true);
              }}
              aria-label="Restart demo"
              className="p-1.5 rounded bg-surface hover:bg-surface-elevated border border-surface-border hover:border-accent/40 text-brand-secondary hover:text-accent transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dynamic SVG Connection Lines & Particle Pulses */}
        <svg
          viewBox="0 0 500 480"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C8FF3D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection Lines from Center Hub to Talent Cards */}
          {DEMO_TALENT.map((talent) => {
            const isHovered = hoveredTalentId === talent.id;
            const isActive = currentStage >= 2;
            const isMatching = currentStage >= 3;

            return (
              <g key={`svg-line-${talent.id}`}>
                {/* Background base path */}
                <line
                  x1={centerHub.x}
                  y1={centerHub.y}
                  x2={talent.coords.x}
                  y2={talent.coords.y}
                  stroke={isHovered ? "#C8FF3D" : isActive ? "#2C303D" : "#1A1D24"}
                  strokeWidth={isHovered ? "2" : "1.2"}
                  strokeDasharray={isActive ? "4 4" : "2 2"}
                  opacity={isActive ? (isHovered ? 1 : 0.6) : 0.2}
                  className="transition-colors duration-300"
                />

                {/* Animated beam pulse when in Stage 3 or Stage 4 */}
                {isMatching && (
                  <motion.circle
                    r={isHovered ? "4" : "2.5"}
                    fill="#C8FF3D"
                    filter="url(#glowFilter)"
                    initial={{ cx: centerHub.x, cy: centerHub.y, opacity: 0 }}
                    animate={{
                      cx: [centerHub.x, talent.coords.x],
                      cy: [centerHub.y, talent.coords.y],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: talent.match % 3 * 0.4,
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Radar scan ring on matching stage */}
          {currentStage === 3 && (
            <motion.circle
              cx={centerHub.x}
              cy={centerHub.y}
              r="40"
              stroke="#C8FF3D"
              strokeWidth="1.5"
              fill="none"
              initial={{ r: 20, opacity: 0.8 }}
              animate={{ r: 180, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </svg>

        {/* Central RICOZ Matching Hub */}
        <motion.div
          style={{
            transform: shouldReduceMotion
              ? "none"
              : `translate(${mousePos.x * -6}px, ${mousePos.y * -6}px)`,
          }}
          className="absolute top-[230px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            {/* Outer rotating decorative rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-24 h-24 rounded-full border border-dashed border-surface-borderLight opacity-70"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-20 h-20 rounded-full border border-accent/20"
            />

            {/* Core Hub Badge */}
            <div className="relative w-16 h-16 rounded-full bg-surface-elevated border-2 border-accent/60 shadow-glow flex flex-col items-center justify-center p-2">
              <BrandMark size={24} withGlow={false} />
              <span className="text-[8px] font-mono font-bold tracking-widest text-accent uppercase mt-0.5">
                RICOZ
              </span>
            </div>
          </div>

          {/* Hub Status Tagline */}
          <div className="mt-3 px-3 py-1 rounded-full bg-surface/90 border border-surface-border backdrop-blur-md shadow-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-secondary">
              {currentStage === 0 && "Parsing Project Brief..."}
              {currentStage === 1 && "Verifying Requirements..."}
              {currentStage === 2 && "Filtering 400+ Designers..."}
              {currentStage === 3 && "Calculating Compatibility..."}
              {currentStage === 4 && "Deterministic Matches Found"}
            </span>
          </div>
        </motion.div>

        {/* Floating Interactive Talent Cards */}
        {DEMO_TALENT.map((talent) => {
          const isShortlisted = shortlistedIds.includes(talent.id);
          const isHovered = hoveredTalentId === talent.id;
          const isEntering = currentStage >= 2;

          return (
            <motion.div
              key={talent.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: isEntering ? 1 : 0.4,
                scale: isEntering ? (isHovered ? 1.05 : 1) : 0.9,
                y: isEntering
                  ? [0, talent.id === "tal-1" || talent.id === "tal-3" ? -4 : 4, 0]
                  : 0,
              }}
              transition={{
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: talent.match % 4 * 0.5,
                },
                scale: { duration: 0.2 },
                opacity: { duration: 0.4 },
              }}
              style={{
                transform: shouldReduceMotion
                  ? "none"
                  : `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
              }}
              onMouseEnter={() => setHoveredTalentId(talent.id)}
              onMouseLeave={() => setHoveredTalentId(null)}
              className={`absolute ${talent.orbitClass} z-30 w-[185px] sm:w-[210px] rounded-xl p-3 sm:p-3.5 transition-all duration-300 cursor-pointer ${
                isHovered
                  ? "bg-surface-elevated border-accent shadow-glow"
                  : "bg-surface/90 border-surface-border hover:border-surface-borderLight shadow-surface"
              } border backdrop-blur-md`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center font-mono text-[10px] font-bold text-accent">
                    {talent.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                      <span>{talent.name}</span>
                    </h4>
                    <p className="text-[10px] text-brand-muted font-mono leading-none mt-0.5">
                      {talent.role}
                    </p>
                  </div>
                </div>

                {/* Match Percentage counter */}
                <div
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight shrink-0 transition-colors ${
                    currentStage >= 3
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "bg-surface text-brand-muted border border-surface-border"
                  }`}
                >
                  {currentStage >= 3 ? `${talent.match}%` : "— %"}
                </div>
              </div>

              {/* Skills badges */}
              <div className="flex flex-wrap gap-1 my-2">
                {talent.skills.slice(0, 2).map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-surface-border text-brand-secondary"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Experience & Shortlist Action */}
              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-brand-muted truncate max-w-[100px]">
                  {talent.experience.split("•")[0]}
                </span>

                <button
                  onClick={(e) => toggleShortlist(talent.id, e)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-medium transition-all ${
                    isShortlisted
                      ? "bg-accent text-background font-semibold"
                      : "bg-surface-elevated text-brand-secondary hover:text-white border border-surface-border hover:border-accent/40"
                  }`}
                  title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                >
                  {isShortlisted ? (
                    <>
                      <Check className="w-2.5 h-2.5" />
                      <span>Shortlisted</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-2.5 h-2.5" />
                      <span>Shortlist</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Phase 0 & 1: Project Brief Card Overlay (Top-center / Left-aligned) */}
        <AnimatePresence>
          {(currentStage === 0 || currentStage === 1) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute top-14 left-1/2 -translate-x-1/2 z-40 w-[290px] sm:w-[320px] rounded-xl bg-surface-elevated/95 border border-accent/40 shadow-glow p-4 backdrop-blur-md"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-accent mb-2">
                <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" />
                  Active Project Brief
                </span>
                <span className="px-1.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent">
                  IN ANALYSIS
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-2">
                Premium Lifestyle Rebrand
              </h4>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-brand-secondary">
                  Brand Identity
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-brand-secondary">
                  UI/UX
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-brand-secondary">
                  Motion Design
                </span>
              </div>

              {/* Requirement Checkmarks */}
              <div className="pt-2 border-t border-surface-border/60">
                <p className="text-[10px] font-mono text-brand-muted mb-1.5">
                  {currentStage === 0
                    ? "Submitting project requirements..."
                    : "Analyzing project requirements..."}
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  {["Skills", "Experience", "Portfolio", "Availability"].map(
                    (req, rIdx) => (
                      <div
                        key={req}
                        className={`flex items-center gap-1.5 transition-colors duration-300 ${
                          currentStage === 1
                            ? "text-accent font-semibold"
                            : "text-brand-muted"
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3 h-3 ${
                            currentStage === 1 ? "text-accent" : "text-brand-muted/40"
                          }`}
                        />
                        <span>{req}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 4: Match Found & Shortlist Floating Panel */}
        <AnimatePresence>
          {currentStage === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="absolute bottom-14 left-1/2 -translate-x-1/2 z-40 w-[300px] sm:w-[340px] rounded-xl bg-surface-elevated/95 border border-accent/40 shadow-glow p-4 backdrop-blur-md"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-accent mb-2 pb-2 border-b border-surface-border/60">
                <span className="flex items-center gap-1.5 font-bold tracking-wider uppercase">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  MATCH FOUND // CURATED POD
                </span>
                <span className="text-white bg-accent/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                  READY
                </span>
              </div>

              <div className="text-[10px] font-mono text-brand-muted uppercase tracking-wider mb-2">
                YOUR SHORTLIST ({shortlistedIds.length} SPECIALISTS)
              </div>

              <div className="space-y-1.5">
                {DEMO_TALENT.filter((t) => shortlistedIds.includes(t.id)).map((t) => (
                  <div
                    key={`shortlist-${t.id}`}
                    className="flex items-center justify-between p-1.5 rounded bg-surface border border-surface-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-white font-medium text-xs">{t.name}</span>
                      <span className="text-[10px] font-mono text-brand-muted">
                        • {t.role}
                      </span>
                    </div>
                    <span className="text-accent font-mono text-[11px] font-bold">
                      {t.match}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-surface-border/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-brand-secondary">
                  Ready to kickoff project
                </span>
                <Link
                  href="/designers"
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-accent hover:text-accent-hover font-semibold"
                >
                  <span>Review Profiles</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Interactive Step Navigator */}
        <div className="absolute bottom-2 left-0 right-0 z-20 flex items-center justify-center gap-1.5 px-4">
          {STAGES.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                setCurrentStage(st.id);
                setIsPlaying(false);
              }}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-all flex items-center gap-1 ${
                currentStage === st.id
                  ? "bg-accent/20 text-accent border border-accent/40 font-bold"
                  : "bg-surface/60 text-brand-muted hover:text-white border border-transparent"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentStage === st.id ? "bg-accent" : "bg-brand-muted"
                }`}
              />
              <span className="hidden md:inline">{st.label}</span>
              <span className="md:hidden">0{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          MOBILE VIEW (Vertical Storytelling & Step-by-Step Flow)
          PROJECT ↓ ANALYZING ↓ MATCHING ↓ 94% MATCH ↓ PROFILE ↓ SHORTLISTED ✓
      ===================================================================== */}
      <div className="block sm:hidden w-full rounded-2xl bg-surface/90 border border-surface-border p-4 shadow-xl relative overflow-hidden">
        {/* Step indicator header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border text-xs font-mono">
          <div className="flex items-center gap-1.5 text-accent text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>RICOZ MATCH DEMO</span>
          </div>
          <div className="flex items-center gap-1">
            {STAGES.map((st) => (
              <button
                key={`m-dot-${st.id}`}
                onClick={() => setCurrentStage(st.id)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStage === st.id ? "bg-accent w-4" : "bg-surface-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 1. PROJECT STAGE */}
        <div className="space-y-3">
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              currentStage === 0
                ? "bg-surface-elevated border-accent/40 shadow-glow"
                : "bg-surface border-surface-border opacity-70"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-accent mb-1">
              <span>01 // PROJECT BRIEF</span>
              <span className="font-bold">REQUIREMENTS</span>
            </div>
            <h4 className="text-sm font-bold text-white">Premium Lifestyle Rebrand</h4>
            <div className="flex flex-wrap gap-1 mt-2">
              {["Brand Identity", "UI/UX", "Motion Design"].map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-muted border border-surface-border text-brand-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Vertical Connector Arrow */}
          <div className="flex justify-center text-accent/60 -my-1">
            <span className="font-mono text-xs">↓</span>
          </div>

          {/* 2. ANALYZING STAGE */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              currentStage === 1
                ? "bg-surface-elevated border-accent/40 shadow-glow"
                : "bg-surface border-surface-border opacity-70"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-accent mb-1">
              <span>02 // ANALYZING</span>
              <span className="text-accent animate-pulse">EVALUATING</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
              {["Skills", "Experience", "Portfolio", "Availability"].map((check) => (
                <div key={check} className="flex items-center gap-1.5 text-brand">
                  <CheckCircle2 className="w-3 h-3 text-accent" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Connector Arrow */}
          <div className="flex justify-center text-accent/60 -my-1">
            <span className="font-mono text-xs">↓</span>
          </div>

          {/* 3. MATCHING & TOP PROFILE CARD */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              currentStage >= 2
                ? "bg-surface-elevated border-accent/60 shadow-glow"
                : "bg-surface border-surface-border opacity-70"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-2">
              <span className="text-accent font-bold">03 // MATCH FOUND</span>
              <span className="px-2 py-0.5 rounded bg-accent/20 text-accent font-bold font-mono text-xs">
                94% MATCH
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-surface border border-accent/30 flex items-center justify-center font-mono text-xs font-bold text-accent">
                SK
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">Sarah Kim</h4>
                <p className="text-[11px] text-brand-secondary font-mono">
                  Brand Designer • Ex-Pentagram
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-2.5">
              {["Brand Identity", "Visual Systems", "Packaging"].map((s) => (
                <span
                  key={s}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-surface-border text-brand-secondary"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Shortlist status */}
            <div className="mt-3 pt-2.5 border-t border-surface-border/60 flex items-center justify-between text-[10px] font-mono">
              <span className="text-accent flex items-center gap-1 font-semibold">
                <Check className="w-3 h-3 text-accent" />
                SHORTLISTED ✓
              </span>
              <span className="text-brand-muted">+ 2 More Specialists</span>
            </div>
          </div>

          {/* Bottom Shortlist Summary */}
          <div className="pt-2 flex items-center justify-between text-xs font-mono">
            <Link
              href="/designers"
              className="w-full py-2 px-3 rounded bg-accent text-background text-center font-semibold flex items-center justify-center gap-1 text-xs"
            >
              <span>Explore Matched Creative Talent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
