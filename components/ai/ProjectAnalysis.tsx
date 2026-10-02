"use client";

import React from "react";
import { CheckCircle2, Layers, Building2, Compass, Award } from "lucide-react";
import { ProjectAnalysisResult } from "@/types/talent";

interface ProjectAnalysisProps {
  analysis: ProjectAnalysisResult;
}

export const ProjectAnalysis: React.FC<ProjectAnalysisProps> = ({ analysis }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Conversational AI Confirmation Banner */}
      <div className="p-6 rounded-2xl bg-[#111114] border border-white/10 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-accent/15 text-accent border border-accent/25">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>PROJECT UNDERSTANDING COMPLETE</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          &ldquo;I understand what you&apos;re building.&rdquo;
        </h3>

        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
          {analysis.projectUnderstanding || analysis.projectSummary}
        </p>

        <p className="text-xs text-accent font-mono pt-1">
          Your project appears to need {analysis.requiredRoles.length} complementary creative disciplines.
        </p>
      </div>

      {/* Structured Decomposition Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Target Industry */}
        <div className="p-4 rounded-xl bg-[#141418] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono mb-2">
            <Building2 className="w-3.5 h-3.5 text-accent" />
            <span>TARGET INDUSTRY</span>
          </div>
          <p className="text-base font-bold text-white">
            {analysis.detectedIndustry}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {analysis.industries.slice(0, 3).map((ind) => (
              <span
                key={ind}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Project Scope & Type */}
        <div className="p-4 rounded-xl bg-[#141418] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono mb-2">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>PROJECT SCOPE</span>
          </div>
          <p className="text-base font-bold text-white">
            {analysis.detectedProjectType}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {analysis.projectTypes.slice(0, 3).map((pt) => (
              <span
                key={pt}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5"
              >
                {pt}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Project Scale */}
        <div className="p-4 rounded-xl bg-[#141418] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono mb-2">
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span>PROJECT SCALE</span>
          </div>
          <p className="text-base font-bold text-white">
            {analysis.projectScale || "Multidisciplinary Team"}
          </p>
          <p className="text-[11px] text-zinc-400 mt-2 font-mono">
            {analysis.recommendedTeam.length} Key Roles Assembled
          </p>
        </div>
      </div>

      {/* Requirement Tags Checklist */}
      <div className="p-5 rounded-2xl bg-[#121215] border border-white/10">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            YOUR PROJECT NEEDS
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            Validated against RICOZ creative ontology
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(analysis.requirementTags || [
            "Brand Strategy & Positioning",
            "Visual Identity System",
            "Packaging & Physical Materials",
            "Digital Product & UX",
            "Launch Campaign & Motion"
          ]).map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-medium truncate">{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
