"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { SearchModal } from "@/components/SearchModal";
import { Wordmark } from "@/components/brand/Wordmark";
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
    { label: "Home", href: "/" },
    { label: "Explore Talent", href: "/talent" },
    { label: "AI Match", href: "/ai-match" },
    { label: "For Companies", href: "/companies" },
    { label: "For Creatives", href: "/creatives" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#FBF6F0]/95 backdrop-blur-md border-b border-[#E6D8CF] shadow-subtle py-3"
            : "bg-[#FBF6F0]/85 backdrop-blur-sm border-b border-[#E6D8CF]/60 py-4 sm:py-5"
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
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[13px] tracking-wide transition-colors font-medium ${
                      isActive
                        ? "text-[#541719] font-bold"
                        : "text-[#76665F] hover:text-[#541719]"
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
                className="p-2 text-[#76665F] hover:text-[#38241F] rounded-full hover:bg-[#FFF9F3] border border-transparent hover:border-[#E6D8CF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
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
                  className="flex items-center gap-1.5 text-sm font-medium text-[#76665F] hover:text-[#38241F] px-3 py-2 rounded-md hover:bg-[#FFF9F3] transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#541719]" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#76665F] hover:text-[#38241F] px-3 py-2 rounded-md hover:bg-[#FFF9F3] transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Start a Project CTA */}
              <Link
                href="/start-project"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-[#541719] text-[#FFF9F3] hover:bg-[#3E1012] active:scale-95 transition-all shadow-burgundy focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* MOBILE MENU TOGGLE */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#76665F] hover:text-[#38241F] focus:outline-none"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#76665F] hover:text-[#38241F] focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E6D8CF] bg-[#FFF9F3] px-5 pt-4 pb-6 space-y-4 shadow-card animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm tracking-wider py-2 font-medium transition-colors ${
                      isActive ? "text-[#541719] font-bold" : "text-[#76665F] hover:text-[#541719]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#E6D8CF] space-y-3">
              <Link
                href={
                  currentUser?.role === "designer"
                    ? "/dashboard/designer"
                    : currentUser
                    ? "/dashboard/company"
                    : "/login"
                }
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs tracking-wider font-semibold border border-[#E6D8CF] rounded-full bg-white text-[#38241F]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#541719]" />
                <span>{currentUser ? "Go to Dashboard" : "Sign In"}</span>
              </Link>
              <Link
                href="/start-project"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs tracking-wider font-bold bg-[#541719] text-[#FFF9F3] rounded-full shadow-burgundy"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* FAST SEARCH MODAL */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
