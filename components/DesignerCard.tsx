"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Designer } from "@/types";
import { PortfolioVisual } from "@/components/PortfolioVisual";
import { Heart, MapPin, Briefcase, ArrowRight, ShieldCheck } from "lucide-react";
import { isShortlisted, toggleShortlist } from "@/lib/storage";
import { EditorialStar } from "@/components/ui/EditorialDecorations";

interface DesignerCardProps {
  designer: Designer;
  matchScoreOverride?: number;
  onShortlistChange?: () => void;
  showLargeVisual?: boolean;
}

export const DesignerCard: React.FC<DesignerCardProps> = ({
  designer,
  matchScoreOverride,
  onShortlistChange,
  showLargeVisual = true,
}) => {
  const [shortlisted, setShortlisted] = useState(false);

  useEffect(() => {
    setShortlisted(isShortlisted(designer.id));
    const handleUpdate = () => {
      setShortlisted(isShortlisted(designer.id));
    };
    window.addEventListener("brandroom_shortlist_updated", handleUpdate);
    return () => window.removeEventListener("brandroom_shortlist_updated", handleUpdate);
  }, [designer.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const state = toggleShortlist(designer.id);
    setShortlisted(state);
    if (onShortlistChange) onShortlistChange();
  };

  const displayMatch = matchScoreOverride ?? designer.matchPercentage ?? 94;
  const leadProject = designer.portfolio[0];

  return (
    <div className="group relative bg-white border border-[#E6D8CF] rounded-3xl overflow-hidden hover:border-[#C7A99A] transition-all duration-300 hover:-translate-y-1 hover:shadow-card flex flex-col justify-between">
      <div>
        {/* Large Portfolio Artwork / Preview */}
        {showLargeVisual && leadProject && (
          <div className="relative overflow-hidden aspect-[16/10] bg-[#FFF9F3] border-b border-[#E6D8CF]">
            <PortfolioVisual
              title={leadProject.title}
              client={leadProject.client}
              industry={leadProject.industry}
              palette={leadProject.palette}
              aspectRatio="aspect-[16/10]"
              className="w-full h-full transform transition-transform duration-700 group-hover:scale-105"
            />
            {/* Top overlay badge: Heart Button */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggle}
                className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                  shortlisted
                    ? "bg-[#541719] border-[#541719] text-[#FFF9F3] shadow-burgundy"
                    : "bg-white/95 border-[#E6D8CF] text-[#38241F] hover:text-[#541719] hover:bg-white"
                }`}
                title={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
                aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${shortlisted ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Top metadata & Match Score */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  designer.availability === "Available now"
                    ? "bg-[#541719] animate-pulse"
                    : designer.availability === "Available soon"
                    ? "bg-[#C7A99A]"
                    : "bg-[#9E8E87]"
                }`}
              />
              <span className="text-xs font-sans font-medium text-[#76665F]">
                {designer.availability}
              </span>
            </div>

            <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-[#541719]/10 text-[#541719] border border-[#541719]/20">
              {displayMatch}% Match
            </span>
          </div>

          {/* Designer Identity */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FFF9F3] border border-[#E6D8CF] shrink-0">
                <img
                  src={designer.avatar}
                  alt={designer.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/designers/${designer.id}`}
                  className="block font-serif font-bold text-lg text-[#38241F] hover:text-[#541719] transition-colors truncate"
                >
                  {designer.name}
                </Link>
                <p className="text-xs font-sans text-[#541719] font-medium truncate">
                  {designer.title || designer.role}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-[#76665F] line-clamp-2 leading-relaxed font-sans font-normal">
              {designer.bio}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-[#76665F] font-sans pt-1 border-t border-[#E6D8CF]">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#9E8E87]" />
              <span>{designer.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-[#9E8E87]" />
              <span>{designer.yearsExperience}y exp</span>
            </div>
            <span className="font-mono text-[#38241F] font-bold">{designer.dayRate}</span>
          </div>

          {/* Skills Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {designer.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Action */}
      <div className="p-4 pt-3 border-t border-[#E6D8CF] bg-[#FFF9F3] flex items-center justify-between">
        <span className="text-xs text-[#76665F] font-sans flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#541719]" />
          <span>Vetted Portfolio</span>
        </span>

        <Link
          href={`/designers/${designer.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#541719] hover:underline"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};