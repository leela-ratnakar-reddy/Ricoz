"use client";

import React from "react";
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
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] p-7 sm:p-8 shadow-md space-y-6 my-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent shadow-xs">
          <Cpu className="w-7 h-7 animate-pulse" />
        </div>
        <h3 className="font-serif text-2xl font-normal text-espresso tracking-tight">
          RICOZ AI is analyzing your project
        </h3>
        <p className="text-xs text-muted font-mono">
          Evaluating 57 verified creative practitioners across 19 disciplines
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {STAGES.map((st) => {
          const isDone = currentStage > st.id;
          const isActive = currentStage === st.id;
          const isPending = currentStage < st.id;

          return (
            <div
              key={st.id}
              className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-3.5 ${
                isActive
                  ? "bg-white border-accent shadow-xs"
                  : isDone
                  ? "bg-white/80 border-[#E6D8CF]"
                  : "bg-white/30 border-[#E6D8CF]/60 opacity-60"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-taupe" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold tracking-tight ${
                      isActive ? "text-accent" : isDone ? "text-espresso" : "text-taupe"
                    }`}
                  >
                    {st.title}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-mono text-accent animate-pulse uppercase font-semibold">
                      In progress...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-mono text-muted uppercase">
                      Complete
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5 leading-snug">
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
