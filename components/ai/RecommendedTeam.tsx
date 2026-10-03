"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users2,
  Bookmark,
  ArrowUpRight,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Award
} from "lucide-react";
import { ProjectAnalysisResult } from "@/types/talent";
import { toggleShortlist, isShortlisted } from "@/lib/storage";

interface RecommendedTeamProps {
  team: ProjectAnalysisResult["recommendedTeam"];
  onRefineProject: () => void;
}

export const RecommendedTeam: React.FC<RecommendedTeamProps> = ({
  team,
  onRefineProject
}) => {
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [allShortlisted, setAllShortlisted] = useState(false);

  useEffect(() => {
    const update = () => {
      const active = team.map((m) => m.talent.id).filter((id) => isShortlisted(id));
      setShortlistedIds(active);
      setAllShortlisted(active.length === team.length && team.length > 0);
    };
    update();
    window.addEventListener("brandroom_shortlist_updated", update);
    return () => window.removeEventListener("brandroom_shortlist_updated", update);
  }, [team]);

  const handleToggleSingle = (id: string) => {
    toggleShortlist(id);
  };

  const handleShortlistEntireTeam = () => {
    team.forEach((member) => {
      if (!isShortlisted(member.talent.id)) {
        toggleShortlist(member.talent.id);
      }
    });
    setAllShortlisted(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-accent/15 text-accent border border-accent/25 mb-2 font-medium">
            <Users2 className="w-3.5 h-3.5" />
            <span>5-ROLE ASSEMBLED SQUAD</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Your Recommended RICOZ Team
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Based on your project requirements, we recommend these creative specialists to collaborate on your vision.
          </p>
        </div>

        <button
          type="button"
          onClick={handleShortlistEntireTeam}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
            allShortlisted
              ? "bg-accent/20 border-accent text-accent"
              : "bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-accent/40"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${allShortlisted ? "fill-accent" : ""}`} />
          <span>{allShortlisted ? "Entire Team Saved" : "Shortlist Entire Team"}</span>
        </button>
      </div>

      {/* Recommended 5-Role Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member, index) => {
          const isMemberSaved = shortlistedIds.includes(member.talent.id);
          const featuredWork = member.talent.portfolio?.[0];
          const seqNum = String(index + 1).padStart(2, "0");

          return (
            <div
              key={member.talent.id}
              className="group rounded-2xl bg-[#111114] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
            >
              <div>
                {/* Top Role Header */}
                <div className="p-4 pb-3 border-b border-white/5 flex items-center justify-between bg-[#151519]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      {seqNum}
                    </span>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-accent truncate">
                      {member.roleTitle}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-black/60 text-accent border border-accent/30 shrink-0">
                    {member.score || 92}% Match
                  </span>
                </div>

                {/* Human Portrait Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                  {member.talent.profileImage ? (
                    <img
                      src={member.talent.profileImage}
                      alt={member.talent.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono font-bold text-2xl text-white">
                      {member.talent.initials}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/20 pointer-events-none" />

                  {/* Hourly Rate Overlay */}
                  <div className="absolute bottom-2.5 right-3 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-black/75 backdrop-blur-md text-white border border-white/10">
                      {member.talent.hourlyRate}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  {/* Name & Location */}
                  <div>
                    <Link
                      href={`/talent/${member.talent.id}`}
                      className="text-lg font-bold text-white hover:text-accent transition-colors block truncate group-hover:text-accent"
                    >
                      {member.talent.name}
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span>{member.talent.location}</span>
                      </span>
                      <span>·</span>
                      <span className="shrink-0">{member.talent.experience} yrs exp</span>
                    </div>
                  </div>

                  {/* Skills (2-3 max) */}
                  <div className="flex flex-wrap gap-1">
                    {member.talent.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Match Rationale Paragraph */}
                  <div className="p-3 rounded-xl bg-[#16161B] border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent block">
                      Why RICOZ Recommends {member.talent.name.split(" ")[0]}
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                      {member.reason}
                    </p>

                    {/* Bullet Points */}
                    {member.recommendationPoints && member.recommendationPoints.length > 0 && (
                      <ul className="space-y-1 pt-1 border-t border-white/5">
                        {member.recommendationPoints.slice(0, 3).map((pt, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-zinc-300"
                          >
                            <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                            <span className="truncate">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Match Signals */}
                    {member.matchSignals && member.matchSignals.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">
                          AI Match Signals
                        </span>
                        <div className="space-y-1">
                          {member.matchSignals.slice(0, 3).map((sig, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-center gap-1.5 text-[10px]"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  sig.matched ? "bg-accent" : "bg-zinc-600"
                                }`}
                              />
                              <span className="text-zinc-400 font-medium shrink-0">{sig.label}:</span>
                              <span className="text-zinc-300 truncate">{sig.detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Concrete Portfolio Evidence Callout (Requirement 15) */}
                  {member.portfolioEvidence && (
                    <div className="p-3 rounded-xl bg-accent/5 border border-accent/25 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                        <Award className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>Portfolio Proof Point</span>
                      </div>
                      <p className="text-xs text-white font-semibold truncate">
                        &ldquo;{member.portfolioEvidence.projectTitle}&rdquo;
                      </p>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        {member.portfolioEvidence.reason}
                      </p>
                    </div>
                  )}

                  {/* Work Visual Preview Thumbnail */}
                  {featuredWork && (
                    <Link
                      href={`/talent/${member.talent.id}`}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-black/40 border border-white/5 hover:border-accent/40 transition-colors group/work"
                    >
                      <div className="w-12 h-9 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        {featuredWork.image ? (
                          <img
                            src={featuredWork.image}
                            alt={featuredWork.title}
                            className="w-full h-full object-cover group-hover/work:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono uppercase text-zinc-500 block truncate">
                          {featuredWork.projectType}
                        </span>
                        <p className="text-xs text-zinc-200 group-hover/work:text-accent font-medium truncate">
                          {featuredWork.title}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-3 border-t border-white/5 flex items-center justify-between bg-[#0E0E11]/80">
                <button
                  type="button"
                  onClick={() => handleToggleSingle(member.talent.id)}
                  className={`text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                    isMemberSaved ? "text-accent" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isMemberSaved ? "fill-accent" : ""}`} />
                  <span>{isMemberSaved ? "Shortlisted" : "+ Shortlist"}</span>
                </button>

                <Link
                  href={`/talent/${member.talent.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-accent text-white hover:text-black font-semibold text-xs transition-all group/btn"
                >
                  <span>View Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Level Global Actions Banner (Section 12) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#121216] via-[#16161B] to-[#121216] border border-accent/25 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Ready to initiate with this 5-role squad?
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-lg">
            RICOZ manages contract orchestration, milestone escrow, and deliverables alignment across the entire creative team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRefineProject}
            className="px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            Refine Project Brief
          </button>

          <button
            type="button"
            onClick={handleShortlistEntireTeam}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-colors"
          >
            {allShortlisted ? "Team Saved" : "Shortlist Entire Team"}
          </button>

          <Link
            href="/dashboard/company/projects/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-semibold text-xs sm:text-sm hover:bg-accent-hover active:bg-[#B5F228] transition-all shadow-glow"
          >
            <span>Start Project With This Team</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
