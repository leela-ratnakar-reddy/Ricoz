"use client";

import React from "react";
import {
  CheckCircle2,
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
    confidence >= 80 ? "text-accent border-accent/30 bg-accent/10" : "text-amber-800 border-amber-300 bg-amber-50";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 1. Missing Information & Smart Clarification Banner (if applicable) */}
      {analysis.clarificationQuestions && analysis.clarificationQuestions.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber-800 font-bold">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>Smart Clarification Needed (Confidence: {confidence}%)</span>
            </div>
            <span className="text-[10px] font-mono text-amber-700/80">
              Click a question below to tune
            </span>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed font-sans">
            {analysis.clarificationMessage ||
              "To assemble the most accurate creative squad, please answer any of the following questions:"}
          </p>

          <div className="space-y-1.5 pt-1">
            {analysis.clarificationQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectClarification && onSelectClarification(q)}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-3 transition-colors group cursor-pointer shadow-2xs"
              >
                <span className="truncate">
                  {idx + 1}. {q}
                </span>
                <span className="text-[10px] font-mono text-amber-800 shrink-0 group-hover:underline flex items-center gap-1 font-semibold">
                  Answer <ArrowUpRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Refinement Change Summary (if refinement applied) */}
      {analysis.changeSummary && (
        <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-accent/30 text-espresso space-y-3 animate-in fade-in duration-300 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent font-bold">
              <Zap className="w-4 h-4 text-accent" />
              <span>PROJECT REFINEMENT APPLIED</span>
            </div>
            {analysis.changeSummary.talentMatchesChanged > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-accent text-[#FFF9F3]">
                {analysis.changeSummary.talentMatchesChanged} Talent Matches Recalibrated
              </span>
            )}
          </div>

          <p className="text-xs text-muted leading-relaxed font-normal">
            {analysis.changeSummary.summaryText}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[#E6D8CF]">
            {analysis.changeSummary.added.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-accent font-semibold block">
                  Added Scope
                </span>
                {analysis.changeSummary.added.map((item, i) => (
                  <p key={i} className="text-xs text-espresso truncate">
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
                  <p key={i} className="text-xs text-espresso truncate">
                    {item}
                  </p>
                ))}
              </div>
            )}
            {analysis.changeSummary.reduced.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-muted font-semibold block">
                  Reduced / De-emphasized
                </span>
                {analysis.changeSummary.reduced.map((item, i) => (
                  <p key={i} className="text-xs text-muted truncate">
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Conversational AI Confirmation Header */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-accent/10 text-accent border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>PROJECT UNDERSTANDING COMPLETE</span>
            </div>

            {analysis.projectIntent && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white border border-[#E6D8CF] text-muted">
                Intent: <strong className="text-espresso">{analysis.projectIntent}</strong>
              </span>
            )}

            {analysis.brandMaturity && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white border border-[#E6D8CF] text-muted">
                Maturity: <strong className="text-espresso">{analysis.brandMaturity}</strong>
              </span>
            )}

            {analysis.complexity && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-accent/10 border border-accent/20 text-accent">
                Scale: <strong className="text-espresso">{analysis.complexity} Scope</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${confidenceColor}`}>
              Confidence: {confidence}%
            </span>
            <span className="text-[11px] font-mono text-taupe uppercase tracking-wider hidden sm:inline">
              {analysis.source === "ai" ? "Gemini V3.1 Engine" : "Deterministic Engine"}
            </span>
          </div>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-normal text-espresso tracking-tight">
          &ldquo;I understand what you&apos;re building.&rdquo;
        </h3>

        <p className="text-sm sm:text-base text-muted leading-relaxed font-normal">
          {analysis.projectUnderstanding || analysis.projectSummary}
        </p>

        {analysis.audience && (
          <p className="text-xs text-accent font-mono pt-1">
            Target Audience: <span className="text-espresso font-medium">{analysis.audience}</span>
            {analysis.audienceCharacteristics && analysis.audienceCharacteristics.length > 0 && (
              <span className="text-muted"> ({analysis.audienceCharacteristics.join(", ")})</span>
            )}
          </p>
        )}

        {/* Industry Taxonomy Separation Row */}
        <div className="pt-3 border-t border-[#E6D8CF] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-[#E6D8CF] space-y-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
              Actual Industry
            </span>
            <span className="font-semibold text-espresso block truncate">
              {analysis.primaryIndustry || analysis.detectedIndustry || "Creative & Consumer"}
            </span>
            {analysis.subIndustry && (
              <span className="text-[11px] text-muted block truncate">
                {analysis.subIndustry}
              </span>
            )}
          </div>

          {analysis.secondaryIndustries && analysis.secondaryIndustries.length > 0 && (
            <div className="p-3.5 rounded-xl bg-white border border-[#E6D8CF] space-y-1 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold block">
                Target / Adjacent Vertical
              </span>
              <span className="font-medium text-espresso block truncate">
                {analysis.secondaryIndustries.join(", ")}
              </span>
              <span className="text-[11px] text-taupe block truncate">
                {analysis.industryEvidence?.[0] || "Target market segment"}
              </span>
            </div>
          )}

          {analysis.talentMatchingCategories && analysis.talentMatchingCategories.length > 0 && (
            <div className="p-3.5 rounded-xl bg-white border border-[#E6D8CF] space-y-1 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold block">
                Talent Matching Context
              </span>
              <span className="font-medium text-espresso block truncate">
                {analysis.talentMatchingCategories.join(", ")}
              </span>
              <span className="text-[10px] font-mono text-taupe block">
                Disciplines mapped from 57 profiles
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Business Goal vs Creative Goal Strategic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Goal Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E6D8CF] flex flex-col justify-between space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-muted text-xs font-mono">
            <Target className="w-4 h-4 text-accent" />
            <span className="uppercase tracking-wider font-semibold">BUSINESS OBJECTIVE</span>
          </div>
          <p className="text-sm text-espresso font-medium leading-relaxed">
            {analysis.businessGoal || "Modernize market positioning and capture target audience with high-trust execution."}
          </p>
          {analysis.currentBrandState && (
            <div className="text-[11px] text-muted pt-2 border-t border-[#E6D8CF] font-mono">
              <span className="text-taupe">Current State:</span> {analysis.currentBrandState}
            </div>
          )}
        </div>

        {/* Creative Goal Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E6D8CF] flex flex-col justify-between space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-muted text-xs font-mono">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="uppercase tracking-wider font-semibold">CREATIVE AMBITION</span>
          </div>
          <p className="text-sm text-espresso font-medium leading-relaxed">
            {analysis.creativeGoal || "Create a cohesive, high-impact brand identity and digital experience."}
          </p>
          {analysis.desiredBrandState && (
            <div className="text-[11px] text-muted pt-2 border-t border-[#E6D8CF] font-mono">
              <span className="text-accent font-semibold">Target State:</span> {analysis.desiredBrandState}
            </div>
          )}
        </div>
      </div>

      {/* 5. Explicit vs Inferred Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Explicit Requirements */}
        <div className="p-5 rounded-xl bg-white border border-[#E6D8CF] space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6D8CF]">
            <span className="text-xs font-mono uppercase tracking-wider text-muted flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              EXPLICIT DELIVERABLES
            </span>
            <span className="text-[10px] font-mono text-taupe">Stated in brief</span>
          </div>
          <div className="space-y-1.5">
            {(analysis.explicitRequirements && analysis.explicitRequirements.length > 0
              ? analysis.explicitRequirements
              : analysis.deliverables?.slice(0, 3) || ["Primary brand creative deliverables"]
            ).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-espresso">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inferred Strategic Requirements */}
        <div className="p-5 rounded-xl bg-white border border-[#E6D8CF] space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6D8CF]">
            <span className="text-xs font-mono uppercase tracking-wider text-muted flex items-center gap-1.5 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              INFERRED STRATEGIC NEEDS
            </span>
            <span className="text-[10px] font-mono text-taupe">RICOZ AI Reasoning</span>
          </div>
          <div className="space-y-2.5">
            {analysis.inferredRequirementsWithConfidence && analysis.inferredRequirementsWithConfidence.length > 0 ? (
              analysis.inferredRequirementsWithConfidence.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-espresso">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      <span className="font-medium truncate">{item.requirement}</span>
                    </div>
                    <span className="text-[10px] font-mono text-accent font-semibold shrink-0">
                      {item.confidence}% confidence
                    </span>
                  </div>
                  {item.reason && (
                    <p className="text-[11px] text-muted leading-normal pl-3.5 font-normal">
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
                <div key={idx} className="flex items-center gap-2 text-xs text-espresso">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 6. Required vs Optional Disciplines */}
      <div className="p-6 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] space-y-4 shadow-xs">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-muted mb-2.5 flex items-center justify-between pb-2 border-b border-[#E6D8CF]">
            <span className="flex items-center gap-1.5 font-semibold">
              <Award className="w-3.5 h-3.5 text-accent" />
              <span>REQUIRED SQUAD DISCIPLINES</span>
            </span>
            <span className="text-[10px] font-mono text-taupe">
              {analysis.requiredRoles.length} Primary Roles
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.requiredRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-white text-accent border border-accent/30 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Optional / Value-Add Disciplines (if any) */}
        {analysis.optionalRoles && analysis.optionalRoles.length > 0 && (
          <div className="pt-3 border-t border-[#E6D8CF]">
            <div className="text-xs font-mono uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Users2 className="w-3.5 h-3.5 text-taupe" />
                <span>POTENTIALLY USEFUL / OPTIONAL DISCIPLINES</span>
              </span>
              <span className="text-[10px] font-mono text-taupe">Secondary Value-Add</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.optionalRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-muted bg-white border border-[#E6D8CF]"
                >
                  <span className="w-1 h-1 rounded-full bg-taupe" />
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
