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
        <div className="p-6 rounded-2xl bg-[#111114] border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-accent">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Your Active Project Brief</span>
            </div>
            <p className="text-sm text-zinc-200 line-clamp-2 font-medium">
              &ldquo;{brief}&rdquo;
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors shrink-0"
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
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent" />
            Example Project Briefs
          </span>
          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            Click an example to test instant matching
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PROMPT_STARTERS.map((starter) => (
            <button
              key={starter.title}
              type="button"
              onClick={() => handleSelectStarter(starter)}
              className="text-left p-4 rounded-xl bg-[#111114] border border-white/10 hover:border-accent/50 hover:bg-[#16161C] transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block mb-1">
                  {starter.category}
                </span>
                <p className="text-xs text-zinc-300 group-hover:text-white leading-relaxed">
                  &ldquo;{starter.subtitle}&rdquo;
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-zinc-500 group-hover:text-accent flex items-center gap-1">
                <span>Load brief</span>
                <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversational Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative rounded-2xl bg-[#121215] border border-white/15 focus-within:border-accent/60 transition-all p-4 sm:p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Project Scope & Goals
            </span>
            <span className="text-[11px] text-zinc-500">
              Plain natural language accepted
            </span>
          </div>

          <textarea
            value={brief}
            onChange={(e) => onChangeBrief(e.target.value)}
            rows={4}
            placeholder="Example: We're launching a premium skincare brand for Gen Z. We need a new visual identity, packaging, website and launch campaign..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base leading-relaxed focus:outline-none resize-none"
          />

          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-zinc-400 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                RICOZ AI Preview • Deterministic Matcher
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasAnalyzed && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={!brief.trim() || isAnalyzing}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                  brief.trim() && !isAnalyzing
                    ? "bg-accent text-black hover:bg-accent-hover active:bg-[#B5F228] shadow-glow"
                    : "bg-white/10 text-zinc-500 cursor-not-allowed"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>RICOZ is understanding your project...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze My Project</span>
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
