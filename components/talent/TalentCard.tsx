"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, ArrowUpRight, Sparkles, MapPin } from "lucide-react";
import { TalentProfile } from "@/types/talent";
import { isShortlisted, toggleShortlist } from "@/lib/storage";

interface TalentCardProps {
  talent: TalentProfile;
  matchScore?: number;
  highlightSkills?: string[];
}

export const TalentCard: React.FC<TalentCardProps> = ({
  talent,
  matchScore,
  highlightSkills = []
}) => {
  const [shortlisted, setShortlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [workImgError, setWorkImgError] = useState(false);

  useEffect(() => {
    setShortlisted(isShortlisted(talent.id));
    const handleUpdate = () => setShortlisted(isShortlisted(talent.id));
    window.addEventListener("brandroom_shortlist_updated", handleUpdate);
    return () => window.removeEventListener("brandroom_shortlist_updated", handleUpdate);
  }, [talent.id]);

  const handleToggleShortlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleShortlist(talent.id);
    setShortlisted(newState);
  };

  const featuredWork = talent.portfolio && talent.portfolio.length > 0 ? talent.portfolio[0] : null;

  const renderAvailabilityDot = (status: TalentProfile["availability"]) => {
    switch (status) {
      case "Available":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-md text-accent border border-accent/30">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Available
          </span>
        );
      case "Limited Availability":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-md text-amber-400 border border-amber-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Limited
          </span>
        );
      case "Busy":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-md text-zinc-400 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            Booked
          </span>
        );
    }
  };

  return (
    <div className="group relative bg-[#111114] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.45)] flex flex-col justify-between">
      <div>
        {/* Top Portrait Image Section */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-zinc-900">
          {!imgError && talent.profileImage ? (
            <img
              src={talent.profileImage}
              alt={talent.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-white">
              <span className="text-3xl font-bold font-mono tracking-wider text-accent/80">
                {talent.initials || talent.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs text-zinc-400 mt-1 font-mono">{talent.role}</span>
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/30 pointer-events-none" />

          {/* Status Badge (Top-Left) */}
          <div className="absolute top-3 left-3 z-10">
            {renderAvailabilityDot(talent.availability)}
          </div>

          {/* Shortlist & Match Badge (Top-Right) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            {matchScore && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/70 backdrop-blur-md text-accent border border-accent/40 shadow-sm">
                {matchScore}% Match
              </span>
            )}
            <button
              type="button"
              onClick={handleToggleShortlist}
              className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                shortlisted
                  ? "bg-accent text-black border-accent shadow-glow"
                  : "bg-black/60 border-white/15 text-white/80 hover:text-white hover:bg-black/80 hover:border-white/30"
              }`}
              title={shortlisted ? "Remove from shortlist" : "Save to shortlist"}
              aria-label={shortlisted ? "Remove from shortlist" : "Save to shortlist"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${shortlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Rate Tag at Bottom-Right of Portrait */}
          <div className="absolute bottom-2.5 right-3 z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10">
              {talent.hourlyRate}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3.5">
          {/* Name & Primary Role */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/talent/${talent.id}`}
                className="text-lg font-bold text-white hover:text-accent transition-colors tracking-tight truncate group-hover:text-accent"
              >
                {talent.name}
              </Link>
              {talent.featured && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-accent/15 text-accent border border-accent/25 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  Pro
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-accent mt-0.5 truncate">
              {talent.role}
            </p>
          </div>

          {/* Location & Experience */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
              <span>{talent.location}</span>
            </span>
            <span>·</span>
            <span className="shrink-0">{talent.experience} yrs exp</span>
          </div>

          {/* 1-Line Specialty / Focus */}
          <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
            {talent.specializations?.[0] ? `${talent.specializations[0]} — ${talent.bio}` : talent.bio}
          </p>

          {/* 2-3 Key Skills Max */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {talent.skills.slice(0, 3).map((skill) => {
              const isHighlighted = highlightSkills.some(
                (hs) => hs.toLowerCase() === skill.toLowerCase()
              );
              return (
                <span
                  key={skill}
                  className={`text-[11px] px-2.5 py-0.5 rounded-md font-mono transition-colors ${
                    isHighlighted
                      ? "bg-accent/20 text-accent border border-accent/40 font-semibold"
                      : "bg-[#18181C] text-zinc-300 border border-white/5"
                  }`}
                >
                  {skill}
                </span>
              );
            })}
          </div>

          {/* Featured Portfolio Work Preview Thumbnail */}
          {featuredWork && (
            <Link
              href={`/talent/${talent.id}`}
              className="mt-2 block rounded-xl overflow-hidden border border-white/5 hover:border-accent/40 bg-zinc-900/60 p-2 transition-all group/work"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-14 h-11 rounded-lg overflow-hidden bg-zinc-800 shrink-0 relative">
                  {!workImgError && featuredWork.image ? (
                    <img
                      src={featuredWork.image}
                      alt={featuredWork.title}
                      onError={() => setWorkImgError(true)}
                      className="w-full h-full object-cover group-hover/work:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-500 font-mono">
                      Work
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Selected Work</span>
                    <span className="text-zinc-500">{featuredWork.year || "Case Study"}</span>
                  </div>
                  <p className="text-xs font-medium text-white truncate group-hover/work:text-accent transition-colors">
                    {featuredWork.title}
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 pt-3 mt-1 border-t border-white/5 flex items-center justify-between gap-3 bg-[#0E0E11]/80">
        <button
          type="button"
          onClick={handleToggleShortlist}
          className={`text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
            shortlisted ? "text-accent" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${shortlisted ? "fill-accent" : ""}`} />
          <span>{shortlisted ? "Shortlisted" : "+ Shortlist"}</span>
        </button>

        <Link
          href={`/talent/${talent.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-accent text-white hover:text-black font-semibold text-xs transition-all group/btn"
        >
          <span>View Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
};
