"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  Briefcase,
  Building2,
  FolderKanban,
  Heart,
  Sparkles,
} from "lucide-react";
import { SearchModal } from "@/components/SearchModal";
import { Wordmark } from "@/components/brand/Wordmark";
import { getCurrentUser } from "@/lib/storage";
import { useAuth } from "@/lib/auth/AuthContext";
import { User as DemoUser } from "@/types";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user: authUser, profile, accountType, loading: authLoading, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync demo localStorage user if auth user is not logged in
  useEffect(() => {
    setDemoUser(getCurrentUser());
    const onUserUpdate = () => setDemoUser(getCurrentUser());
    window.addEventListener("brandroom_user_updated", onUserUpdate);
    return () => window.removeEventListener("brandroom_user_updated", onUserUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    setAccountDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Explore Talent", href: "/talent" },
    { label: "AI Match", href: "/ai-match" },
    { label: "For Companies", href: "/companies" },
    { label: "For Creatives", href: "/creatives" },
  ];

  // Resolve active account details: Real authenticated InsForge user only
  const activeUser = authUser
    ? {
        name: authUser.fullName || profile?.full_name || authUser.email,
        email: authUser.email,
        role: (accountType || "company") as "talent" | "company" | "admin",
        isReal: true,
      }
    : null;

  const userInitials = activeUser
    ? activeUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || (activeUser.role === "talent" ? "TL" : "CO")
    : "";

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
            <div className="hidden md:flex items-center gap-3.5">
              {/* Search trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#76665F] hover:text-[#38241F] rounded-full hover:bg-[#FFF9F3] border border-transparent hover:border-[#E6D8CF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
                aria-label="Open search dialog"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* AUTHENTICATION STATE */}
              {authLoading ? (
                <div className="w-20 h-8 rounded-full bg-[#E6D8CF]/40 animate-pulse" />
              ) : activeUser ? (
                /* LOGGED-IN ACCOUNT DROPDOWN */
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-[#E6D8CF] hover:border-[#541719]/40 transition-all text-left shadow-2xs group"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#541719] text-[#FFF9F3] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      {userInitials}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-serif font-bold text-espresso max-w-[110px] truncate group-hover:text-accent transition-colors">
                        {activeUser.name}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase ${
                          activeUser.role === "talent"
                            ? "bg-[#541719]/10 text-[#541719]"
                            : activeUser.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {activeUser.role === "talent" ? "Talent" : activeUser.role === "admin" ? "Admin" : "Company"}
                      </span>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-taupe transition-transform duration-200 ${
                        accountDropdownOpen ? "rotate-180 text-accent" : ""
                      }`}
                    />
                  </button>

                  {/* DROPDOWN MENU */}
                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E6D8CF] shadow-card py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-[#E6D8CF]">
                        <p className="text-xs font-serif font-bold text-espresso truncate">
                          {activeUser.name}
                        </p>
                        <p className="text-[11px] font-mono text-muted truncate">
                          {activeUser.email}
                        </p>
                      </div>

                      <div className="py-1">
                        {activeUser.role === "admin" ? (
                          <>
                            <Link
                              href="/admin"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-espresso hover:bg-[#FFF9F3] hover:text-accent transition-colors font-medium"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
                              <span>Operations Command Center</span>
                            </Link>
                            <Link
                              href="/admin/analytics"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-espresso hover:bg-[#FFF9F3] hover:text-accent transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-taupe" />
                              <span>Platform Analytics</span>
                            </Link>
                            <Link
                              href="/admin/users"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-espresso hover:bg-[#FFF9F3] hover:text-accent transition-colors"
                            >
                              <User className="w-3.5 h-3.5 text-taupe" />
                              <span>User Directory</span>
                            </Link>
                          </>
                        ) : activeUser.role === "company" ? (
                          <>
                            <Link
                              href="/dashboard/company"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-espresso hover:bg-[#FFF9F3] hover:text-accent transition-colors"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
                              <span>Workspace Dashboard</span>
                            </Link>
                            <Link
                              href="/dashboard/company/projects"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-espresso hover:bg-[#FFF9F3] hover:text-accent transition-colors"
                            >
                              <FolderKanban className="w-3.5 h-3.5 text-taupe" />
                              <span>Project Briefs</span>
                            </Link>
                            <Link
                              href="/dashboard/company/shortlist"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-espresso hover:bg-[#FFF9F3] hover:text-accent transition-colors"
                            >
                              <Heart className="w-3.5 h-3.5 text-taupe" />
                              <span>Candidate Shortlist</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/dashboard/designer"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-espresso hover:bg-[#FFF9F3] hover:text-accent transition-colors"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
                              <span>Workspace Dashboard</span>
                            </Link>
                            <Link
                              href="/dashboard/designer/portfolio"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-espresso hover:bg-[#FFF9F3] hover:text-accent transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-taupe" />
                              <span>Case Studies & Portfolio</span>
                            </Link>
                            <Link
                              href="/dashboard/designer/opportunities"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-sans text-espresso hover:bg-[#FFF9F3] hover:text-accent transition-colors"
                            >
                              <Briefcase className="w-3.5 h-3.5 text-taupe" />
                              <span>Mandate Opportunities</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1 border-t border-[#E6D8CF]">
                        <button
                          type="button"
                          onClick={async () => {
                            setAccountDropdownOpen(false);
                            await logout();
                          }}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-sans text-red-700 hover:bg-red-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-600" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* LOGGED-OUT BUTTONS: SIGN IN & SIGN UP */
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/login"
                    className="text-xs font-sans font-semibold text-[#76665F] hover:text-[#38241F] px-3 py-2 rounded-full hover:bg-[#FFF9F3] transition-colors"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-sans font-semibold rounded-full border border-[#541719] text-[#541719] hover:bg-[#541719] hover:text-[#FFF9F3] transition-all shadow-xs"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Start a Project CTA */}
              <Link
                href="/start-project"
                className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 text-xs font-semibold rounded-full bg-[#541719] text-[#FFF9F3] hover:bg-[#3E1012] active:scale-95 transition-all shadow-burgundy focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
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
            {/* LOGGED IN ACCOUNT BANNER ON MOBILE */}
            {activeUser && (
              <div className="p-3 rounded-2xl bg-white border border-[#E6D8CF] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#541719] text-[#FFF9F3] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-serif font-bold text-espresso truncate">
                      {activeUser.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted uppercase">
                      {activeUser.role} Account
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    if (activeUser.isReal) {
                      await logout();
                    } else {
                      localStorage.removeItem("brandroom_user");
                      window.dispatchEvent(new Event("brandroom_user_updated"));
                      window.location.href = "/";
                    }
                  }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-mono"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* LINKS */}
            <div className="flex flex-col space-y-1">
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

            {/* ACTION BUTTONS ON MOBILE */}
            <div className="pt-3 border-t border-[#E6D8CF] space-y-2.5">
              {activeUser ? (
                <Link
                  href={
                    activeUser.role === "admin"
                      ? "/admin"
                      : activeUser.role === "talent"
                      ? "/dashboard/designer"
                      : "/dashboard/company"
                  }
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-xs tracking-wider font-semibold border border-[#E6D8CF] rounded-full bg-white text-[#38241F]"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#541719]" />
                  <span>
                    {activeUser.role === "admin"
                      ? "Go to Operations Command Center"
                      : "Go to Workspace Dashboard"}
                  </span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center py-2.5 text-xs tracking-wider font-semibold border border-[#E6D8CF] rounded-full bg-white text-[#38241F]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center py-2.5 text-xs tracking-wider font-semibold border border-[#541719] rounded-full text-[#541719] bg-[#FFF9F3]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

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
