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
  Globe,
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
      <div className="min-h-screen flex flex-col bg-background text-brand">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#111114] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <X className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Talent Profile Not Found</h1>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              The creative profile you are looking for does not exist or may have been relocated.
            </p>
            <Link
              href="/talent"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent-hover transition-colors shadow-glow"
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
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/30">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Available for Projects
          </span>
        );
      case "Limited Availability":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/30">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Limited Availability (Part-Time)
          </span>
        );
      case "Busy":
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            Booked Out (Waitlist Available)
          </span>
        );
    }
  };

  // Related talent
  const relatedTalent = TALENT_PROFILES.filter(
    (t) => t.id !== talent.id && (t.role === talent.role || t.industries[0] === talent.industries[0])
  ).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand selection:bg-accent selection:text-background">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Editorial Sub-navigation */}
        <div className="border-b border-white/5 bg-[#0C0C0E]/80 backdrop-blur-md sticky top-[73px] z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <Link
              href="/talent"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Creative Directory</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
                title="Copy Profile URL"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
              </button>
              <button
                type="button"
                onClick={handleToggleShortlist}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  shortlisted
                    ? "bg-accent text-black border-accent shadow-glow"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${shortlisted ? "fill-current" : ""}`} />
                <span>{shortlisted ? "Shortlisted" : "Save to Shortlist"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Human Portrait Hero Header */}
        <div className="relative border-b border-white/5 bg-gradient-to-b from-[#131317] via-[#0E0E11] to-background pt-10 pb-12 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-accent/5 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* Human Portrait + Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Large Editorial Human Portrait */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-zinc-900 border border-white/15 group-hover:border-accent/40 shadow-2xl shrink-0 relative group transition-colors aspect-square">
                  {!portraitError && talent.profileImage ? (
                    <img
                      src={talent.profileImage}
                      alt={talent.name}
                      onError={() => setPortraitError(true)}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-white font-mono text-2xl font-bold">
                      {talent.initials || talent.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {talent.name}
                    </h1>
                    {talent.featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        Featured Master
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-white/5 border border-white/10">
                      Demo Profile
                    </span>
                  </div>

                  <p className="text-base sm:text-lg text-accent font-medium">
                    {talent.role}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{talent.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{talent.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-mono text-white font-semibold">{talent.hourlyRate}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-zinc-500">
                      <span>•</span>
                      <span className="text-[11px] font-mono text-zinc-400">Fictional Portfolio</span>
                    </div>
                  </div>

                  {/* Short Bio (Readable line length) */}
                  <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl pt-2 font-normal">
                    {talent.bio}
                  </p>
                </div>
              </div>

              {/* Action Column */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 w-full md:w-auto shrink-0">
                <div>{renderAvailabilityBadge(talent.availability)}</div>
                <Link
                  href="/dashboard/company/projects/new"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover active:bg-[#B5F228] transition-all shadow-glow text-center"
                >
                  <Zap className="w-4 h-4" />
                  <span>Start Project with {talent.name.split(" ")[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleToggleShortlist}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    shortlisted
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${shortlisted ? "fill-current" : ""}`} />
                  <span>{shortlisted ? "Saved in Shortlist" : "Save to Shortlist"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 60% Visual Portfolio / 40% Profile Credentials Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Visual Portfolio Gallery Section (60% prominence: 7/12 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-accent" />
                    Selected Portfolio & Work
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Visual case studies demonstrating strategic process and creative execution.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  {talent.portfolio.length} Projects
                </span>
              </div>

              {/* Portfolio Showcase: Large Featured Project + Supporting Projects */}
              <div className="space-y-8">
                {/* 1. Large Featured Case Study (Project 0) */}
                {talent.portfolio.length > 0 && (() => {
                  const featuredProject = talent.portfolio[0];
                  return (
                    <div
                      key={featuredProject.id}
                      className="group rounded-2xl bg-[#111114] border border-white/10 hover:border-white/25 overflow-hidden transition-all duration-300 shadow-xl"
                    >
                      {/* Large Featured Project Visual */}
                      <div
                        className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 cursor-pointer"
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
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-mono text-xs">
                            Featured Case Study Visual
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-accent text-black shadow-glow">
                            Featured Project
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-black/70 backdrop-blur-md text-white border border-white/15">
                            {featuredProject.projectType}
                          </span>
                          {featuredProject.year && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-300 bg-black/70 backdrop-blur-md border border-white/10">
                              {featuredProject.year}
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 right-3 z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/80 backdrop-blur-md text-white border border-white/20 group-hover:bg-accent group-hover:text-black transition-colors">
                            <span>View Case Study</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Featured Project Body */}
                      <div className="p-6 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
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
                            className="text-xl font-bold text-white hover:text-accent transition-colors cursor-pointer"
                          >
                            {featuredProject.title}
                          </h3>
                        </div>

                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {featuredProject.description}
                        </p>

                        {/* Deliverables / Services */}
                        {featuredProject.services && featuredProject.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {featuredProject.services.map((service) => (
                              <span
                                key={service}
                                className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/5 text-zinc-300 border border-white/5"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Impact Highlight */}
                        {featuredProject.impact && (
                          <div className="rounded-xl bg-accent/5 border border-accent/20 p-3.5 flex items-start gap-3">
                            <Award className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold mb-0.5">
                                Outcome & Impact
                              </p>
                              <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                                {featuredProject.impact}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Smaller Supporting Projects (Grid) */}
                {talent.portfolio.length > 1 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                        Supporting Selected Works
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {talent.portfolio.length - 1} additional projects
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {talent.portfolio.slice(1).map((project) => (
                        <div
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className="group/card rounded-2xl bg-[#111114] border border-white/10 hover:border-white/25 overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 shadow-lg"
                        >
                          <div>
                            {/* Project Visual */}
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                              {project.image ? (
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-mono text-xs">
                                  Case Study Visual
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                              {/* Badges */}
                              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-black/75 backdrop-blur-md text-accent border border-accent/30">
                                  {project.projectType}
                                </span>
                                {project.year && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-zinc-300 bg-black/75 backdrop-blur-md border border-white/10">
                                    {project.year}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Body */}
                            <div className="p-4 space-y-2">
                              <p className="text-[11px] font-mono text-zinc-400">
                                {project.industry} {project.client ? `• ${project.client}` : ""}
                              </p>
                              <h4 className="text-sm font-bold text-white group-hover/card:text-accent transition-colors line-clamp-2 leading-snug">
                                {project.title}
                              </h4>
                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                                {project.description}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 pt-0 flex items-center justify-between text-xs font-semibold text-accent group-hover/card:text-white transition-colors">
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

            {/* Sidebar / Profile Credentials (40% prominence: 5/12 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Credentials Card */}
              <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
                {/* Core Expertise */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    Core Expertise
                  </h3>
                  <div className="space-y-2">
                    {talent.specializations.map((spec) => (
                      <div
                        key={spec}
                        className="flex items-center gap-2.5 text-xs text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="font-medium">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Skills */}
                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                    Skills & Disciplines
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {talent.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#16161A] text-zinc-200 border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Industry Sectors */}
                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                    Industry Experience
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {talent.industries.map((ind) => (
                      <span
                        key={ind}
                        className="px-2.5 py-1 rounded-md text-xs bg-[#16161A] text-zinc-300 border border-white/5"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Production Tools & Software */}
                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-zinc-500" />
                    Tools & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {talent.tools.map((tl) => (
                      <span
                        key={tl}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#16161A] text-zinc-300 border border-white/5"
                      >
                        {tl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Working Style & Specs */}
                <div className="pt-4 border-t border-white/5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-mono">Work Style:</span>
                    <span className="text-white font-medium">{talent.workMode.join(" / ")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-mono">Languages:</span>
                    <span className="text-white font-medium">{talent.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-mono">Engagement Rate:</span>
                    <span className="font-mono text-accent font-bold">{talent.hourlyRate}</span>
                  </div>
                </div>

                {/* Direct CTA */}
                <Link
                  href="/dashboard/company/projects/new"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent-hover transition-all shadow-glow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Request Project Proposal</span>
                </Link>
              </div>

              {/* Similar Creative Specialists */}
              {relatedTalent.length > 0 && (
                <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4">
                    Similar Creative Specialists
                  </h3>
                  <div className="space-y-3">
                    {relatedTalent.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/talent/${rel.id}`}
                        className="p-3 rounded-xl bg-[#16161A] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                            {rel.profileImage ? (
                              <img
                                src={rel.profileImage}
                                alt={rel.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-mono font-bold text-white">
                                {rel.initials}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white group-hover:text-accent transition-colors">
                              {rel.name}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate max-w-[140px] sm:max-w-[180px]">
                              {rel.role}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-accent shrink-0">{rel.hourlyRate}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Case Study Detail Modal with Large Visual */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setSelectedProject(null)}
            />
            <div className="relative w-full max-w-3xl bg-[#111114] border border-white/15 rounded-3xl overflow-hidden z-10 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
              {/* Modal Visual Header */}
              {selectedProject.image && (
                <div className="relative aspect-[16/9] w-full bg-zinc-900 shrink-0 overflow-hidden">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/40" />

                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/90 transition-all border border-white/15"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center gap-2 text-xs font-mono text-accent mb-1.5">
                      <span>{selectedProject.projectType}</span>
                      <span>•</span>
                      <span>{selectedProject.industry}</span>
                      {selectedProject.year && <span>• {selectedProject.year}</span>}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">
                      {selectedProject.title}
                    </h3>
                  </div>
                </div>
              )}

              {/* Modal Content Scroll Area */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                {selectedProject.client && (
                  <p className="text-xs text-zinc-400 font-mono">
                    Client: <span className="text-white font-medium">{selectedProject.client}</span>
                  </p>
                )}

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Case Narrative & Strategy
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.deliverables && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                      Key Deliverables
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProject.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-zinc-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProject.services && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                      Methods & Services Provided
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.services.map((service) => (
                        <span
                          key={service}
                          className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 text-zinc-300 border border-white/5"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.impact && (
                  <div className="rounded-2xl bg-accent/10 border border-accent/25 p-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold mb-1">
                      Business & Category Impact
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-100 font-medium leading-relaxed">
                      {selectedProject.impact}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">
                    Lead: {talent.name} ({talent.role})
                  </span>
                  <Link
                    href="/dashboard/company/projects/new"
                    onClick={() => setSelectedProject(null)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent-hover transition-colors shadow-glow"
                  >
                    <span>Start Similar Project</span>
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
