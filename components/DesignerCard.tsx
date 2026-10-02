"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Designer } from "@/types";
import { Badge } from "@/components/Badge";
import { MatchScore } from "@/components/MatchScore";
import { PortfolioVisual } from "@/components/PortfolioVisual";
import { Heart, MapPin, Briefcase, ArrowRight, ShieldCheck } from "lucide-react";
import { isShortlisted, toggleShortlist } from "@/lib/storage";

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
    <div className="group relative bg-surface border border-surface-border rounded-xl overflow-hidden hover:border-surface-borderLight transition-all duration-300 hover:-translate-y-1 hover:shadow-surface flex flex-col justify-between">
      {/* Accent Reveal Line on top hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

      <div>
        {/* Large Portfolio Artwork / Preview */}
        {showLargeVisual && leadProject && (
          <div className="relative overflow-hidden aspect-[16/10] bg-surface-muted border-b border-surface-border">
            <PortfolioVisual
              title={leadProject.title}
              client={leadProject.client}
              industry={leadProject.industry}
              palette={leadProject.palette}
              aspectRatio="aspect-[16/10]"
              className="w-full h-full transform transition-transform duration-700 group-hover:scale-105"
            />
            {/* Top overlay badge: Availability & Heart */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggle}
                className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                  shortlisted
                    ? "bg-accent-muted border-accent text-accent"
                    : "bg-background/70 border-surface-border text-brand-muted hover:text-white hover:border-surface-borderLight"
                }`}
                title={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
                aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${shortlisted ? "fill-accent text-accent" : ""}`}
                />
              </button>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-4">
          {/* Top metadata & Match Score */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  designer.availability === "Available now"
                    ? "bg-accent"
                    : designer.availability === "Available soon"
                    ? "bg-amber-400"
                    : "bg-brand-muted"
                }`}
              />
              <span className="text-[11px] font-mono text-brand-secondary">
                {designer.availability}
              </span>
            </div>

            <MatchScore score={displayMatch} size="sm" />
          </div>

          {/* Profile Details */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-surface-elevated text-brand font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-surface-border group-hover:border-accent/40 transition-colors">
              {designer.initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/designers/${designer.id}`}
                  className="font-bold text-base text-brand group-hover:text-accent transition-colors truncate"
                >
                  {designer.name}
                </Link>
                {designer.verified && (
                  <span title="Vetted Senior Rebranding Specialist">
                    <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-brand-secondary truncate">
                {designer.role}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-brand-muted">
                <span className="truncate">{designer.location}</span>
                <span>•</span>
                <span>{designer.yearsExperience} yrs exp</span>
              </div>
            </div>
          </div>

          {/* Bio Preview */}
          <p className="text-xs text-brand-secondary line-clamp-2 leading-relaxed">
            {designer.bio}
          </p>

          {/* Specialties & Sectors */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {designer.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] font-mono text-brand-secondary bg-surface-elevated border border-surface-border px-2 py-0.5 rounded"
                >
                  {skill}
                </span>
              ))}
              {designer.skills.length > 3 && (
                <span className="text-[10px] font-mono text-brand-muted px-1 py-0.5">
                  +{designer.skills.length - 3}
                </span>
              )}
            </div>

            <div className="text-[11px] font-mono text-brand-muted truncate">
              <span className="text-brand-muted/70 uppercase">Sectors:</span>{" "}
              {designer.industries.slice(0, 3).join(", ")}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Bar */}
      <div className="px-5 py-3.5 sm:px-6 bg-surface-muted border-t border-surface-border flex items-center justify-between text-xs">
        <span className="font-mono text-brand font-medium">
          {designer.dayRate}
        </span>

        <Link
          href={`/designers/${designer.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-secondary group-hover:text-accent transition-colors"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
