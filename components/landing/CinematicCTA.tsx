"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";

export function CinematicCTA() {
  return (
    <section className="py-32 sm:py-44 relative overflow-hidden bg-background border-t border-white/5 select-none">
      {/* Massive Ambient RICOZ Glow behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[850px] h-[450px] sm:h-[550px] rounded-full blur-[170px] pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(200,255,61,0.18) 0%, rgba(139,92,246,0.14) 40%, transparent 75%)",
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs font-mono text-accent uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
          <span>MATCH ENGINE IS LIVE</span>
        </div>

        <h2 className="text-[clamp(36px,6vw,80px)] font-black tracking-tight text-white leading-[1.05] uppercase font-sans max-w-4xl mx-auto">
          Your next great project<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent">
            starts with the right talent.
          </span>
        </h2>

        <p className="mt-8 text-base sm:text-lg text-brand-secondary max-w-xl mx-auto leading-relaxed">
          Define your project requirements in minutes and let our matching engine assemble the world’s finest creative directors and brand specialists.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/designers"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-accent text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-accent-hover transition-colors shadow-glow"
          >
            <span>Find Creative Talent</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard/company/projects/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/25 font-mono text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <span>Start a Project</span>
          </Link>
        </div>

        {/* Micro Trust Indicators */}
        <div className="mt-16 pt-10 border-t border-white/5 flex flex-wrap items-center justify-center gap-8 sm:gap-14 font-mono text-xs text-brand-muted">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>&lt; 48 Hour Match Speed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Top 3% Curated Talent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>100% IP Client Held</span>
          </div>
        </div>
      </div>
    </section>
  );
}
