"use client";

import React from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Sparkles, ArrowUpRight } from "lucide-react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/80 text-slate-600 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Wordmark markSize={26} variant="light" />
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              Connecting businesses with creative talent. Discover, evaluate and assemble senior creative directors, brand identity designers, and specialized talent for your next project.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-700 bg-white rounded-lg border border-slate-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>The Creative Talent Platform</span>
              </span>
            </div>
          </div>

          {/* Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 tracking-wider uppercase font-mono">
              Overview
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-red-600 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#why-ricoz" className="hover:text-red-600 transition-colors">
                  Why RICOZ
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-red-600 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-red-600 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Product Links (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 tracking-wider uppercase font-mono">
              Product & Talent
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/start-project"
                  className="font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/talent" className="hover:text-red-600 transition-colors">
                  Explore Talent Directory
                </Link>
              </li>
              <li>
                <Link href="/ai-match" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>AI Matching Engine (V3.1)</span>
                </Link>
              </li>
              <li>
                <Link href="/designers" className="hover:text-red-600 transition-colors">
                  Browse Specialists
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-red-600 transition-colors">
                  Sign In / Client Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & platform info */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 RICOZ Technologies, Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-xs font-mono">
            <span>PRE-VETTED CREATIVE PRINCIPALS</span>
            <span className="text-red-600 font-bold">•</span>
            <span>STANDARDIZED MUTUAL NDA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
