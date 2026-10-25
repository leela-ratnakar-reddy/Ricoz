"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Bookmark, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { ProjectAnalysisResult } from "@/types/talent";
import { toggleShortlist, isShortlisted } from "@/lib/storage";

interface RecommendedTalentProps {
  candidates: ProjectAnalysisResult["recommendedTalent"];
}

export const RecommendedTalent: React.FC<RecommendedTalentProps> = ({ candidates }) => {
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);

  useEffect(() => {
    const update = () => {
      const active = candidates.map((c) => c.talent.id).filter((id) => isShortlisted(id));
      setShortlistedIds(active);
    };
    update();
    window.addEventListener("brandroom_shortlist_updated", update);
    return () => window.removeEventListener("brandroom_shortlist_updated", update);
  }, [candidates]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#E6D8CF]">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5 mb-1">
            <Award className="w-4 h-4 text-accent" />
            Ranked Candidate Pool
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-espresso tracking-tight">
            Individual Match Scores & Rationale
          </h2>
          <p className="text-xs text-muted mt-1">
            All 57 verified profiles evaluated deterministically against your specific project brief.
          </p>
        </div>

        <Link
          href="/talent"
          className="text-xs font-mono text-accent hover:underline flex items-center gap-1 shrink-0 font-semibold"
        >
          <span>Browse all 57 profiles</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-4">
        {candidates.map(({ talent, score, matchReasons, matchedSkills, portfolioEvidence }) => {
          const isTalentSaved = shortlistedIds.includes(talent.id);
          const featuredWork = talent.portfolio?.[0];

          return (
            <div
              key={talent.id}
              className="rounded-2xl bg-white border border-[#E6D8CF] hover:border-accent/40 p-5 sm:p-6 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs hover:shadow-md group"
            >
              {/* Left: Portrait, Name, Role, Score */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Human Portrait with Match Score Badge */}
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#E0CEC3]/40 border border-[#E6D8CF] shrink-0">
                  {talent.profileImage ? (
                    <img
                      src={talent.profileImage}
                      alt={talent.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif font-normal text-sm text-espresso">
                      {talent.initials}
                    </div>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-accent text-center py-0.5 border-t border-[#E6D8CF]">
                    {score}%
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/talent/${talent.id}`}
                      className="font-serif font-normal text-lg text-espresso hover:text-accent transition-colors"
                    >
                      {talent.name}
                    </Link>
                    <span className="text-xs font-mono text-accent font-semibold">
                      • {talent.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                    <span>{talent.location}</span>
                    <span>•</span>
                    <span>{talent.experience} yrs exp</span>
                    <span>•</span>
                    <span className="font-mono text-espresso font-semibold">{talent.hourlyRate}</span>
                  </div>

                  {/* Why this profile & match signals */}
                  <div className="mt-2.5 space-y-1.5">
                    {matchReasons.slice(0, 2).map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-muted"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">{reason}</span>
                      </div>
                    ))}

                    {/* Portfolio Evidence */}
                    {portfolioEvidence && (
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] text-muted">
                        <Award className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="text-accent font-mono text-[10px] uppercase tracking-wider font-semibold">Proof:</span>
                        <span className="text-espresso font-medium truncate">&ldquo;{portfolioEvidence.projectTitle}&rdquo;</span>
                        <span className="text-taupe hidden sm:inline">({portfolioEvidence.projectType})</span>
                      </div>
                    )}

                    {matchedSkills && matchedSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] font-mono text-taupe uppercase tracking-wider mr-1">
                          Matched Skills:
                        </span>
                        {matchedSkills.slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFF9F3] text-accent border border-accent/20"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle: Work Visual preview */}
              {featuredWork && (
                <Link
                  href={`/talent/${talent.id}`}
                  className="hidden xl:flex items-center gap-3 p-2 rounded-xl bg-[#FFF9F3] border border-[#E6D8CF] hover:border-accent/40 w-64 shrink-0 transition-colors group/work"
                >
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-[#E0CEC3]/40 shrink-0">
                    {featuredWork.image ? (
                      <img
                        src={featuredWork.image}
                        alt={featuredWork.title}
                        className="w-full h-full object-cover group-hover/work:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono uppercase text-taupe block truncate">
                      {featuredWork.projectType}
                    </span>
                    <p className="text-xs text-espresso group-hover/work:text-accent truncate font-medium">
                      {featuredWork.title}
                    </p>
                  </div>
                </Link>
              )}

              {/* Right: Actions */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E6D8CF] shrink-0">
                <button
                  type="button"
                  onClick={() => toggleShortlist(talent.id)}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isTalentSaved
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-white border-[#E6D8CF] text-muted hover:text-espresso"
                  }`}
                  title={isTalentSaved ? "Remove from shortlist" : "Save to shortlist"}
                >
                  <Bookmark className={`w-4 h-4 ${isTalentSaved ? "fill-accent" : ""}`} />
                </button>

                <Link
                  href={`/talent/${talent.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF9F3] border border-[#E6D8CF] text-espresso text-xs font-semibold transition-colors shadow-2xs"
                >
                  <span>Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/start-project"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-[#FFF9F3] text-xs font-semibold hover:bg-[#3E1012] transition-colors shadow-xs"
                >
                  <span>Engage</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
