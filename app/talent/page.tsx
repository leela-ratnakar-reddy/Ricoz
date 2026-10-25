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
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

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
    <div className="min-h-screen flex flex-col bg-[#FBF6F0] text-[#38241F] selection:bg-[#541719] selection:text-[#FFF9F3]">
      {/* Top Header Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Editorial Hero Header Section */}
        <section className="relative pt-12 pb-10 border-b border-[#E6D8CF] overflow-hidden bg-[#FBF6F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
              <div className="max-w-3xl">
                <div className="mb-4">
                  <EditorialBadge variant="burgundy">
                    CURATED CREATIVE ROSTER • 57 SPECIALISTS
                  </EditorialBadge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-[1.12] mb-4">
                  Find the right creative talent <br className="hidden sm:inline" />
                  for your next <span className="italic font-normal text-[#541719]">defining mandate.</span>
                </h1>

                <p className="text-sm sm:text-base text-[#76665F] leading-relaxed max-w-2xl font-sans font-normal">
                  Explore 57 vetted creative specialists across brand identity, digital architecture, motion, category strategy, and packaging design.
                </p>
              </div>

              {/* Minimalist AI Matcher Shortcut Banner */}
              <div className="lg:w-80 p-5 rounded-3xl bg-white border border-[#E6D8CF] shadow-card flex flex-col justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-sans text-[#541719] font-bold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI MATCHING ENGINE V3.1</span>
                </div>
                <p className="text-xs text-[#76665F] mb-3 leading-relaxed font-sans">
                  Have a specific client brief? Let RICOZ AI analyze your scope and match a balanced 5-role squad.
                </p>
                <Link
                  href="/ai-match"
                  className="inline-flex items-center justify-between px-4 py-2.5 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-xs hover:bg-[#3E1012] transition-all shadow-burgundy"
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
        <section className="py-12 bg-[#FBF6F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredTalent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTalent.map((talent) => (
                  <TalentCard key={talent.id} talent={talent} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center rounded-3xl bg-white border border-[#E6D8CF] p-8 max-w-lg mx-auto shadow-subtle">
                <div className="w-14 h-14 rounded-full bg-[#FFF9F3] border border-[#E6D8CF] flex items-center justify-center mx-auto mb-4 text-[#76665F]">
                  <FilterX className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#38241F] mb-2">
                  No creative talent found
                </h3>
                <p className="text-xs text-[#76665F] leading-relaxed mb-6 font-sans">
                  No profiles matched your active criteria. Try broadening your keywords or resetting filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#541719] text-[#FFF9F3] text-xs font-semibold hover:bg-[#3E1012] transition-colors shadow-burgundy font-sans"
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