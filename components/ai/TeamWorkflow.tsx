"use client";

import React from "react";
import { ArrowDown, CheckCircle2, Workflow } from "lucide-react";
import { ProjectAnalysisResult } from "@/types/talent";

interface TeamWorkflowProps {
  team: ProjectAnalysisResult["recommendedTeam"];
}

export const TeamWorkflow: React.FC<TeamWorkflowProps> = ({ team }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-7 rounded-2xl bg-[#111114] border border-white/10 shadow-xl space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent mb-1">
          <Workflow className="w-3.5 h-3.5" />
          <span>Team Architecture</span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          Why this team?
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          How your project deliverables map directly across your recommended squad:
        </p>
      </div>

      <div className="relative space-y-2 pt-2">
        {team.map((member, idx) => (
          <div key={member.talent.id} className="relative">
            <div className="p-3.5 rounded-xl bg-[#15151A] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left: Step number + Requirement */}
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-zinc-400 flex items-center justify-center shrink-0">
                  0{idx + 1}
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                    Deliverable Focus
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {member.projectRequirementCovered || member.roleTitle}
                  </span>
                </div>
              </div>

              {/* Middle: Specialist Assignment */}
              <div className="flex items-center gap-3 sm:ml-auto">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                  {member.talent.profileImage ? (
                    <img
                      src={member.talent.profileImage}
                      alt={member.talent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs font-bold text-white">
                      {member.talent.initials}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {member.talent.name}
                  </p>
                  <p className="text-[11px] font-mono text-accent">
                    {member.roleTitle}
                  </p>
                </div>
              </div>

              {/* Right: Match Confidence */}
              <div className="hidden sm:block text-right pl-3 border-l border-white/5">
                <span className="text-xs font-mono font-bold text-accent">
                  {member.score || 92}% Match
                </span>
              </div>
            </div>

            {/* Down arrow connector between steps */}
            {idx < team.length - 1 && (
              <div className="flex justify-center -my-1 relative z-10">
                <ArrowDown className="w-3.5 h-3.5 text-zinc-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
