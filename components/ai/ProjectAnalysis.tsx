"use client";

import React from "react";
import {
  CheckCircle2,
  Layers,
  Building2,
  Compass,
  Award,
  Target,
  Sparkles,
  HelpCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Users2
} from "lucide-react";
import { ProjectAnalysisResult } from "@/types/talent";

interface ProjectAnalysisProps {
  analysis: ProjectAnalysisResult;
  onSelectClarification?: (question: string) => void;
}

export const ProjectAnalysis: React.FC<ProjectAnalysisProps> = ({
  analysis,
  onSelectClarification
}) => {
  const confidence = analysis.analysisConfidence ?? (analysis.isVague ? 40 : 94);
  const confidenceColor =
    confidence >= 80 ? "text-accent border-accent/30 bg-accent/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 1. Missing Information & Smart Clarification Banner (if applicable) */}
      {analysis.clarificationQuestions && analysis.clarificationQuestions.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber-400 font-bold">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Smart Clarification Needed (Confidence: {confidence}%)</span>
            </div>
            <span className="text-[10px] font-mono text-amber-300/80">
              Click a question below to tune
            </span>
          </div>

          <p className="text-xs text-amber-100/90 leading-relaxed">
            {analysis.clarificationMessage ||
              "To assemble the most accurate creative squad, please answer any of the following questions:"}
          </p>

          <div className="space-y-1.5 pt-1">
            {analysis.clarificationQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectClarification && onSelectClarification(q)}
                className="w-full text-left p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-500/20 hover:border-amber-400/40 text-xs text-amber-200 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
              >
                <span className="truncate">
                  {idx + 1}. {q}
                </span>
                <span className="text-[10px] font-mono text-amber-400 shrink-0 group-hover:underline flex items-center gap-1">
                  Answer <ArrowUpRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Refinement Change Summary (if refinement applied) */}
      {analysis.changeSummary && (
        <div className="p-5 rounded-2xl bg-accent/10 border border-accent/30 text-white space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent font-bold">
              <Zap className="w-4 h-4 text-accent" />
              <span>PROJECT REFINEMENT APPLIED</span>
            </div>
            {analysis.changeSummary.talentMatchesChanged > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-accent text-black">
                {analysis.changeSummary.talentMatchesChanged} Talent Matches Recalibrated
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-200 leading-relaxed font-normal">
            {analysis.changeSummary.summaryText}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-accent/20">
            {analysis.changeSummary.added.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-accent font-semibold block">
                  Added Scope
                </span>
                {analysis.changeSummary.added.map((item, i) => (
                  <p key={i} className="text-xs text-zinc-300 truncate">
                    {item}
                  </p>
                ))}
              </div>
            )}
            {analysis.changeSummary.prioritized.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-accent font-semibold block">
                  Prioritized
                </span>
                {analysis.changeSummary.prioritized.map((item, i) => (
                  <p key={i} className="text-xs text-zinc-300 truncate">
                    {item}
                  </p>
                ))}
              </div>
            )}
            {analysis.changeSummary.reduced.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
                  Reduced / De-emphasized
                </span>
                {analysis.changeSummary.reduced.map((item, i) => (
                  <p key={i} className="text-xs text-zinc-400 truncate">
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Conversational AI Confirmation Header */}
      <div className="p-6 rounded-2xl bg-[#111114] border border-white/10 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-accent/15 text-accent border border-accent/25">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>PROJECT UNDERSTANDING COMPLETE</span>
            </div>

            {analysis.projectIntent && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/5 border border-white/10 text-zinc-300">
                Intent: <strong className="text-white">{analysis.projectIntent}</strong>
              </span>
            )}

            {analysis.brandMaturity && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/5 border border-white/10 text-zinc-300">
                Maturity: <strong className="text-white">{analysis.brandMaturity}</strong>
              </span>
            )}

            {analysis.complexity && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-accent/10 border border-accent/20 text-accent">
                Scale: <strong className="text-white">{analysis.complexity} Scope</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${confidenceColor}`}>
              Confidence: {confidence}%
            </span>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:inline">
              {analysis.source === "ai" ? "Gemini V3.1 Engine" : "Deterministic V3.1 Engine"}
            </span>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          &ldquo;I understand what you&apos;re building.&rdquo;
        </h3>

        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
          {analysis.projectUnderstanding || analysis.projectSummary}
        </p>

        {analysis.audience && (
          <p className="text-xs text-accent font-mono pt-1">
            Target Audience: <span className="text-white font-medium">{analysis.audience}</span>
            {analysis.audienceCharacteristics && analysis.audienceCharacteristics.length > 0 && (
              <span className="text-zinc-400"> ({analysis.audienceCharacteristics.join(", ")})</span>
            )}
          </p>
        )}

        {/* Industry Taxonomy Separation Row (V3.1) */}
        <div className="pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
              Actual Industry
            </span>
            <span className="font-semibold text-white block truncate">
              {analysis.primaryIndustry || analysis.detectedIndustry || "Creative & Consumer"}
            </span>
            {analysis.subIndustry && (
              <span className="text-[11px] text-zinc-400 block truncate">
                {analysis.subIndustry}
              </span>
            )}
          </div>

          {analysis.secondaryIndustries && analysis.secondaryIndustries.length > 0 && (
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                Target / Adjacent Vertical
              </span>
              <span className="font-medium text-zinc-200 block truncate">
                {analysis.secondaryIndustries.join(", ")}
              </span>
              <span className="text-[11px] text-zinc-500 block truncate">
                {analysis.industryEvidence?.[0] || "Target market segment"}
              </span>
            </div>
          )}

          {analysis.talentMatchingCategories && analysis.talentMatchingCategories.length > 0 && (
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                Talent Matching Context
              </span>
              <span className="font-medium text-zinc-300 block truncate">
                {analysis.talentMatchingCategories.join(", ")}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block">
                Disciplines mapped from 57 profiles
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Business Goal vs Creative Goal Strategic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Goal Card */}
        <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
            <Target className="w-4 h-4 text-accent" />
            <span className="uppercase tracking-wider">BUSINESS OBJECTIVE</span>
          </div>
          <p className="text-sm text-zinc-200 font-medium leading-relaxed">
            {analysis.businessGoal || "Modernize market positioning and capture target audience with high-trust execution."}
          </p>
          {analysis.currentBrandState && (
            <div className="text-[11px] text-zinc-400 pt-2 border-t border-white/5 font-mono">
              <span className="text-zinc-500">Current State:</span> {analysis.currentBrandState}
            </div>
          )}
        </div>

        {/* Creative Goal Card */}
        <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="uppercase tracking-wider">CREATIVE AMBITION</span>
          </div>
          <p className="text-sm text-zinc-200 font-medium leading-relaxed">
            {analysis.creativeGoal || "Create a cohesive, high-impact brand identity and digital experience."}
          </p>
          {analysis.desiredBrandState && (
            <div className="text-[11px] text-zinc-400 pt-2 border-t border-white/5 font-mono">
              <span className="text-accent">Target State:</span> {analysis.desiredBrandState}
            </div>
          )}
        </div>
      </div>

      {/* 5. Explicit vs Inferred Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Explicit Requirements */}
        <div className="p-5 rounded-xl bg-[#121215] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              EXPLICIT DELIVERABLES
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Stated in brief</span>
          </div>
          <div className="space-y-1.5">
            {(analysis.explicitRequirements && analysis.explicitRequirements.length > 0
              ? analysis.explicitRequirements
              : analysis.deliverables?.slice(0, 3) || ["Primary brand creative deliverables"]
            ).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inferred Strategic Requirements (V3.1 with confidence & reasons) */}
        <div className="p-5 rounded-xl bg-[#121215] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              INFERRED STRATEGIC NEEDS
            </span>
            <span className="text-[10px] font-mono text-zinc-500">RICOZ AI Reasoning</span>
          </div>
          <div className="space-y-2.5">
            {analysis.inferredRequirementsWithConfidence && analysis.inferredRequirementsWithConfidence.length > 0 ? (
              analysis.inferredRequirementsWithConfidence.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-zinc-200">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      <span className="font-medium truncate">{item.requirement}</span>
                    </div>
                    <span className="text-[10px] font-mono text-accent/80 shrink-0">
                      {item.confidence}% confidence
                    </span>
                  </div>
                  {item.reason && (
                    <p className="text-[11px] text-zinc-400 leading-normal pl-3.5 font-normal">
                      {item.reason}
                    </p>
                  )}
                </div>
              ))
            ) : (
              (analysis.inferredRequirements && analysis.inferredRequirements.length > 0
                ? analysis.inferredRequirements
                : [
                    "Brand Guidelines & Multi-Platform Component Library",
                    "Cross-Platform Art Direction Guidelines"
                  ]
              ).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 6. Required vs Optional Disciplines */}
      <div className="p-5 rounded-2xl bg-[#121215] border border-white/10 space-y-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center justify-between pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-accent" />
              <span>REQUIRED SQUAD DISCIPLINES</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {analysis.requiredRoles.length} Primary Roles
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.requiredRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-accent/15 text-accent border border-accent/30 shadow-glow"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Optional / Value-Add Disciplines (if any) */}
        {analysis.optionalRoles && analysis.optionalRoles.length > 0 && (
          <div className="pt-3 border-t border-white/5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>POTENTIALLY USEFUL / OPTIONAL DISCIPLINES</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Secondary Value-Add</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.optionalRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-300 bg-white/5 border border-white/10"
                >
                  <span className="w-1 h-1 rounded-full bg-zinc-500" />
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
