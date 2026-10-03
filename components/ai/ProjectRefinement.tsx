"use client";

import React, { useState } from "react";
import { Sparkles, SlidersHorizontal, ArrowRight, Loader2 } from "lucide-react";

interface ProjectRefinementProps {
  onRefine: (refinementText: string) => Promise<void>;
  isRefining: boolean;
  initialText?: string;
}

const REFINEMENT_CHIPS = [
  "Focus more on luxury branding",
  "Prioritize digital experience & UX",
  "Add sustainable packaging expertise",
  "Prioritize kinetic motion & 3D",
  "Prioritize senior specialists (10+ yrs)",
  "Lean into high-growth fintech"
];

export const ProjectRefinement: React.FC<ProjectRefinementProps> = ({
  onRefine,
  isRefining,
  initialText
}) => {
  const [refinementText, setRefinementText] = useState(initialText || "");

  React.useEffect(() => {
    if (initialText) {
      setRefinementText(initialText);
    }
  }, [initialText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementText.trim() || isRefining) return;
    await onRefine(refinementText.trim());
    setRefinementText("");
  };

  const handleChipClick = (chip: string) => {
    setRefinementText(chip);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-[#111114] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Refine Your Creative Project
            </h3>
            <p className="text-xs text-zinc-400">
              Tell RICOZ what you&apos;d like to adjust. We&apos;ll recalibrate requirements and update your squad.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          Interactive AI Tuning
        </span>
      </div>

      {/* Quick Suggestion Chips */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
          Quick Adjustments
        </span>
        <div className="flex flex-wrap gap-2">
          {REFINEMENT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isRefining}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#16161B] hover:bg-accent/10 hover:border-accent/30 text-zinc-300 hover:text-accent border border-white/5 transition-all text-left disabled:opacity-50"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Refinement Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={refinementText}
            onChange={(e) => setRefinementText(e.target.value)}
            disabled={isRefining}
            placeholder="e.g. Focus more on luxury branding, or swap packaging for mobile design system..."
            className="w-full bg-[#16161B] border border-white/10 rounded-xl px-4 py-3.5 pr-32 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-normal disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!refinementText.trim() || isRefining}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-accent-hover active:bg-[#B5F228] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-glow"
          >
            {isRefining ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Refining...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Refine Squad</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
