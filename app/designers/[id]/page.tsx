"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { MatchScore } from "@/components/MatchScore";
import { PortfolioVisual } from "@/components/PortfolioVisual";
import { EmptyState } from "@/components/EmptyState";
import {
  getDesignerById,
  isShortlisted,
  toggleShortlist,
  startOrGetConversation,
  sendMessage,
} from "@/lib/storage";
import { Designer, PortfolioProject } from "@/types";
import {
  Heart,
  MessageSquare,
  MapPin,
  Briefcase,
  ShieldCheck,
  ArrowLeft,
  X,
  Send,
} from "lucide-react";

export default function DesignerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const designerId = params.id as string;

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [shortlisted, setShortlisted] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    if (designerId) {
      const found = getDesignerById(designerId);
      if (found) {
        setDesigner(found);
        setShortlisted(isShortlisted(found.id));
      }
    }
  }, [designerId]);

  if (!designer) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-brand">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20">
          <EmptyState
            title="Designer profile not found"
            description="The requested creative talent profile may have been relocated or is currently inactive."
            actionLabel="Return to talent directory"
            actionHref="/designers"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const handleShortlistToggle = () => {
    const nextState = toggleShortlist(designer.id);
    setShortlisted(nextState);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    const conv = startOrGetConversation(designer);
    sendMessage(conv.id, contactMessage.trim(), "Alex Vance (Vantage Robotics)");
    setContactModalOpen(false);
    router.push("/dashboard/company/messages");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* BREADCRUMB / BACK LINK */}
          <div className="mb-8">
            <Link
              href="/designers"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-muted hover:text-brand transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to talent directory</span>
            </Link>
          </div>

          {/* TOP PROFILE HEADER SECTION */}
          <div className="bg-surface/80 border border-surface-border rounded-xl p-6 sm:p-10 mb-10 shadow-subtle backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              {/* Left: Avatar & Primary Info */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface-elevated text-brand font-mono text-2xl font-bold flex items-center justify-center border-2 border-surface-border shrink-0 shadow-inner">
                  {designer.initials}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                      {designer.name}
                    </h1>
                    {designer.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono bg-accent/10 text-accent border border-accent/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                        Vetted Lead
                      </span>
                    )}
                  </div>

                  <p className="text-base text-brand font-medium">
                    {designer.role} —{" "}
                    <span className="font-normal text-brand-secondary">{designer.title}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-muted" />
                      {designer.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-brand-muted" />
                      {designer.yearsExperience} Years Experience
                    </span>
                    <span>•</span>
                    <span className="text-accent font-semibold">
                      {designer.dayRate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          designer.availability === "Available now"
                            ? "bg-accent shadow-[0_0_8px_rgba(200,255,61,0.6)]"
                            : "bg-amber-400"
                        }`}
                      />
                      <span className="text-xs font-mono text-brand-secondary">
                        {designer.availability}
                      </span>
                    </div>
                    <span className="text-surface-border">•</span>
                    <MatchScore
                      score={designer.matchPercentage || 94}
                      size="sm"
                      showBreakdownToggle
                      breakdown={{
                        skills: 96,
                        industry: 92,
                        experience: 95,
                        style: 90,
                        budget: 92,
                        availability: 94,
                        location: 92,
                      }}
                      keyStrengths={[
                        `${designer.role} Specialization`,
                        `${designer.yearsExperience}+ Years Proven Seniority`,
                        "Direct Sector Fit",
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex sm:flex-col items-center gap-3 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setContactModalOpen(true)}
                  icon={<MessageSquare className="w-4 h-4" />}
                  fullWidth
                >
                  Contact Designer
                </Button>

                <Button
                  variant={shortlisted ? "outline" : "secondary"}
                  size="md"
                  onClick={handleShortlistToggle}
                  icon={
                    <Heart
                      className={`w-4 h-4 ${
                        shortlisted ? "fill-accent text-accent" : "text-brand-muted"
                      }`}
                    />
                  }
                  fullWidth
                >
                  {shortlisted ? "Shortlisted" : "Add to Shortlist"}
                </Button>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN DETAILS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left 2 Columns: Bio, Experience Timeline & Portfolio */}
            <div className="lg:col-span-2 space-y-12">
              {/* ABOUT / BIOGRAPHY */}
              <section className="space-y-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
                  Professional Biography
                </h2>
                <p className="text-base text-brand-secondary leading-relaxed font-sans font-light">
                  {designer.bio}
                </p>
              </section>

              {/* PORTFOLIO GRID */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
                      Selected Rebranding Case Studies
                    </h2>
                    <h3 className="text-xl font-bold text-white mt-1 font-sans">
                      Visual Identity & Strategic Work
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-brand-muted">
                    {designer.portfolio.length} Projects
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {designer.portfolio.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProject(proj)}
                      className="group cursor-pointer bg-surface border border-surface-border rounded-lg overflow-hidden hover:border-accent/40 transition-all duration-200"
                    >
                      <PortfolioVisual
                        title={proj.title}
                        client={proj.client}
                        industry={proj.industry}
                        palette={proj.palette}
                        aspectRatio="aspect-[16/10]"
                      />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-brand-muted font-mono">
                          <span>{proj.industry}</span>
                          <span>{proj.year}</span>
                        </div>
                        <h4 className="font-medium text-sm text-brand group-hover:text-accent transition-colors">
                          {proj.title}
                        </h4>
                        <p className="text-xs text-brand-secondary line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                        <div className="pt-2 flex flex-wrap gap-1">
                          {proj.services.slice(0, 2).map((s) => (
                            <span
                              key={s}
                              className="text-[10px] font-mono text-brand-secondary bg-surface-elevated px-2 py-0.5 rounded border border-surface-border/50"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* EXPERIENCE TIMELINE */}
              <section className="space-y-6">
                <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
                  Career Trajectory & Tenures
                </h2>

                <div className="border-l border-surface-border pl-6 space-y-8">
                  {designer.experience.map((exp) => (
                    <div key={exp.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-surface border-2 border-surface-borderLight group-hover:border-accent transition-colors" />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h4 className="font-medium text-sm text-brand">
                            {exp.role}
                          </h4>
                          <span className="text-xs text-brand-secondary font-mono">
                            @ {exp.companyOrStudio}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-brand-muted block">
                          {exp.period}
                        </span>
                        <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Specializations, Industries & Client Roster */}
            <div className="space-y-8">
              {/* SPECIALIZATIONS */}
              <div className="bg-surface/80 border border-surface-border rounded-xl p-6 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-brand font-medium">
                  Core Specializations
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {designer.specializations.map((spec) => (
                    <Badge key={spec} variant="neutral" size="sm">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* SKILLS */}
              <div className="bg-surface/80 border border-surface-border rounded-xl p-6 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-brand font-medium">
                  Technical & Strategic Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {designer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs text-brand-secondary bg-surface-elevated border border-surface-border px-2.5 py-1 rounded font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* INDUSTRIES */}
              <div className="bg-surface/80 border border-surface-border rounded-xl p-6 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-brand font-medium">
                  Target Industries
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {designer.industries.map((ind) => (
                    <Badge key={ind} variant="subtle" size="sm">
                      {ind}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* PREVIOUS CLIENTS */}
              <div className="bg-surface/80 border border-surface-border rounded-xl p-6 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-brand font-medium">
                  Selected Past Engagements
                </h3>
                <ul className="space-y-2 text-xs text-brand-secondary font-mono">
                  {designer.previousClients.map((client) => (
                    <li key={client} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>{client}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ENTERPRISE VETTING ACCORD */}
              <div className="border border-surface-border rounded-xl p-6 space-y-3 bg-surface/80">
                <div className="flex items-center gap-2 text-brand font-medium text-xs">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Enterprise Security & NDA</span>
                </div>
                <p className="text-xs text-brand-secondary leading-relaxed font-light">
                  All Ricoz senior creatives operate under standard mutual intellectual property assignment frameworks and enterprise confidentiality agreements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CONTACT DIALOG MODAL */}
      {contactModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-designer-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-lg bg-surface border border-surface-border rounded-xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-elevated text-brand font-mono text-xs flex items-center justify-center font-bold border border-surface-border">
                  {designer.initials}
                </div>
                <div>
                  <h3 id="contact-designer-title" className="font-medium text-sm text-brand">
                    Contact {designer.name}
                  </h3>
                  <p className="text-xs text-brand-muted font-mono">{designer.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="p-1 text-brand-muted hover:text-brand"
                aria-label="Close contact dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                  Rebranding Project Context
                </label>
                <input
                  type="text"
                  readOnly
                  value="Vantage Robotics — Global Industrial Rebranding"
                  className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-xs font-mono text-brand-secondary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                  Initial Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={`Hi ${designer.name.split(" ")[0]}, we'd like to discuss our upcoming rebranding project and review your availability...`}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-3 text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setContactModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Send & Open Conversation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PORTFOLIO PROJECT CASE STUDY MODAL */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-2xl bg-surface border border-surface-border rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-surface-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider block">
                  {selectedProject.industry} • {selectedProject.year}
                </span>
                <h3 id="case-study-title" className="font-semibold text-base text-white font-sans">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="p-1 text-brand-muted hover:text-brand"
                aria-label="Close case study modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <PortfolioVisual
                title={selectedProject.title}
                client={selectedProject.client}
                industry={selectedProject.industry}
                palette={selectedProject.palette}
                aspectRatio="aspect-[16/9]"
              />

              <div className="space-y-4 text-xs md:text-sm text-brand-secondary leading-relaxed">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-accent font-medium mb-1">
                    Overview
                  </h4>
                  <p>{selectedProject.description}</p>
                </div>

                {selectedProject.challenge && (
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-accent font-medium mb-1">
                      The Enterprise Challenge
                    </h4>
                    <p>{selectedProject.challenge}</p>
                  </div>
                )}

                {selectedProject.solution && (
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-accent font-medium mb-1">
                      Strategic & Creative Solution
                    </h4>
                    <p>{selectedProject.solution}</p>
                  </div>
                )}

                {selectedProject.impact && (
                  <div className="p-4 bg-surface-elevated border border-surface-border rounded-lg">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-accent font-medium mb-1">
                      Commercial & Brand Impact
                    </h4>
                    <p className="font-medium text-brand">{selectedProject.impact}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-surface-border bg-surface-elevated flex justify-end">
              <Button size="sm" onClick={() => setSelectedProject(null)}>
                Close Case Study
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
