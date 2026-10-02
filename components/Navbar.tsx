"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { SearchModal } from "@/components/SearchModal";
import { Wordmark } from "@/components/brand/Wordmark";
import { BrandMark } from "@/components/brand/BrandMark";
import { getCurrentUser } from "@/lib/storage";
import { User } from "@/types";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentUser, setUserState] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setUserState(getCurrentUser());
    const onUserUpdate = () => setUserState(getCurrentUser());
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Find Talent", href: "/talent" },
    { label: "AI Match", href: "/ai-match" },
    { label: "Designers", href: "/designers" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "For Companies", href: "/companies" },
    { label: "For Creatives", href: "/creatives" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/90 backdrop-blur-md border-b border-surface-border shadow-surface py-3"
            : "bg-background/60 backdrop-blur-sm border-b border-surface-border/50 py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* BRAND LOGO WITH 3D LETTER R MARK */}
            <div className="flex items-center gap-6">
              <Wordmark markSize={26} />
            </div>

            {/* DESKTOP CENTER NAVIGATION */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[13px] transition-colors font-medium ${
                      isActive
                        ? "text-accent font-semibold"
                        : "text-brand-secondary hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* DESKTOP RIGHT ACTIONS */}
            <div className="hidden md:flex items-center gap-4">
              {/* Search trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-brand-secondary hover:text-white rounded-md hover:bg-surface transition-colors"
                aria-label="Open search dialog"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Dashboard / Sign In */}
              {currentUser ? (
                <Link
                  href={
                    currentUser.role === "designer"
                      ? "/dashboard/designer"
                      : "/dashboard/company"
                  }
                  className="flex items-center gap-1.5 text-sm font-medium text-brand-secondary hover:text-white px-3 py-2 rounded-md hover:bg-surface transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-brand-secondary hover:text-white px-3 py-2 rounded-md hover:bg-surface transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Start a Project CTA */}
              <Link
                href="/dashboard/company/projects/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded bg-accent text-background hover:bg-accent-hover active:bg-[#A3DC1E] transition-all shadow-glow"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* MOBILE MENU TOGGLE */}
            <div className="flex md:hidden items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-brand-secondary hover:text-white"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-brand-secondary hover:text-white"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-border bg-background-secondary/95 backdrop-blur-xl px-5 pt-4 pb-6 space-y-4 shadow-surface animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm uppercase tracking-wider font-medium text-brand-secondary hover:text-accent py-1.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-surface-border space-y-3">
              <Link
                href={
                  currentUser?.role === "designer"
                    ? "/dashboard/designer"
                    : "/dashboard/company"
                }
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs uppercase tracking-wider font-semibold border border-surface-border rounded bg-surface text-brand"
              >
                <LayoutDashboard className="w-4 h-4 text-accent" />
                <span>Go to Dashboard</span>
              </Link>
              <Link
                href="/dashboard/company/projects/new"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs uppercase tracking-wider font-bold bg-accent text-background rounded shadow-glow"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex justify-center pt-2">
                <Link href="/login" className="text-xs text-brand-muted hover:text-brand-secondary">
                  Sign in or switch account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* FAST SEARCH MODAL */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
