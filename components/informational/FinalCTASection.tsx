"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Users } from "lucide-react";

export const FinalCTASection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Background Decorative Red Gradient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-80 bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-14 lg:p-16 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          {/* Subtle Ambient Red Glow Inside Container */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GET STARTED TODAY</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Ready To Find The Right Creative Talent?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Tell us what you're building and discover the creative expertise you need to move your project forward.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/start-project"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-red-600 text-white font-semibold text-base hover:bg-red-700 active:bg-red-800 transition-all shadow-lg shadow-red-600/30 group"
              >
                <span>Start A Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/talent"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-base transition-all"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Explore Talent</span>
              </Link>
            </div>

            <div className="pt-6 text-xs text-slate-400 font-mono flex items-center justify-center gap-6">
              <span>✓ Standard Mutual NDA</span>
              <span>✓ Verified Portfolios</span>
              <span>✓ No Obligation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
