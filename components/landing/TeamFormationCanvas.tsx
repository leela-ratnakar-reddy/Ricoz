"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, ArrowRight, Sparkles, ShieldCheck, Lock } from "lucide-react";

interface PodCandidate {
  id: string;
  name: string;
  role: string;
  match: number;
  initials: string;
  pedigree: string;
  scope: string;
}

const CANDIDATES: PodCandidate[] = [
  {
    id: "c-1",
    name: "Sarah Kim",
    role: "Brand Designer",
    match: 94,
    initials: "SK",
    pedigree: "Ex-Pentagram • 10+ yrs",
    scope: "Master Identity & Packaging",
  },
  {
    id: "c-2",
    name: "Alex Carter",
    role: "Creative Director",
    match: 91,
    initials: "AC",
    pedigree: "Global Lead • 14+ yrs",
    scope: "Brand Strategy & Governance",
  },
  {
    id: "c-3",
    name: "Priya Mehta",
    role: "UI/UX Designer",
    match: 87,
    initials: "PM",
    pedigree: "Systems Lead • 9+ yrs",
    scope: "Figma Tokens & Design System",
  },
  {
    id: "c-4",
    name: "David Chen",
    role: "Motion Designer",
    match: 83,
    initials: "DC",
    pedigree: "Spatial Motion • 8+ yrs",
    scope: "Kinetic Identity & 3D Assets",
  },
];

export function TeamFormationCanvas() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["c-1", "c-2", "c-3"]);

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedTeam = CANDIDATES.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="w-full relative py-8 select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Specialist Selection */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-mono">
            <span className="text-brand-muted uppercase tracking-wider">
              CURATED SPECIALIST ROSTER
            </span>
            <span className="text-accent font-semibold">
              Click to toggle pod members
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {CANDIDATES.map((cand) => {
              const isSelected = selectedIds.includes(cand.id);

              return (
                <div
                  key={cand.id}
                  onClick={() => toggleCandidate(cand.id)}
                  className={`p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 backdrop-blur-md ${
                    isSelected
                      ? "bg-surface-elevated/90 border border-accent/40 shadow-glow"
                      : "bg-surface/30 border border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? "bg-accent text-background border-accent"
                          : "bg-surface-elevated text-white border-white/10"
                      }`}
                    >
                      {cand.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {cand.name}
                        </span>
                        <span className="text-[10px] font-mono text-brand-muted">
                          • {cand.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-secondary font-mono mt-0.5">
                        {cand.pedigree}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs text-brand-muted hidden sm:inline">
                      {cand.match}%
                    </span>
                    <button
                      type="button"
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-accent text-background"
                          : "bg-white/5 text-brand-muted hover:text-white"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: The Assembling Team — Open, Spacious, Cinematic */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-mono">
            <span className="text-accent uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              YOUR CREATIVE TEAM ({selectedTeam.length} SPECIALISTS)
            </span>
            <span className="text-brand-muted">
              {selectedTeam.length > 0 ? "98% Combined Fit" : "Select specialists"}
            </span>
          </div>

          {/* Formed Pod Canvas */}
          <div className="p-6 rounded-2xl bg-surface/40 border border-white/10 backdrop-blur-md relative overflow-hidden space-y-4">
            <AnimatePresence mode="popLayout">
              {selectedTeam.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center font-mono text-xs text-brand-muted"
                >
                  Select candidates from the left to assemble your creative pod.
                </motion.div>
              ) : (
                selectedTeam.map((member) => (
                  <motion.div
                    key={`team-${member.id}`}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="p-3.5 rounded-xl bg-surface-elevated/80 border border-accent/20 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 text-accent font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {member.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {member.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-accent/10 text-accent">
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-secondary font-mono mt-0.5">
                          Scope: {member.scope}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-accent">
                      {member.match}%
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Bottom Pod Governance Meta */}
            {selectedTeam.length > 0 && (
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-brand-secondary">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Consolidated Master NDA</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Single Escrow Agreement</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard/company/projects/new"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent text-background font-mono text-xs font-bold hover:bg-accent-hover transition-colors shadow-glow"
                  >
                    <span>Kickoff Project with this Team</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
