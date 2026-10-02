"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, FilterX } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TALENT_PROFILES } from "@/data/talentProfiles";
import { TalentFilterState } from "@/types/talent";
import { TalentCard } from "@/components/talent/TalentCard";
import { TalentFilters } from "@/components/talent/TalentFilters";
import { ShortlistDrawer } from "@/components/talent/ShortlistDrawer";

const INITIAL_FILTERS: TalentFilterState = {
  search: "",
  role: "",
  industry: "",
  experience: "",
  availability: "",
  location: "",
  workMode: "",
  projectType: "",
  skill: "",
  sortBy: "recommended"
};

export default function TalentDiscoveryPage() {
  const [filters, setFilters] = useState<TalentFilterState>(INITIAL_FILTERS);

  // Filter and sort talent profiles deterministically
  const filteredTalent = useMemo(() => {
    let result = [...TALENT_PROFILES];

    // 1. Text Search (name, role, bio, skills, tools, industries)
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.role.toLowerCase().includes(q) ||
          t.bio.toLowerCase().includes(q) ||
          t.skills.some((s) => s.toLowerCase().includes(q)) ||
          t.tools.some((tl) => tl.toLowerCase().includes(q)) ||
          t.industries.some((ind) => ind.toLowerCase().includes(q)) ||
          t.location.toLowerCase().includes(q)
      );
    }

    // 2. Role filter
    if (filters.role) {
      result = result.filter(
        (t) => t.role.toLowerCase() === filters.role.toLowerCase()
      );
    }

    // 3. Industry filter
    if (filters.industry) {
      result = result.filter((t) =>
        t.industries.some(
          (ind) => ind.toLowerCase() === filters.industry.toLowerCase()
        )
      );
    }

    // 4. Availability filter
    if (filters.availability) {
      result = result.filter((t) => t.availability === filters.availability);
    }

    // 5. Experience filter
    if (filters.experience) {
      if (filters.experience === "5-8") {
        result = result.filter((t) => t.experience >= 5 && t.experience <= 8);
      } else if (filters.experience === "9-12") {
        result = result.filter((t) => t.experience >= 9 && t.experience <= 12);
      } else if (filters.experience === "13+") {
        result = result.filter((t) => t.experience >= 13);
      }
    }

    // 6. Location filter
    if (filters.location) {
      result = result.filter((t) => t.location === filters.location);
    }

    // 7. Project Type filter
    if (filters.projectType) {
      result = result.filter((t) =>
        t.projectTypes.some(
          (pt) => pt.toLowerCase() === filters.projectType.toLowerCase()
        )
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case "experience":
        result.sort((a, b) => b.experience - a.experience);
        break;
      case "availability":
        const rank = { Available: 1, "Limited Availability": 2, Busy: 3 };
        result.sort((a, b) => rank[a.availability] - rank[b.availability]);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recommended":
      default:
        // Featured profiles first, then highest experience
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.experience - a.experience;
        });
        break;
    }

    return result;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand selection:bg-accent selection:text-background">
      {/* Top Header Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Editorial Hero Header Section */}
        <section className="relative pt-12 pb-10 border-b border-white/5 overflow-hidden bg-background">
          {/* Subtle background ambient lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[340px] bg-gradient-to-b from-accent/5 via-transparent to-transparent blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-accent/10 text-accent border border-accent/20 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span>CURATED CREATIVE ROSTER • 57 SPECIALISTS</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12] mb-4">
                  Find the right creative talent <br className="hidden sm:inline" />
                  for your next <span className="text-accent">big idea.</span>
                </h1>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-normal">
                  Explore 57 creative specialists across brand, digital, motion, strategy, packaging and other creative disciplines.
                </p>
              </div>

              {/* Minimalist AI Matcher Shortcut Banner */}
              <div className="lg:w-80 p-4 rounded-2xl bg-[#111114] border border-accent/30 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono text-accent font-semibold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI MATCHING ENGINE</span>
                </div>
                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                  Have a specific client brief? Let RICOZ AI analyze your scope and match a balanced 5-role squad.
                </p>
                <Link
                  href="/ai-match"
                  className="inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent-hover active:bg-[#B5F228] transition-all shadow-glow"
                >
                  <span>Launch AI Matcher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Clean, Streamlined Search & Filters */}
            <TalentFilters
              filters={filters}
              onChange={setFilters}
              totalCount={TALENT_PROFILES.length}
              filteredCount={filteredTalent.length}
              onReset={handleResetFilters}
            />
          </div>
        </section>

        {/* Editorial Talent Discovery Grid */}
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredTalent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTalent.map((talent) => (
                  <TalentCard key={talent.id} talent={talent} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center rounded-2xl bg-[#111114] border border-white/10 p-8 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#18181C] border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <FilterX className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No creative talent found
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  No profiles matched your active criteria. Try broadening your keywords or resetting filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Shortlist Drawer */}
      <ShortlistDrawer />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
