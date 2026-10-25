import React from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { EditorialStar } from "@/components/ui/EditorialDecorations";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFF9F3] border-t border-[#E6D8CF] text-[#76665F] text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Wordmark markSize={26} />
            <p className="text-[#76665F] text-xs leading-relaxed max-w-sm">
              Connecting ambitious enterprise companies with senior Creative Directors, Brand Architects, and Specialized Design Teams for transformational rebranding and product mandates.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-sans font-medium text-[#541719] bg-white rounded-full border border-[#E6D8CF] shadow-subtle">
                <EditorialStar size={10} color="#541719" />
                Curated Creative-Tech Network
              </span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#38241F] tracking-wider uppercase">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/talent" className="hover:text-[#541719] transition-colors">
                  Find Creative Talent
                </Link>
              </li>
              <li>
                <Link href="/ai-match" className="hover:text-[#541719] transition-colors">
                  AI Match Engine
                </Link>
              </li>
              <li>
                <Link href="/designers" className="hover:text-[#541719] transition-colors">
                  Explore Designers
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#541719] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-[#541719] transition-colors">
                  For Companies
                </Link>
              </li>
              <li>
                <Link href="/creatives" className="hover:text-[#541719] transition-colors">
                  For Creatives
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#38241F] tracking-wider uppercase">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">About Ricoz</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Curatorial Board</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Enterprise Careers</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Press & Media</span>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#541719] transition-colors">
                  Operations Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#38241F] tracking-wider uppercase">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Rebranding Guide</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Creative Strategy Briefs</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Design System ROI</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Typography Specimens</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#38241F] tracking-wider uppercase">
              Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Enterprise NDA & IP</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Escrow Safeguards</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Vetting Standards</span>
              </li>
              <li>
                <span className="hover:text-[#541719] cursor-pointer transition-colors">Terms of Mandate</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E6D8CF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9E8E87]">
          <p>© {new Date().getFullYear()} RICOZ Collective Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#541719] cursor-pointer">Privacy Notice</span>
            <span className="hover:text-[#541719] cursor-pointer">Security Practices</span>
            <span className="hover:text-[#541719] cursor-pointer">System Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};