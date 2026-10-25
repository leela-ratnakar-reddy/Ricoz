"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, ArrowUpRight, Sparkles, MapPin } from "lucide-react";
import { TalentProfile } from "@/types/talent";
import { isShortlisted, toggleShortlist } from "@/lib/storage";
import { EditorialStar } from "@/components/ui/EditorialDecorations";

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-white/95 backdrop-blur-md text-[#541719] border border-[#541719]/30 shadow-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-[#541719] animate-pulse" />
            Available Now
          </span>
        );
      case "Limited Availability":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-white/95 backdrop-blur-md text-[#76665F] border border-[#E6D8CF] shadow-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7A99A]" />
            Limited
          </span>
        );
      case "Busy":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-white/95 backdrop-blur-md text-[#9E8E87] border border-[#E6D8CF] shadow-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9E8E87]" />
            Booked
          </span>
        );
    }
  };

  return (
    <div className="group relative bg-white border border-[#E6D8CF] hover:border-[#C7A99A] rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card flex flex-col justify-between">
      <div>
        {/* Top Portrait Image Section */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#FFF9F3]">
          {!imgError && talent.profileImage ? (
            <img
              src={talent.profileImage}
              alt={talent.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#541719] to-[#38241F] text-[#FFF9F3]">
              <span className="text-3xl font-bold font-serif tracking-wider">
                {talent.initials || talent.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs text-[#E0CEC3] mt-1 font-sans">{talent.role}</span>
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Status Badge (Top-Left) */}
          <div className="absolute top-3.5 left-3.5 z-10">
            {renderAvailabilityDot(talent.availability)}
          </div>

          {/* Shortlist & Match Badge (Top-Right) */}
          <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
            {matchScore && (
              <span className="px-3 py-1 rounded-full text-[11px] font-sans font-bold bg-[#541719] text-[#FFF9F3] border border-[#541719] shadow-burgundy">
                {matchScore}% Match
              </span>
            )}
            <button
              type="button"
              onClick={handleToggleShortlist}
              className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                shortlisted
                  ? "bg-[#541719] text-[#FFF9F3] border-[#541719] shadow-burgundy"
                  : "bg-white/95 border-[#E6D8CF] text-[#38241F] hover:bg-[#FFF9F3] hover:text-[#541719]"
              }`}
              title={shortlisted ? "Remove from shortlist" : "Save to shortlist"}
              aria-label={shortlisted ? "Remove from shortlist" : "Save to shortlist"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${shortlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Rate Tag at Bottom-Right of Portrait */}
          <div className="absolute bottom-3 right-3.5 z-10">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/95 backdrop-blur-md text-[#38241F] border border-[#E6D8CF] shadow-subtle">
              {talent.hourlyRate}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-3.5">
          {/* Name & Primary Role */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/talent/${talent.id}`}
                className="text-lg font-serif font-bold text-[#38241F] hover:text-[#541719] transition-colors tracking-tight truncate group-hover:text-[#541719]"
              >
                {talent.name}
              </Link>
              {talent.featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-[#541719]/10 text-[#541719] border border-[#541719]/20 shrink-0">
                  <EditorialStar size={8} color="#541719" />
                  Curated
                </span>
              )}
            </div>

            <p className="text-xs font-sans font-medium text-[#541719] mt-0.5 truncate">
              {talent.role}
            </p>
          </div>

          {/* Location & Experience */}
          <div className="flex items-center gap-2 text-xs text-[#76665F] font-sans">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-[#9E8E87] shrink-0" />
              <span>{talent.location}</span>
            </span>
            <span>·</span>
            <span className="shrink-0">{talent.experience} yrs exp</span>
          </div>

          {/* 1-Line Specialty / Focus */}
          <p className="text-xs text-[#76665F] leading-relaxed line-clamp-2 font-sans font-normal">
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
                  className={`text-[11px] px-3 py-0.5 rounded-full font-sans transition-colors ${
                    isHighlighted
                      ? "bg-[#541719]/10 text-[#541719] border border-[#541719]/30 font-semibold"
                      : "bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]"
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
              className="mt-2 block rounded-2xl overflow-hidden border border-[#E6D8CF] hover:border-[#C7A99A] bg-[#FFF9F3] p-2.5 transition-all group/work"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-11 rounded-xl overflow-hidden bg-[#E0CEC3] shrink-0 relative border border-[#E6D8CF]">
                  {!workImgError && featuredWork.image ? (
                    <img
                      src={featuredWork.image}
                      alt={featuredWork.title}
                      onError={() => setWorkImgError(true)}
                      className="w-full h-full object-cover group-hover/work:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#E0CEC3] flex items-center justify-center text-[9px] text-[#76665F] font-sans">
                      Work
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-sans text-[#9E8E87] uppercase tracking-wider flex items-center justify-between">
                    <span>Selected Mandate</span>
                    <span className="text-[#76665F]">{featuredWork.year || "Case Study"}</span>
                  </div>
                  <p className="text-xs font-serif font-bold text-[#38241F] truncate group-hover/work:text-[#541719] transition-colors">
                    {featuredWork.title}
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 pt-3.5 mt-1 border-t border-[#E6D8CF] flex items-center justify-between gap-3 bg-[#FFF9F3]">
        <button
          type="button"
          onClick={handleToggleShortlist}
          className={`text-xs font-sans font-semibold inline-flex items-center gap-1.5 transition-colors ${
            shortlisted ? "text-[#541719]" : "text-[#76665F] hover:text-[#38241F]"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${shortlisted ? "fill-[#541719]" : ""}`} />
          <span>{shortlisted ? "Shortlisted" : "+ Shortlist"}</span>
        </button>

        <Link
          href={`/talent/${talent.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#541719] text-[#38241F] hover:text-[#FFF9F3] border border-[#E6D8CF] font-sans font-semibold text-xs transition-all shadow-subtle group/btn"
        >
          <span>View Dossier</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
};