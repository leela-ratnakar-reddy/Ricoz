"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { getCurrentUser } from "@/lib/storage";
import { User } from "@/types";
import { Menu, X, ArrowRight, LayoutDashboard, Sparkles, Users, PhoneCall } from "lucide-react";
import { EditorialStar } from "@/components/ui/EditorialDecorations";

interface LandingNavbarProps {
  onOpenBriefing?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onOpenBriefing }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const onUserUpdate = () => setCurrentUser(getCurrentUser());
    window.addEventListener("brandroom_user_updated", onUserUpdate);
    return () => window.removeEventListener("brandroom_user_updated", onUserUpdate);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Why RICOZ", href: "#why-ricoz" },
    { label: "Estimator", href: "#mandate-estimator" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#FBF6F0]/95 backdrop-blur-md border-b border-[#E6D8CF] shadow-subtle py-3"
          : "bg-[#FBF6F0]/85 backdrop-blur-sm border-b border-[#E6D8CF]/60 py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* LEFT: BRAND LOGO */}
          <div className="flex items-center gap-6">
            <Wordmark markSize={26} />
          </div>

          {/* CENTER: ANCHOR NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#76665F] hover:text-[#541719] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719] rounded px-1"
              >
                {link.label}
              </a>
            ))}

            <div className="h-4 w-px bg-[#E6D8CF]" />

            <Link
              href="/talent"
              className="text-sm font-medium text-[#76665F] hover:text-[#541719] transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719] rounded px-1"
            >
              <Users className="w-3.5 h-3.5 text-[#C7A99A]" />
              <span>Explore Talent</span>
            </Link>

            <Link
              href="/ai-match"
              className="text-sm font-medium text-[#76665F] hover:text-[#541719] transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719] rounded px-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#541719]" />
              <span>AI Match</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#541719]/10 text-[#541719] uppercase tracking-wider font-sans">
                V3.1
              </span>
            </Link>
          </nav>

          {/* RIGHT: ACTIONS & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {onOpenBriefing && (
              <button
                type="button"
                onClick={onOpenBriefing}
                className="text-xs font-semibold text-[#76665F] hover:text-[#38241F] px-3.5 py-2 rounded-full hover:bg-[#FFF9F3] border border-transparent hover:border-[#E6D8CF] transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#541719]" />
                <span>Book Briefing</span>
              </button>
            )}

            {currentUser ? (
              <Link
                href={
                  currentUser.role === "designer"
                    ? "/dashboard/designer"
                    : "/dashboard/company"
                }
                className="text-xs font-semibold text-[#76665F] hover:text-[#38241F] px-3 py-2 rounded-full hover:bg-[#FFF9F3] transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#541719]" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-[#76665F] hover:text-[#38241F] px-3 py-2 rounded-full hover:bg-[#FFF9F3] transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Start a Project Primary CTA */}
            <Link
              href="/start-project"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full bg-[#541719] text-[#FFF9F3] hover:bg-[#3E1012] active:scale-95 transition-all shadow-burgundy focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
            >
              <span>Start Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex md:hidden items-center gap-2">
            {onOpenBriefing && (
              <button
                type="button"
                onClick={onOpenBriefing}
                className="p-2 text-[#76665F] hover:text-[#541719] rounded-full hover:bg-[#FFF9F3]"
                aria-label="Book Briefing"
              >
                <PhoneCall className="w-5 h-5 text-[#541719]" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#76665F] hover:text-[#38241F]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6D8CF] bg-[#FFF9F3] px-5 pt-4 pb-6 space-y-4 shadow-card animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#76665F] hover:text-[#541719] py-1.5"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-2 border-t border-[#E6D8CF] flex flex-col space-y-2">
              <Link
                href="/talent"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#38241F] flex items-center justify-between py-1.5"
              >
                <span>Browse Talent Directory</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E0CEC3] text-[#38241F]">57</span>
              </Link>
              <Link
                href="/ai-match"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#541719] flex items-center justify-between py-1.5"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#541719]" />
                  AI Matching Engine
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#541719]/10 text-[#541719] font-mono">V3.1</span>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E6D8CF] space-y-2.5">
            <Link
              href="/start-project"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold bg-[#541719] text-[#FFF9F3] rounded-full shadow-burgundy"
            >
              <span>Start a Project Mandate</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold border border-[#E6D8CF] rounded-full bg-white text-[#38241F]"
            >
              <span>Client / Designer Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};