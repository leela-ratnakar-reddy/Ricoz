"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Edit3, Zap, CheckCircle2 } from "lucide-react";
import { PROMPT_STARTERS, PromptStarter } from "@/lib/talentMatching";

interface AIProjectInputProps {
  brief: string;
  onChangeBrief: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasAnalyzed: boolean;
}

export const AIProjectInput: React.FC<AIProjectInputProps> = ({
  brief,
  onChangeBrief,
  onAnalyze,
  isAnalyzing,
  hasAnalyzed
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectStarter = (starter: PromptStarter) => {
    onChangeBrief(starter.brief);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim() || isAnalyzing) return;
    setIsEditing(false);
    onAnalyze();
  };

  // If analysis is complete and user is not currently editing, show the collapsed "YOUR PROJECT [ Edit Brief ]" view
  if (hasAnalyzed && !isEditing) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-10">
        <div className="p-6 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Your Active Project Brief</span>
            </div>
            <p className="text-sm text-espresso font-serif italic line-clamp-2">
              &ldquo;{brief}&rdquo;
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#E0CEC3]/40 text-espresso text-xs font-semibold border border-[#E6D8CF] transition-colors shrink-0 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-accent" />
            <span>Edit Brief</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 3 Example Project Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-muted flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-accent" />
            Example Project Briefs
          </span>
          <span className="text-[11px] font-mono text-taupe hidden sm:inline">
            Click an example to test instant matching
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PROMPT_STARTERS.map((starter) => (
            <button
              key={starter.title}
              type="button"
              onClick={() => handleSelectStarter(starter)}
              className="text-left p-4 rounded-xl bg-white border border-[#E6D8CF] hover:border-accent/40 hover:bg-[#FFF9F3] transition-all duration-200 group flex flex-col justify-between shadow-xs"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block mb-1">
                  {starter.category}
                </span>
                <p className="text-xs text-muted group-hover:text-espresso leading-relaxed font-sans">
                  &ldquo;{starter.subtitle}&rdquo;
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-taupe group-hover:text-accent flex items-center gap-1">
                <span>Load brief</span>
                <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversational Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] focus-within:border-accent/60 transition-all p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E6D8CF]/70 text-xs text-muted font-mono">
            <span className="flex items-center gap-1.5 text-espresso font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Project Scope & Creative Ambition
            </span>
            <span className="text-[11px] text-taupe">
              Plain natural language accepted
            </span>
          </div>

          <textarea
            value={brief}
            onChange={(e) => onChangeBrief(e.target.value)}
            rows={4}
            placeholder="Example: We're launching a premium skincare brand for Gen Z. We need a new visual identity, packaging, website and launch campaign..."
            className="w-full bg-transparent text-espresso placeholder-[#76665F]/60 text-sm sm:text-base leading-relaxed focus:outline-none resize-none font-sans"
          />

          <div className="pt-3.5 border-t border-[#E6D8CF]/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-white text-muted border border-[#E6D8CF]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                RICOZ AI • Hybrid Evaluation Engine
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasAnalyzed && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-espresso transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={!brief.trim() || isAnalyzing}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                  brief.trim() && !isAnalyzing
                    ? "bg-accent text-[#FFF9F3] hover:bg-[#3E1012] shadow-sm active:translate-y-0.5"
                    : "bg-[#E0CEC3]/50 text-taupe cursor-not-allowed"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#FFF9F3] border-t-transparent rounded-full animate-spin" />
                    <span>RICOZ is synthesizing your project...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Project Brief</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
