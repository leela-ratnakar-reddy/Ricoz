"use client";

import React, { useState } from "react";
import { Sparkles, SlidersHorizontal, Loader2 } from "lucide-react";

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
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E6D8CF]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-normal text-espresso tracking-tight">
              Refine Your Creative Project
            </h3>
            <p className="text-xs text-muted">
              Tell RICOZ what you&apos;d like to adjust. We&apos;ll recalibrate requirements and update your squad.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-taupe uppercase tracking-wider font-semibold">
          Interactive AI Tuning
        </span>
      </div>

      {/* Quick Suggestion Chips */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted block mb-2 font-medium">
          Quick Adjustments
        </span>
        <div className="flex flex-wrap gap-2">
          {REFINEMENT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isRefining}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white hover:bg-accent/10 hover:border-accent/40 text-espresso hover:text-accent border border-[#E6D8CF] transition-all text-left shadow-2xs disabled:opacity-50"
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
            className="w-full bg-white border border-[#E6D8CF] rounded-xl px-4 py-3.5 pr-36 text-sm text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans shadow-2xs disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!refinementText.trim() || isRefining}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-[#FFF9F3] font-semibold text-xs hover:bg-[#3E1012] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xs"
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
