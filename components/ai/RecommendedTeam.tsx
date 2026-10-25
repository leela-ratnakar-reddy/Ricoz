"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users2,
  Bookmark,
  ArrowUpRight,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Award
} from "lucide-react";
import { ProjectAnalysisResult } from "@/types/talent";
import { toggleShortlist, isShortlisted } from "@/lib/storage";
import { ContourFlourish } from "@/components/ui/EditorialDecorations";

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E6D8CF]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-2 font-semibold">
            <Users2 className="w-3.5 h-3.5" />
            <span>5-ROLE ASSEMBLED SQUAD</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-espresso tracking-tight">
            Your Recommended RICOZ Team
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
            Based on your project requirements, we recommend these creative specialists to collaborate on your vision.
          </p>
        </div>

        <button
          type="button"
          onClick={handleShortlistEntireTeam}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 shadow-2xs ${
            allShortlisted
              ? "bg-accent/15 border-accent text-accent"
              : "bg-white border-[#E6D8CF] text-espresso hover:bg-[#FFF9F3] hover:border-accent/40"
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
              className="group rounded-2xl bg-white border border-[#E6D8CF] hover:border-accent/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md"
            >
              <div>
                {/* Top Role Header */}
                <div className="p-4 pb-3 border-b border-[#E6D8CF] flex items-center justify-between bg-[#FFF9F3]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-taupe">
                      {seqNum}
                    </span>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-accent truncate">
                      {member.roleTitle}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white text-accent border border-accent/30 shrink-0">
                    {member.score || 92}% Match
                  </span>
                </div>

                {/* Human Portrait Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E0CEC3]/30">
                  {member.talent.profileImage ? (
                    <img
                      src={member.talent.profileImage}
                      alt={member.talent.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif text-2xl font-normal text-espresso">
                      {member.talent.initials}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10 pointer-events-none" />

                  {/* Hourly Rate Overlay */}
                  <div className="absolute bottom-2.5 right-3 z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-white/90 backdrop-blur-xs text-espresso border border-[#E6D8CF] shadow-xs">
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
                      className="font-serif text-xl font-normal text-espresso hover:text-accent transition-colors block truncate group-hover:text-accent"
                    >
                      {member.talent.name}
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-taupe shrink-0" />
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
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFF9F3] text-espresso border border-[#E6D8CF]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Match Rationale Paragraph */}
                  <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#E6D8CF] space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
                      Why RICOZ Recommends {member.talent.name.split(" ")[0]}
                    </span>
                    <p className="text-xs text-muted leading-relaxed font-normal">
                      {member.reason}
                    </p>

                    {/* Bullet Points */}
                    {member.recommendationPoints && member.recommendationPoints.length > 0 && (
                      <ul className="space-y-1 pt-1.5 border-t border-[#E6D8CF]">
                        {member.recommendationPoints.slice(0, 3).map((pt, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-espresso"
                          >
                            <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                            <span className="truncate">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Match Signals */}
                    {member.matchSignals && member.matchSignals.length > 0 && (
                      <div className="pt-2 border-t border-[#E6D8CF] space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-taupe block font-semibold">
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
                                  sig.matched ? "bg-accent" : "bg-taupe"
                                }`}
                              />
                              <span className="text-muted font-medium shrink-0">{sig.label}:</span>
                              <span className="text-espresso truncate">{sig.detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Concrete Portfolio Evidence Callout */}
                  {member.portfolioEvidence && (
                    <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                        <Award className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>Portfolio Proof Point</span>
                      </div>
                      <p className="text-xs text-espresso font-semibold truncate">
                        &ldquo;{member.portfolioEvidence.projectTitle}&rdquo;
                      </p>
                      <p className="text-[11px] text-muted leading-relaxed">
                        {member.portfolioEvidence.reason}
                      </p>
                    </div>
                  )}

                  {/* Work Visual Preview Thumbnail */}
                  {featuredWork && (
                    <Link
                      href={`/talent/${member.talent.id}`}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FFF9F3] border border-[#E6D8CF] hover:border-accent/40 transition-colors group/work"
                    >
                      <div className="w-12 h-9 rounded-lg overflow-hidden bg-[#E0CEC3]/40 shrink-0">
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
                        <span className="text-[9px] font-mono uppercase text-taupe block truncate">
                          {featuredWork.projectType}
                        </span>
                        <p className="text-xs text-espresso group-hover/work:text-accent font-medium truncate">
                          {featuredWork.title}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-3 border-t border-[#E6D8CF] flex items-center justify-between bg-[#FFF9F3]/60">
                <button
                  type="button"
                  onClick={() => handleToggleSingle(member.talent.id)}
                  className={`text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                    isMemberSaved ? "text-accent font-semibold" : "text-muted hover:text-espresso"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isMemberSaved ? "fill-accent" : ""}`} />
                  <span>{isMemberSaved ? "Shortlisted" : "+ Shortlist"}</span>
                </button>

                <Link
                  href={`/talent/${member.talent.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-accent text-espresso hover:text-[#FFF9F3] border border-[#E6D8CF] font-semibold text-xs transition-all group/btn shadow-2xs"
                >
                  <span>View Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Level Global Actions Banner */}
      <div className="p-7 sm:p-8 rounded-2xl bg-espresso text-[#FFF9F3] border border-[#38241F] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <ContourFlourish className="absolute -right-12 -top-12 w-64 h-64 text-white/5 pointer-events-none" />

        <div className="relative z-10">
          <h3 className="font-serif text-2xl font-normal text-[#FFF9F3] tracking-tight">
            Ready to initiate with this 5-role squad?
          </h3>
          <p className="text-xs sm:text-sm text-[#FFF9F3]/75 mt-1 max-w-lg">
            RICOZ manages contract orchestration, milestone escrow, and deliverables alignment across the entire creative team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative z-10">
          <button
            type="button"
            onClick={onRefineProject}
            className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-xs font-semibold text-[#FFF9F3] transition-colors"
          >
            Refine Project Brief
          </button>

          <button
            type="button"
            onClick={handleShortlistEntireTeam}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-[#FFF9F3] transition-colors"
          >
            {allShortlisted ? "Team Saved" : "Shortlist Entire Team"}
          </button>

          <Link
            href="/start-project"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-[#FFF9F3] font-semibold text-xs sm:text-sm hover:bg-[#3E1012] border border-white/10 transition-all shadow-md active:translate-y-0.5"
          >
            <span>Start Project With Squad</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
