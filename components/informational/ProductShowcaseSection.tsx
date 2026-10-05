"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers,
  Star,
  Users,
  Clock,
  Compass,
  FileCheck
} from "lucide-react";

export const ProductShowcaseSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-slate-50/70 border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">
        {/* ROW 1: SEE RICOZ IN ACTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text (Left) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase shadow-sm">
              <span>REAL-TIME MATCHING</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              See RICOZ In Action.
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Instead of browsing generic freelancer profiles or sending blind inquiries, RICOZ structures your creative mandate into concrete disciplines, sector experience, and deliverable milestones.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">
                  Multi-dimensional matching based on industry background, aesthetic craft, and enterprise scale.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">
                  Instant match score breakdowns showing exact reasons why a candidate fits your project.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">
                  Transparent hourly rates and confirmed availability updated weekly.
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/ai-match"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-md"
              >
                <span>Test Live Match Engine</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mockup (Right) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xl shadow-slate-200/60 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Squad Match Result
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                  3 Principals Matched
                </span>
              </div>

              {/* Match Card Sample */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        src="/images/talent/carlos-mendez.jpg"
                        alt="Mateo Silva"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Mateo Silva</div>
                      <div className="text-xs text-red-600 font-medium">Art Director & Visual Identity Lead</div>
                      <div className="text-[11px] text-slate-500">11 yrs exp • Ex-Koto / Wolff Olins</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
                      96% Match
                    </span>
                    <div className="text-[11px] font-mono text-slate-700 mt-1">$155/hr</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        src="/images/talent/sienna-rodriguez.jpg"
                        alt="Camille Dupuis"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Camille Dupuis</div>
                      <div className="text-xs text-red-600 font-medium">Packaging & Luxury Print Director</div>
                      <div className="text-[11px] text-slate-500">13 yrs exp • Paris, FR</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
                      95% Match
                    </span>
                    <div className="text-[11px] font-mono text-slate-700 mt-1">$170/hr</div>
                  </div>
                </div>
              </div>

              {/* Bottom Stat Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Verified Match Criteria: Tech & Rebrand</span>
                <span className="font-semibold text-slate-700">Estimated kickoff: 1-2 wks</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: FIND THE RIGHT CREATIVE EXPERTISE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Mockup (Left) */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xl shadow-slate-200/60 relative">
              <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden mb-5 border border-slate-200">
                <Image
                  src="/images/talent/portfolio/apex-ai-enterprise-brand-system-governance-portal.jpg"
                  alt="Portfolio Case Study"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider mb-1.5 inline-block">
                      Case Study
                    </span>
                    <div className="text-lg font-bold">Apex AI — Enterprise Brand Architecture & Token System</div>
                    <div className="text-xs text-slate-300">Deliverables: Brand Identity, Design Tokens, Governance Portal</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-slate-900">Enterprise Transformation</span>
                </div>
                <Link href="/talent" className="text-red-600 font-semibold hover:text-red-700">
                  Explore 57 Profiles & Case Studies →
                </Link>
              </div>
            </div>
          </div>

          {/* Text (Right) */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase shadow-sm">
              <span>SPECIALIZED TALENT</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Find The Right Creative Expertise.
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Great creative execution requires specialized focus. RICOZ gives you access to pre-vetted professionals across 19 critical creative disciplines.
            </p>

            {/* Discipline Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                "Creative Director",
                "Brand Strategist",
                "Brand Identity Designer",
                "UI/UX Designer",
                "Motion Designer",
                "Design Systems Specialist",
                "Packaging Designer",
                "Art Director",
                "Typographer",
                "Copywriter",
                "Brand Photographer",
                "Visual Identity Designer",
              ].map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  {role}
                </span>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/talent"
                className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <span>Browse the complete talent directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 3: FROM SHORTLIST TO PROJECT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text (Left) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase shadow-sm">
              <span>PROJECT GOVERNANCE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              From Shortlist To Project.
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Moving from discovery into production is seamless. Organize your shortlisted talent, finalize team roles, execute standardized mutual NDAs, and initiate project milestones in one centralized workspace.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">
                  Organized shortlist management with side-by-side profile comparisons.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">
                  Clear milestone deliverables with escrow protection and verified sign-offs.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">
                  Enterprise-ready IP assignment and mutual non-disclosure protection.
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/start-project"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
              >
                <span>Start a Project Mandate</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mockup (Right) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xl shadow-slate-200/60 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Project Delivery Roadmap
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Milestone 1 Active
                </span>
              </div>

              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Sprint 01: Strategic Positioning</div>
                    <div className="text-[11px] text-slate-500">Elena Rostova • Brand Architecture Dossier</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">Completed</span>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-white border border-red-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                    02
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Sprint 02: Visual Identity & Logomark</div>
                    <div className="text-[11px] text-slate-500">Mateo Silva • Vector Marks & Typographic Specimen</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-red-600 font-bold">In Progress</span>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    03
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Sprint 03: Design Tokens & System</div>
                    <div className="text-[11px] text-slate-500">Dominic Sterling • Figma Token Governance</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Queued</span>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Mutual NDA: Executed on File</span>
                <span>Milestone Escrow: Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
