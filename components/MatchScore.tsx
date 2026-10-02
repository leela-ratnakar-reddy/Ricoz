"use client";

import React, { useState } from "react";
import { MatchBreakdown } from "@/types";
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

interface MatchScoreProps {
  score: number;
  breakdown?: MatchBreakdown;
  keyStrengths?: string[];
  size?: "sm" | "md" | "lg";
  showBreakdownToggle?: boolean;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  breakdown,
  keyStrengths,
  size = "md",
  showBreakdownToggle = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const badgeSize = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3.5 py-1.5 font-semibold",
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border bg-accent-muted text-accent border-accent-border ${badgeSize[size]} shadow-sm`}
          title={`Match score: ${score}%`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold">{score}% Match</span>
        </span>

        {showBreakdownToggle && breakdown && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-brand-muted hover:text-brand-secondary p-1 text-xs transition-colors rounded hover:bg-surface-elevated"
            aria-label="Toggle match breakdown"
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {isOpen && breakdown && (
        <div className="absolute left-0 mt-2 w-72 p-4 bg-surface-elevated border border-surface-border rounded-lg shadow-surface z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-surface-border">
            <span className="font-semibold text-brand flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Match Breakdown
            </span>
            <span className="font-mono font-bold text-accent">{score}%</span>
          </div>

          <div className="space-y-2">
            {[
              { label: "Skills & Specialization", weight: "25%", val: breakdown.skills },
              { label: "Industry Relevance", weight: "20%", val: breakdown.industry },
              { label: "Seniority & Track Record", weight: "15%", val: breakdown.experience },
              { label: "Aesthetic Synergy", weight: "15%", val: breakdown.style },
              { label: "Budget Alignment", weight: "10%", val: breakdown.budget },
              { label: "Immediate Availability", weight: "10%", val: breakdown.availability },
            ].map((item) => (
              <div key={item.label} className="space-y-0.5">
                <div className="flex justify-between text-brand-secondary">
                  <span className="truncate pr-1">
                    {item.label} <span className="text-[10px] text-brand-muted">({item.weight})</span>
                  </span>
                  <span className="font-mono font-medium text-brand">{item.val}%</span>
                </div>
                <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {keyStrengths && keyStrengths.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-border space-y-1">
              <span className="text-[10px] font-mono font-semibold text-brand-muted uppercase tracking-wider block">
                Key Match Factors
              </span>
              {keyStrengths.map((str, i) => (
                <div key={i} className="flex items-center gap-1.5 text-brand-secondary text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
