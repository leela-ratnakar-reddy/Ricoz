"use client";

import React from "react";
import { ArrowDown, Workflow } from "lucide-react";
import { ProjectAnalysisResult } from "@/types/talent";

interface TeamWorkflowProps {
  team: ProjectAnalysisResult["recommendedTeam"];
}

export const TeamWorkflow: React.FC<TeamWorkflowProps> = ({ team }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-7 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] shadow-xs space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent mb-1 font-semibold">
          <Workflow className="w-3.5 h-3.5" />
          <span>Team Architecture</span>
        </div>
        <h3 className="font-serif text-2xl font-normal text-espresso tracking-tight">
          Why this team?
        </h3>
        <p className="text-xs sm:text-sm text-muted mt-1">
          How your project deliverables map directly across your recommended squad:
        </p>
      </div>

      <div className="relative space-y-2 pt-2">
        {team.map((member, idx) => (
          <div key={member.talent.id} className="relative">
            <div className="p-4 rounded-xl bg-white border border-[#E6D8CF] hover:border-accent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              {/* Left: Step number + Requirement */}
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#FFF9F3] border border-[#E6D8CF] text-[11px] font-mono font-bold text-accent flex items-center justify-center shrink-0">
                  0{idx + 1}
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted block">
                    Deliverable Focus
                  </span>
                  <span className="text-sm font-semibold text-espresso">
                    {member.projectRequirementCovered || member.roleTitle}
                  </span>
                </div>
              </div>

              {/* Middle: Specialist Assignment */}
              <div className="flex items-center gap-3 sm:ml-auto">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#E0CEC3]/40 border border-[#E6D8CF] shrink-0">
                  {member.talent.profileImage ? (
                    <img
                      src={member.talent.profileImage}
                      alt={member.talent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs font-bold text-espresso">
                      {member.talent.initials}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-espresso">
                    {member.talent.name}
                  </p>
                  <p className="text-[11px] font-mono text-accent">
                    {member.roleTitle}
                  </p>
                </div>
              </div>

              {/* Right: Match Confidence */}
              <div className="hidden sm:block text-right pl-3 border-l border-[#E6D8CF]">
                <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                  {member.score || 92}% Match
                </span>
              </div>
            </div>

            {/* Down arrow connector between steps */}
            {idx < team.length - 1 && (
              <div className="flex justify-center -my-1 relative z-10">
                <ArrowDown className="w-3.5 h-3.5 text-taupe" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
