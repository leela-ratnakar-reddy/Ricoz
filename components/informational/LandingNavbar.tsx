"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { getCurrentUser } from "@/lib/storage";
import { User } from "@/types";
import { Menu, X, ArrowRight, LayoutDashboard, Sparkles, Users } from "lucide-react";

export const LandingNavbar: React.FC = () => {
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
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3"
          : "bg-white/80 backdrop-blur-sm border-b border-slate-100 py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* LEFT: BRAND LOGO */}
          <div className="flex items-center gap-6">
            <Wordmark markSize={26} variant="light" />
          </div>

          {/* CENTER: ANCHOR NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="h-4 w-px bg-slate-200" />

            <Link
              href="/talent"
              className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
              <span>Explore Talent</span>
            </Link>

            <Link
              href="/ai-match"
              className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>AI Match</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700 uppercase tracking-wider">
                V3.1
              </span>
            </Link>
          </nav>

          {/* RIGHT: ACTIONS & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <Link
                href={
                  currentUser.role === "designer"
                    ? "/dashboard/designer"
                    : "/dashboard/company"
                }
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-red-600" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/start-project"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-all shadow-md shadow-red-600/20 group"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/start-project"
              className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white shadow-sm"
            >
              Start Project
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-5 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-red-600 py-1.5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-slate-100 pt-2 space-y-2">
              <Link
                href="/talent"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-red-600 py-1.5"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Explore Talent</span>
              </Link>
              <Link
                href="/ai-match"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-red-600 py-1.5"
              >
                <Sparkles className="w-4 h-4 text-red-500" />
                <span>AI Matching Engine</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700 uppercase">
                  V3.1
                </span>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <Link
              href="/start-project"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold bg-red-600 text-white rounded-xl shadow-md shadow-red-600/20"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {currentUser ? (
              <Link
                href={
                  currentUser.role === "designer"
                    ? "/dashboard/designer"
                    : "/dashboard/company"
                }
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
              >
                <LayoutDashboard className="w-4 h-4 text-red-600" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
