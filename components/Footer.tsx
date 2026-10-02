import React from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background-secondary border-t border-surface-border text-brand-secondary text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Wordmark markSize={26} />
            <p className="text-brand-muted text-xs leading-relaxed max-w-sm">
              Connecting ambitious enterprise companies with senior Creative Directors, Brand Identity Designers, and Typography specialists for transformational rebranding mandates.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono text-brand-secondary bg-surface rounded border border-surface-border">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                V2.0 Luxury Creative-Tech Network
              </span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-brand tracking-widest uppercase font-mono">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/designers" className="hover:text-accent transition-colors">
                  Explore Designers
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-accent transition-colors">
                  For Companies
                </Link>
              </li>
              <li>
                <Link href="/creatives" className="hover:text-accent transition-colors">
                  For Creatives
                </Link>
              </li>
              <li>
                <Link href="/dashboard/company/projects/new" className="hover:text-accent transition-colors">
                  Start a Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-brand tracking-widest uppercase font-mono">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">About Ricoz</span>
              </li>
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Curatorial Board</span>
              </li>
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Enterprise Careers</span>
              </li>
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Press & Media</span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-brand tracking-widest uppercase font-mono">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Rebranding Guide</span>
              </li>
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Creative Strategy Briefs</span>
              </li>
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Design System ROI</span>
              </li>
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Typography Specimens</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-brand tracking-widest uppercase font-mono">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Privacy Charter</span>
              </li>
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Enterprise Terms</span>
              </li>
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Mutual NDA Protocols</span>
              </li>
              <li>
                <span className="hover:text-accent cursor-pointer transition-colors">Security Standards</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 border-t border-surface-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-muted font-mono">
          <div>
            © 2026 Ricoz Technologies, Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[10px]">
            <span>3D TYPOGRAPHY EDITION</span>
            <span className="text-accent">LETTER R CORE</span>
            <span>ENTERPRISE REBRANDING</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
