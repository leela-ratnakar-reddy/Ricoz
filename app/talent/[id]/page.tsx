"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Bookmark,
  Sparkles,
  ExternalLink,
  Award,
  Layers,
  Wrench,
  CheckCircle2,
  X,
  Share2,
  Zap,
  Clock
} from "lucide-react";
import { getTalentById, TALENT_PROFILES } from "@/data/talentProfiles";
import { PortfolioProject, TalentProfile } from "@/types/talent";
import { isShortlisted, toggleShortlist } from "@/lib/storage";
import { ShortlistDrawer } from "@/components/talent/ShortlistDrawer";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export default function TalentProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const talent = getTalentById(id);

  const [shortlisted, setShortlisted] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [portraitError, setPortraitError] = useState(false);

  useEffect(() => {
    if (talent) {
      setShortlisted(isShortlisted(talent.id));
      const handleUpdate = () => setShortlisted(isShortlisted(talent.id));
      window.addEventListener("brandroom_shortlist_updated", handleUpdate);
      return () => window.removeEventListener("brandroom_shortlist_updated", handleUpdate);
    }
  }, [talent]);

  if (!talent) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF6F0] text-[#38241F]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E6D8CF] rounded-3xl p-8 text-center shadow-card">
            <div className="w-14 h-14 rounded-full bg-[#FFF9F3] border border-[#E6D8CF] flex items-center justify-center mx-auto mb-4 text-[#76665F]">
              <X className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-serif font-bold text-[#38241F] mb-2">Talent Profile Not Found</h1>
            <p className="text-xs text-[#76665F] mb-6 leading-relaxed font-sans">
              The creative profile you are looking for does not exist or may have been relocated.
            </p>
            <Link
              href="/talent"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#541719] text-[#FFF9F3] font-semibold text-xs hover:bg-[#3E1012] transition-colors shadow-burgundy font-sans"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Browse All Creative Talent</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleToggleShortlist = () => {
    const newState = toggleShortlist(talent.id);
    setShortlisted(newState);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const renderAvailabilityBadge = (status: TalentProfile["availability"]) => {
    switch (status) {
      case "Available":
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-[#541719]/10 text-[#541719] border border-[#541719]/25">
            <span className="w-2 h-2 rounded-full bg-[#541719] animate-pulse" />
            Available for Projects
          </span>
        );
      case "Limited Availability":
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]">
            <span className="w-2 h-2 rounded-full bg-[#C7A99A]" />
            Limited Availability (Part-Time)
          </span>
        );
      case "Busy":
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-[#FFF9F3] text-[#9E8E87] border border-[#E6D8CF]">
            <span className="w-2 h-2 rounded-full bg-[#9E8E87]" />
            Booked Out (Waitlist Available)
          </span>
        );
    }
  };

  const relatedTalent = TALENT_PROFILES.filter(
    (t) => t.id !== talent.id && (t.role === talent.role || t.industries[0] === talent.industries[0])
  ).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF6F0] text-[#38241F] selection:bg-[#541719] selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Editorial Sub-navigation */}
        <div className="border-b border-[#E6D8CF] bg-[#FFF9F3]/95 backdrop-blur-md sticky top-[73px] z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <Link
              href="/talent"
              className="inline-flex items-center gap-2 text-xs font-sans font-medium text-[#76665F] hover:text-[#541719] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Creative Directory</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E6D8CF] text-xs font-sans text-[#38241F] hover:border-[#C7A99A] transition-colors shadow-subtle"
                title="Copy Profile URL"
              >
                <Share2 className="w-3.5 h-3.5 text-[#541719]" />
                <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
              </button>
              <button
                type="button"
                onClick={handleToggleShortlist}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-sans font-medium transition-all ${
                  shortlisted
                    ? "bg-[#541719] text-[#FFF9F3] border-[#541719] shadow-burgundy"
                    : "bg-white border-[#E6D8CF] text-[#38241F] hover:border-[#C7A99A] shadow-subtle"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${shortlisted ? "fill-current" : ""}`} />
                <span>{shortlisted ? "Shortlisted" : "Save to Shortlist"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Human Portrait Hero Header */}
        <div className="relative border-b border-[#E6D8CF] bg-gradient-to-b from-[#FFF9F3] via-[#FBF6F0] to-[#FBF6F0] pt-10 pb-12 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* Human Portrait + Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Large Editorial Human Portrait */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-white border border-[#E6D8CF] shadow-card shrink-0 relative group transition-colors aspect-square">
                  {!portraitError && talent.profileImage ? (
                    <img
                      src={talent.profileImage}
                      alt={talent.name}
                      onError={() => setPortraitError(true)}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#541719] to-[#38241F] text-[#FFF9F3] font-serif text-2xl font-bold">
                      {talent.initials || talent.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#38241F] tracking-tight">
                      {talent.name}
                    </h1>
                    {talent.featured && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-sans uppercase tracking-wider bg-[#541719]/10 text-[#541719] border border-[#541719]/25 font-bold">
                        <EditorialStar size={10} color="#541719" />
                        Curated Principal
                      </span>
                    )}
                  </div>

                  <p className="text-base sm:text-lg text-[#541719] font-sans font-medium">
                    {talent.role}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#76665F] pt-1 font-sans">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9E8E87]" />
                      <span>{talent.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#9E8E87]" />
                      <span>{talent.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#9E8E87]" />
                      <span className="font-mono text-[#38241F] font-bold">{talent.hourlyRate}</span>
                    </div>
                  </div>

                  {/* Short Bio */}
                  <p className="text-sm text-[#76665F] leading-relaxed max-w-2xl pt-2 font-sans font-normal">
                    {talent.bio}
                  </p>
                </div>
              </div>

              {/* Action Column */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 w-full md:w-auto shrink-0">
                <div>{renderAvailabilityBadge(talent.availability)}</div>
                <Link
                  href="/start-project"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-sm hover:bg-[#3E1012] active:scale-95 transition-all shadow-burgundy text-center"
                >
                  <Zap className="w-4 h-4" />
                  <span>Commission Mandate</span>
                </Link>
                <button
                  type="button"
                  onClick={handleToggleShortlist}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border text-xs font-sans font-medium transition-all ${
                    shortlisted
                      ? "bg-[#541719]/10 border-[#541719] text-[#541719] font-bold"
                      : "bg-white border-[#E6D8CF] text-[#38241F] hover:border-[#C7A99A] shadow-subtle"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${shortlisted ? "fill-[#541719]" : ""}`} />
                  <span>{shortlisted ? "Saved in Shortlist" : "Save to Shortlist"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 60% Visual Portfolio / 40% Profile Credentials Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Visual Portfolio Gallery Section (7/12 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6D8CF]">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#38241F] tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#541719]" />
                    Selected Portfolio & Works
                  </h2>
                  <p className="text-xs text-[#76665F] mt-1 font-sans">
                    Visual case studies demonstrating strategic process and creative execution.
                  </p>
                </div>
                <span className="text-xs font-sans text-[#76665F] px-3 py-1 rounded-full bg-white border border-[#E6D8CF]">
                  {talent.portfolio.length} Projects
                </span>
              </div>

              {/* Portfolio Showcase */}
              <div className="space-y-8">
                {/* 1. Large Featured Case Study (Project 0) */}
                {talent.portfolio.length > 0 && (() => {
                  const featuredProject = talent.portfolio[0];
                  return (
                    <div
                      key={featuredProject.id}
                      className="group rounded-3xl bg-white border border-[#E6D8CF] hover:border-[#C7A99A] overflow-hidden transition-all duration-300 shadow-card"
                    >
                      <div
                        className="relative aspect-[16/10] w-full overflow-hidden bg-[#FFF9F3] cursor-pointer"
                        onClick={() => setSelectedProject(featuredProject)}
                      >
                        {featuredProject.image ? (
                          <img
                            src={featuredProject.image}
                            alt={featuredProject.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#FFF9F3] flex items-center justify-center text-[#76665F] font-sans text-xs">
                            Featured Case Study Visual
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-sans uppercase tracking-wider font-bold bg-[#541719] text-[#FFF9F3] shadow-burgundy">
                            Featured Project
                          </span>
                          <span className="px-3 py-1 rounded-full text-[11px] font-sans font-semibold bg-white/95 backdrop-blur-md text-[#38241F] border border-[#E6D8CF]">
                            {featuredProject.projectType}
                          </span>
                        </div>

                        <div className="absolute bottom-3.5 right-3.5 z-10">
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-semibold bg-white/95 backdrop-blur-md text-[#38241F] border border-[#E6D8CF] group-hover:bg-[#541719] group-hover:text-[#FFF9F3] transition-colors shadow-subtle">
                            <span>View Case Study</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Featured Project Body */}
                      <div className="p-6 sm:p-7 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-sans text-[#76665F] mb-1">
                            <span>Industry: {featuredProject.industry}</span>
                            {featuredProject.client && (
                              <>
                                <span>•</span>
                                <span>Client: {featuredProject.client}</span>
                              </>
                            )}
                          </div>

                          <h3
                            onClick={() => setSelectedProject(featuredProject)}
                            className="text-xl font-serif font-bold text-[#38241F] hover:text-[#541719] transition-colors cursor-pointer"
                          >
                            {featuredProject.title}
                          </h3>
                        </div>

                        <p className="text-sm text-[#76665F] leading-relaxed font-sans font-normal">
                          {featuredProject.description}
                        </p>

                        {/* Deliverables / Services */}
                        {featuredProject.services && featuredProject.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {featuredProject.services.map((service) => (
                              <span
                                key={service}
                                className="px-3 py-1 rounded-full text-[11px] font-sans bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Impact Highlight */}
                        {featuredProject.impact && (
                          <div className="rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] p-4 flex items-start gap-3">
                            <Award className="w-4 h-4 text-[#541719] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-sans uppercase tracking-wider text-[#541719] font-bold mb-0.5">
                                Outcome & Impact
                              </p>
                              <p className="text-xs text-[#38241F] leading-relaxed font-sans font-medium">
                                {featuredProject.impact}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Smaller Supporting Projects */}
                {talent.portfolio.length > 1 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#76665F]">
                        Supporting Selected Works
                      </h3>
                      <span className="text-[11px] font-sans text-[#9E8E87]">
                        {talent.portfolio.length - 1} additional projects
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {talent.portfolio.slice(1).map((project) => (
                        <div
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className="group/card rounded-3xl bg-white border border-[#E6D8CF] hover:border-[#C7A99A] overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 shadow-subtle hover:shadow-card"
                        >
                          <div>
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FFF9F3]">
                              {project.image ? (
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#FFF9F3] flex items-center justify-center text-[#76665F] font-sans text-xs">
                                  Case Study Visual
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-white/95 backdrop-blur-md text-[#38241F] border border-[#E6D8CF]">
                                  {project.projectType}
                                </span>
                              </div>
                            </div>

                            <div className="p-4 space-y-2">
                              <p className="text-[11px] font-sans text-[#9E8E87]">
                                {project.industry} {project.client ? `• ${project.client}` : ""}
                              </p>
                              <h4 className="text-sm font-serif font-bold text-[#38241F] group-hover/card:text-[#541719] transition-colors line-clamp-2 leading-snug">
                                {project.title}
                              </h4>
                              <p className="text-xs text-[#76665F] line-clamp-2 leading-relaxed font-sans">
                                {project.description}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 pt-0 flex items-center justify-between text-xs font-sans font-semibold text-[#541719]">
                            <span>View Case Study</span>
                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar / Profile Credentials (5/12 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Credentials Card */}
              <div className="bg-white border border-[#E6D8CF] rounded-3xl p-6 sm:p-7 space-y-6 shadow-card">
                {/* Core Expertise */}
                <div>
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#76665F] mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#541719]" />
                    Core Expertise
                  </h3>
                  <div className="space-y-2">
                    {talent.specializations.map((spec) => (
                      <Link
                        key={spec}
                        href={`/talent?discipline=${encodeURIComponent(spec)}`}
                        className="flex items-center gap-2.5 text-xs text-[#38241F] hover:text-[#541719] font-sans group transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#541719] shrink-0" />
                        <span className="font-semibold group-hover:underline">{spec}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Key Skills */}
                <div className="pt-4 border-t border-[#E6D8CF]">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#76665F] mb-3">
                    Skills & Disciplines
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {talent.skills.map((skill) => (
                      <Link
                        key={skill}
                        href={`/talent?search=${encodeURIComponent(skill)}`}
                        className="px-3 py-1 rounded-full text-xs font-sans bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF] hover:border-[#541719] hover:text-[#541719] transition-colors"
                      >
                        {skill}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Industry Sectors */}
                <div className="pt-4 border-t border-[#E6D8CF]">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#76665F] mb-3">
                    Industry Experience
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {talent.industries.map((ind) => (
                      <Link
                        key={ind}
                        href={`/talent?industry=${encodeURIComponent(ind)}`}
                        className="px-3 py-1 rounded-full text-xs font-sans bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF] hover:border-[#541719] hover:text-[#541719] transition-colors"
                      >
                        {ind}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Production Tools & Software */}
                <div className="pt-4 border-t border-[#E6D8CF]">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#76665F] mb-3 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#9E8E87]" />
                    Tools & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {talent.tools.map((tl) => (
                      <span
                        key={tl}
                        className="px-3 py-1 rounded-full text-xs font-sans bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]"
                      >
                        {tl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Working Style & Specs */}
                <div className="pt-4 border-t border-[#E6D8CF] space-y-2.5 text-xs font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-[#76665F]">Work Style:</span>
                    <span className="text-[#38241F] font-semibold">{talent.workMode.join(" / ")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#76665F]">Languages:</span>
                    <span className="text-[#38241F] font-semibold">{talent.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#76665F]">Engagement Rate:</span>
                    <span className="font-mono text-[#541719] font-bold">{talent.hourlyRate}</span>
                  </div>
                </div>

                {/* Direct CTA */}
                <Link
                  href="/start-project"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-xs hover:bg-[#3E1012] transition-all shadow-burgundy"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Request Mandate Proposal</span>
                </Link>
              </div>

              {/* Similar Creative Specialists */}
              {relatedTalent.length > 0 && (
                <div className="bg-white border border-[#E6D8CF] rounded-3xl p-6 shadow-subtle">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#76665F] mb-4">
                    Similar Creative Specialists
                  </h3>
                  <div className="space-y-3">
                    {relatedTalent.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/talent/${rel.id}`}
                        className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] hover:border-[#C7A99A] transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-[#E6D8CF] shrink-0">
                            {rel.profileImage ? (
                              <img
                                src={rel.profileImage}
                                alt={rel.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-serif font-bold text-[#38241F]">
                                {rel.initials}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-serif font-bold text-[#38241F] group-hover:text-[#541719] transition-colors">
                              {rel.name}
                            </p>
                            <p className="text-[11px] text-[#76665F] truncate max-w-[140px] sm:max-w-[180px] font-sans">
                              {rel.role}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#541719] font-bold shrink-0">{rel.hourlyRate}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Case Study Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#38241F]/60 backdrop-blur-md">
            <div
              className="fixed inset-0"
              onClick={() => setSelectedProject(null)}
            />
            <div className="relative w-full max-w-3xl bg-white border border-[#E6D8CF] rounded-3xl overflow-hidden z-10 shadow-card max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
              {/* Modal Visual Header */}
              {selectedProject.image && (
                <div className="relative aspect-[16/9] w-full bg-[#FFF9F3] shrink-0 overflow-hidden">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-md text-[#38241F] hover:bg-white transition-all border border-[#E6D8CF]"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center gap-2 text-xs font-sans text-white/90 mb-1.5 font-semibold">
                      <span>{selectedProject.projectType}</span>
                      <span>•</span>
                      <span>{selectedProject.industry}</span>
                      {selectedProject.year && <span>• {selectedProject.year}</span>}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">
                      {selectedProject.title}
                    </h3>
                  </div>
                </div>
              )}

              {/* Modal Content Scroll Area */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                {selectedProject.client && (
                  <p className="text-xs text-[#76665F] font-sans">
                    Client: <span className="text-[#38241F] font-bold">{selectedProject.client}</span>
                  </p>
                )}

                <div>
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#9E8E87] mb-2">
                    Case Narrative & Strategy
                  </h4>
                  <p className="text-sm text-[#76665F] leading-relaxed font-sans font-normal">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.deliverables && (
                  <div>
                    <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#9E8E87] mb-2">
                      Key Deliverables
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProject.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-[#38241F] font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#541719] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProject.services && (
                  <div>
                    <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#9E8E87] mb-2">
                      Methods & Services Provided
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.services.map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1 rounded-full text-xs font-sans bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.impact && (
                  <div className="rounded-2xl bg-[#FFF9F3] border border-[#541719]/25 p-4">
                    <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#541719] mb-1">
                      Business & Category Impact
                    </h4>
                    <p className="text-xs sm:text-sm text-[#38241F] font-sans font-medium leading-relaxed">
                      {selectedProject.impact}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-[#E6D8CF] flex items-center justify-between">
                  <span className="text-xs text-[#76665F] font-sans">
                    Lead: {talent.name} ({talent.role})
                  </span>
                  <Link
                    href="/start-project"
                    onClick={() => setSelectedProject(null)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#541719] text-[#FFF9F3] font-semibold text-xs hover:bg-[#3E1012] transition-colors shadow-burgundy font-sans"
                  >
                    <span>Commission Mandate</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ShortlistDrawer />
      <Footer />
    </div>
  );
}