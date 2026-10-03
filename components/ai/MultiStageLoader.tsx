"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Sparkles, Cpu, Search, Users } from "lucide-react";

interface MultiStageLoaderProps {
  currentStage: number; // 1 to 4
}

const STAGES = [
  {
    id: 1,
    title: "Stage 01: Understanding Project & Business Goals",
    detail: "Analyzing commercial intent, brand maturity, audience, and creative objectives",
    icon: Sparkles
  },
  {
    id: 2,
    title: "Stage 02: Structuring Creative Requirements & Disciplines",
    detail: "Extracting explicit deliverables, inferred strategic needs, and required roles",
    icon: Cpu
  },
  {
    id: 3,
    title: "Stage 03: Matching RICOZ Talent Across 57 Profiles",
    detail: "Evaluating domain pedigree, skills overlap, and semantic portfolio evidence",
    icon: Search
  },
  {
    id: 4,
    title: "Stage 04: Assembling Recommended Creative Team",
    detail: "Composing complementary, project-specific creative specialists",
    icon: Users
  }
];

export const MultiStageLoader: React.FC<MultiStageLoaderProps> = ({ currentStage }) => {
  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-[#111114] border border-accent/25 p-7 shadow-2xl space-y-6 my-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto text-accent shadow-glow">
          <Cpu className="w-7 h-7 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          RICOZ AI is analyzing your project
        </h3>
        <p className="text-xs text-zinc-400 font-mono">
          Evaluating 57 verified creative practitioners across 19 disciplines
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {STAGES.map((st) => {
          const isDone = currentStage > st.id;
          const isActive = currentStage === st.id;
          const isPending = currentStage < st.id;
          const Icon = st.icon;

          return (
            <div
              key={st.id}
              className={`p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-3.5 ${
                isActive
                  ? "bg-[#181820] border-accent/40 shadow-[0_0_15px_rgba(184,255,0,0.08)]"
                  : isDone
                  ? "bg-[#141418] border-white/5 opacity-80"
                  : "bg-black/20 border-white/5 opacity-40"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-zinc-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold tracking-tight ${
                      isActive ? "text-accent" : isDone ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {st.title}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-mono text-accent animate-pulse uppercase">
                      Processing...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Complete
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed truncate">
                  {st.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
