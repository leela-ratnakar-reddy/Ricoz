"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Bookmark, ArrowUpRight, CheckCircle2, MapPin } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-white/5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5 mb-1">
            <Award className="w-4 h-4 text-accent" />
            Ranked Candidate Pool
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Individual Match Scores & Rationale
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            All 57 fictional profiles evaluated deterministically against your specific project brief.
          </p>
        </div>

        <Link
          href="/talent"
          className="text-xs font-mono text-accent hover:underline flex items-center gap-1 shrink-0"
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
              className="rounded-2xl bg-[#111114] border border-white/10 hover:border-white/20 p-5 sm:p-6 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-lg group"
            >
              {/* Left: Portrait, Name, Role, Score */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Human Portrait with Match Score Badge */}
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                  {talent.profileImage ? (
                    <img
                      src={talent.profileImage}
                      alt={talent.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-sm text-white font-mono">
                      {talent.initials}
                    </div>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-xs text-[10px] font-mono font-bold text-accent text-center py-0.5 border-t border-accent/30">
                    {score}%
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/talent/${talent.id}`}
                      className="font-bold text-base text-white hover:text-accent transition-colors"
                    >
                      {talent.name}
                    </Link>
                    <span className="text-xs font-mono text-accent">
                      • {talent.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span>{talent.location}</span>
                    <span>•</span>
                    <span>{talent.experience} yrs exp</span>
                    <span>•</span>
                    <span className="font-mono text-white font-medium">{talent.hourlyRate}</span>
                  </div>

                  {/* Why this profile & match signals */}
                  <div className="mt-2.5 space-y-1.5">
                    {matchReasons.slice(0, 2).map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-zinc-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">{reason}</span>
                      </div>
                    ))}

                    {/* Portfolio Evidence */}
                    {portfolioEvidence && (
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] text-zinc-300">
                        <Award className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="text-accent font-mono text-[10px] uppercase tracking-wider font-semibold">Proof:</span>
                        <span className="text-white font-medium truncate">&ldquo;{portfolioEvidence.projectTitle}&rdquo;</span>
                        <span className="text-zinc-500 hidden sm:inline">({portfolioEvidence.projectType})</span>
                      </div>
                    )}

                    {matchedSkills && matchedSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mr-1">
                          Matched Skills:
                        </span>
                        {matchedSkills.slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20"
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
                  className="hidden xl:flex items-center gap-3 p-2 rounded-xl bg-black/40 border border-white/5 hover:border-accent/40 w-64 shrink-0 transition-colors group/work"
                >
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
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
                    <span className="text-[9px] font-mono uppercase text-zinc-500 block truncate">
                      {featuredWork.projectType}
                    </span>
                    <p className="text-xs text-white group-hover/work:text-accent truncate font-medium">
                      {featuredWork.title}
                    </p>
                  </div>
                </Link>
              )}

              {/* Right: Actions */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleShortlist(talent.id)}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isTalentSaved
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                  }`}
                  title={isTalentSaved ? "Remove from shortlist" : "Save to shortlist"}
                >
                  <Bookmark className={`w-4 h-4 ${isTalentSaved ? "fill-accent" : ""}`} />
                </button>

                <Link
                  href={`/talent/${talent.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  <span>View Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/dashboard/company/projects/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-black text-xs font-semibold hover:bg-accent-hover transition-colors shadow-glow"
                >
                  <span>Book</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
