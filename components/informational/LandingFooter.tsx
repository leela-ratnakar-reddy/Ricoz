"use client";

import React from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { ArrowUpRight, PhoneCall, ShieldCheck, Mail } from "lucide-react";
import { EditorialStar } from "@/components/ui/EditorialDecorations";

interface LandingFooterProps {
  onOpenBriefing?: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenBriefing }) => {
  return (
    <footer className="bg-[#FFF9F3] border-t border-[#E6D8CF] text-[#76665F] text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* 5-COLUMN AGENCY FOOTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Wordmark markSize={26} />
            <p className="text-[#76665F] text-xs sm:text-sm leading-relaxed max-w-sm">
              RICOZ is an editorial creative talent network connecting ambitious enterprises directly with verified Creative Directors, Brand Architects, and specialized design teams.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-sans text-[#541719] bg-white rounded-full border border-[#E6D8CF] shadow-subtle">
                <EditorialStar size={10} color="#541719" />
                <span>Curated Senior Principals (Top 3% Vetted)</span>
              </span>
            </div>
          </div>

          {/* Column 2: Creative Disciplines (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#38241F] tracking-wider uppercase">
              Disciplines
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/talent" className="hover:text-[#541719] transition-colors">
                  Creative Direction
                </Link>
              </li>
              <li>
                <Link href="/talent" className="hover:text-[#541719] transition-colors">
                  Brand Strategy
                </Link>
              </li>
              <li>
                <Link href="/talent" className="hover:text-[#541719] transition-colors">
                  Brand Identity
                </Link>
              </li>
              <li>
                <Link href="/talent" className="hover:text-[#541719] transition-colors">
                  UI/UX Architecture
                </Link>
              </li>
              <li>
                <Link href="/talent" className="hover:text-[#541719] transition-colors">
                  Packaging Design
                </Link>
              </li>
              <li>
                <Link href="/talent" className="hover:text-[#541719] transition-colors">
                  Motion & 3D
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Discovery (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#38241F] tracking-wider uppercase">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/talent" className="hover:text-[#541719] transition-colors">
                  Talent Directory (57)
                </Link>
              </li>
              <li>
                <Link href="/ai-match" className="hover:text-[#541719] transition-colors">
                  AI Match Engine V3.1
                </Link>
              </li>
              <li>
                <Link href="/designers" className="hover:text-[#541719] transition-colors">
                  Featured Designers
                </Link>
              </li>
              <li>
                <a href="#mandate-estimator" className="hover:text-[#541719] transition-colors">
                  Scope & Fee Estimator
                </a>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#541719] transition-colors">
                  4-Step Progression
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#541719] transition-colors">
                  Admin Operations Suite
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance & Safeguards (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#38241F] tracking-wider uppercase">
              Safeguards
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#541719]" />
                <span className="hover:text-[#541719] cursor-pointer">Milestone Escrow</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer">Mutual Enterprise NDA</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer">100% IP Assignment</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer">Replacement Guarantee</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer">Security Compliance</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Direct Inquiries & Concierge (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#38241F] tracking-wider uppercase">
              Mandate Intake
            </h4>
            <p className="text-xs text-[#76665F]">
              Have an urgent rebranding or high-stakes launch mandate?
            </p>
            {onOpenBriefing && (
              <button
                type="button"
                onClick={onOpenBriefing}
                className="w-full py-2 px-3 rounded-full text-xs font-semibold bg-white border border-[#E6D8CF] text-[#38241F] hover:bg-[#FBF6F0] hover:text-[#541719] transition-colors flex items-center justify-center gap-1.5 shadow-subtle"
              >
                <PhoneCall className="w-3 h-3 text-[#541719]" />
                <span>Concierge Briefing</span>
              </button>
            )}
            <div className="pt-1">
              <Link
                href="/start-project"
                className="text-xs text-[#541719] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Submit self-serve brief</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Agency Bar */}
        <div className="pt-8 border-t border-[#E6D8CF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9E8E87]">
          <p>© {new Date().getFullYear()} RICOZ Collective Inc. Curated Creative Direction Platform.</p>
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="hover:text-[#541719]">
              How it works
            </Link>
            <Link href="/companies" className="hover:text-[#541719]">
              For Enterprise
            </Link>
            <Link href="/creatives" className="hover:text-[#541719]">
              For Creatives
            </Link>
            <span className="hover:text-[#541719] cursor-pointer">Privacy & Legal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};