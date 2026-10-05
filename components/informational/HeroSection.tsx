"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles, Star, ShieldCheck, Layers, Users } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white border-b border-slate-100">
      {/* Subtle Background Accent Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-red-100/60 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-rose-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT: EDITORIAL COPY & CALL TO ACTIONS */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-8">
            {/* EYEBROW */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/70 text-red-600 text-xs font-bold tracking-wider uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>THE CREATIVE TALENT PLATFORM</span>
            </div>

            {/* MAIN HEADING */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.12]">
              Great Projects Start With The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-600 to-rose-600">
                Right Creative Talent.
              </span>
            </h1>

            {/* SUPPORTING TEXT */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
              RICOZ helps businesses discover, evaluate and connect with creative professionals for their next project — from creative direction and brand identity to specialized design talent.
            </p>

            {/* CTAS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/start-project"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-red-600 text-white font-semibold text-base shadow-lg shadow-red-600/25 hover:bg-red-700 active:bg-red-800 transition-all group"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/talent"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-base shadow-sm hover:border-slate-300 transition-all"
              >
                <span>Explore Talent</span>
              </Link>
            </div>

            {/* QUALITATIVE PLATFORM TRUST PILLARS */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <span>Curated Studio Principals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <span>Project-Based Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <span>19 Creative Disciplines</span>
              </div>
            </div>
          </div>

          {/* RIGHT: REAL PRODUCT COMPOSITION & MOCKUP */}
          <div className="lg:col-span-6 xl:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Back Card: AI Match Result Preview */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-300/40 p-5 sm:p-7 relative z-10 transition-all">
                {/* Product Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Project Talent Match
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        Acme Cloud // Global Brand Architecture
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    98% Match
                  </span>
                </div>

                {/* Primary Talent Profile Preview (Elena Rostova) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4 hover:border-slate-200 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
                      <Image
                        src="/images/talent/marcus-vance.jpg"
                        alt="Elena Rostova"
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-base truncate">
                          Elena Rostova
                        </div>
                        <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          $165/hr
                        </span>
                      </div>
                      <p className="text-xs font-medium text-red-600 mb-2">
                        Brand Strategist & Architecture Lead
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 text-[11px] rounded bg-white text-slate-600 border border-slate-200">
                          Ex-Pentagram
                        </span>
                        <span className="px-2 py-0.5 text-[11px] rounded bg-white text-slate-600 border border-slate-200">
                          Tech Category Creation
                        </span>
                        <span className="px-2 py-0.5 text-[11px] rounded bg-white text-slate-600 border border-slate-200">
                          12 yrs exp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Talent Profile Preview (Marcus Vance) */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-sm mb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
                      <Image
                        src="/images/talent/julian-mercer.jpg"
                        alt="Julian Mercer"
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-base truncate">
                          Julian Mercer
                        </div>
                        <span className="text-xs font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          $175/hr
                        </span>
                      </div>
                      <p className="text-xs font-medium text-red-600 mb-2">
                        Creative Director & Design Systems Lead
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 text-[11px] rounded bg-slate-50 text-slate-600 border border-slate-200">
                          Ex-Wired / Apple
                        </span>
                        <span className="px-2 py-0.5 text-[11px] rounded bg-slate-50 text-slate-600 border border-slate-200">
                          Design Tokens
                        </span>
                        <span className="px-2 py-0.5 text-[11px] rounded bg-slate-50 text-slate-600 border border-slate-200">
                          14 yrs exp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Shortlist Action Strip */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                        ER
                      </div>
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                        JM
                      </div>
                      <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                        CD
                      </div>
                    </div>
                    <span className="font-semibold text-slate-700">3 Specialists Shortlisted</span>
                  </div>
                  <Link
                    href="/start-project"
                    className="text-red-600 font-semibold hover:text-red-700 flex items-center gap-1"
                  >
                    <span>Assemble Squad</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Floating Pill Accent 1: Top Right */}
              <div className="hidden sm:flex absolute -top-5 -right-5 z-20 items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Studio Portfolios</span>
              </div>

              {/* Floating Pill Accent 2: Bottom Left */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 z-20 items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-xl border border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>100% Mutual NDA Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
