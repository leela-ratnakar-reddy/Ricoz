"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DesignerCard } from "@/components/DesignerCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { getDesigners } from "@/lib/storage";
import { ROLES, INDUSTRIES, DESIGN_STYLES } from "@/data/mockData";
import { Designer, Role, Industry, DesignStyle } from "@/types";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

function DesignersContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") as Role | null;

  const [allDesigners, setAllDesigners] = useState<Designer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>(initialRole || "all");
  const [selectedMinExp, setSelectedMinExp] = useState<number>(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recommended" | "experience" | "availability">("recommended");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    setAllDesigners(getDesigners());
    const onUpdate = () => setAllDesigners(getDesigners());
    window.addEventListener("brandroom_designers_updated", onUpdate);
    return () => window.removeEventListener("brandroom_designers_updated", onUpdate);
  }, []);

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRole("all");
    setSelectedMinExp(0);
    setSelectedIndustry("all");
    setSelectedAvailability("all");
    setSelectedStyle("all");
    setSelectedBudget("all");
    setSortBy("recommended");
    setVisibleCount(9);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedRole !== "all") count++;
    if (selectedMinExp > 0) count++;
    if (selectedIndustry !== "all") count++;
    if (selectedAvailability !== "all") count++;
    if (selectedStyle !== "all") count++;
    if (selectedBudget !== "all") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [
    selectedRole,
    selectedMinExp,
    selectedIndustry,
    selectedAvailability,
    selectedStyle,
    selectedBudget,
    searchQuery,
  ]);

  const filteredDesigners = useMemo(() => {
    return allDesigners.filter((d) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesRole = d.role.toLowerCase().includes(q);
        const matchesSkill = d.skills.some((s) => s.toLowerCase().includes(q));
        const matchesInd = d.industries.some((i) => i.toLowerCase().includes(q));
        const matchesLoc = d.location.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesSkill && !matchesInd && !matchesLoc) {
          return false;
        }
      }

      // Role
      if (selectedRole !== "all" && d.role !== selectedRole) {
        return false;
      }

      // Minimum Experience
      if (selectedMinExp > 0 && d.yearsExperience < selectedMinExp) {
        return false;
      }

      // Industry
      if (selectedIndustry !== "all" && !d.industries.includes(selectedIndustry as Industry)) {
        return false;
      }

      // Availability
      if (selectedAvailability !== "all" && d.availability !== selectedAvailability) {
        return false;
      }

      // Style
      if (selectedStyle !== "all" && !d.styles.includes(selectedStyle as DesignStyle)) {
        return false;
      }

      // Budget Tier
      if (selectedBudget !== "all" && d.budgetTier !== selectedBudget) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "experience") {
        return b.yearsExperience - a.yearsExperience;
      }
      if (sortBy === "availability") {
        const order: Record<string, number> = { "Available now": 0, "Available soon": 1, "Booked": 2 };
        return (order[a.availability] ?? 3) - (order[b.availability] ?? 3);
      }
      return (b.matchPercentage || 94) - (a.matchPercentage || 94);
    });
  }, [
    allDesigners,
    searchQuery,
    selectedRole,
    selectedMinExp,
    selectedIndustry,
    selectedAvailability,
    selectedStyle,
    selectedBudget,
    sortBy,
  ]);

  const displayedDesigners = filteredDesigners.slice(0, visibleCount);

  // Filter Sidebar Component
  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Role / Discipline */}
      <div>
        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-2">
          Discipline
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setSelectedRole("all")}
            className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors font-sans ${
              selectedRole === "all"
                ? "bg-[#541719] text-[#FFF9F3] font-bold shadow-burgundy"
                : "text-[#76665F] hover:bg-[#FFF9F3] hover:text-[#38241F]"
            }`}
          >
            All Disciplines
          </button>
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors font-sans ${
                selectedRole === role
                  ? "bg-[#541719] text-[#FFF9F3] font-bold shadow-burgundy"
                  : "text-[#76665F] hover:bg-[#FFF9F3] hover:text-[#38241F]"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-2">
          Minimum Experience
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 6, 10, 12].map((exp) => (
            <button
              key={exp}
              type="button"
              onClick={() => setSelectedMinExp(exp)}
              className={`py-1.5 px-2 text-xs rounded-xl border transition-colors font-sans font-semibold ${
                selectedMinExp === exp
                  ? "bg-[#541719] text-[#FFF9F3] border-[#541719]"
                  : "bg-white text-[#76665F] border-[#E6D8CF] hover:border-[#C7A99A]"
              }`}
            >
              {exp === 0 ? "Any" : `${exp}y+`}
            </button>
          ))}
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-2">
          Industry Sector
        </label>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="w-full bg-white border border-[#E6D8CF] rounded-2xl px-3 py-2.5 text-xs text-[#38241F] focus:outline-none focus:border-[#541719] shadow-subtle"
        >
          <option value="all">All Sectors</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-2">
          Availability Status
        </label>
        <div className="space-y-1.5 font-sans">
          {["all", "Available now", "Available soon"].map((st) => (
            <label key={st} className="flex items-center gap-2 cursor-pointer text-xs text-[#76665F] hover:text-[#38241F] transition-colors">
              <input
                type="radio"
                name="availability"
                checked={selectedAvailability === st}
                onChange={() => setSelectedAvailability(st)}
                className="accent-[#541719] focus:ring-[#541719]"
              />
              <span className="capitalize">{st === "all" ? "Any status" : st}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Design Style */}
      <div>
        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-2">
          Aesthetic Style
        </label>
        <div className="flex flex-wrap gap-1.5 font-sans">
          <button
            type="button"
            onClick={() => setSelectedStyle("all")}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              selectedStyle === "all"
                ? "bg-[#541719] text-[#FFF9F3] border-[#541719] font-bold"
                : "bg-white text-[#76665F] border-[#E6D8CF] hover:border-[#C7A99A]"
            }`}
          >
            All
          </button>
          {DESIGN_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(selectedStyle === style ? "all" : style)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedStyle === style
                  ? "bg-[#541719] text-[#FFF9F3] border-[#541719] font-bold"
                  : "bg-white text-[#76665F] border-[#E6D8CF] hover:border-[#C7A99A]"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1.5 text-xs text-[#541719] hover:underline font-sans font-semibold pt-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset all filters</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF6F0] text-[#38241F] selection:bg-[#541719] selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HEADER */}
          <div className="border-b border-[#E6D8CF] pb-8 mb-8">
            <div className="mb-3">
              <EditorialBadge variant="burgundy">
                TALENT DIRECTORY
              </EditorialBadge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
              Creative Talent<br />
              <span className="italic font-normal text-[#541719]">For Visionary Brands.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#76665F] max-w-2xl leading-relaxed font-sans font-normal">
              Discover senior creative directors, visual identity architects, and bespoke typography specialists curated for enterprise rebranding projects.
            </p>

            {/* SEARCH BAR */}
            <div className="mt-6 max-w-2xl relative">
              <Search className="w-4 h-4 text-[#9E8E87] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role (e.g. Creative Director), skill, or industry..."
                className="w-full pl-11 pr-10 py-3.5 bg-white border border-[#E6D8CF] rounded-full text-sm text-[#38241F] placeholder-[#9E8E87] focus:outline-none focus:border-[#541719] focus:ring-1 focus:ring-[#541719] transition-all shadow-subtle font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9E8E87] hover:text-[#38241F] p-1"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ACTIVE FILTER STATUS / SORT CONTROLS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-xs font-sans">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E6D8CF] rounded-full text-[#38241F] font-medium"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#541719]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#541719] text-[#FFF9F3] text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-[#76665F]">
                Showing <strong className="text-[#38241F]">{displayedDesigners.length}</strong> of{" "}
                <strong className="text-[#38241F]">{filteredDesigners.length}</strong> vetted specialists
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[#76665F]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#E6D8CF] rounded-full px-3 py-1.5 text-xs text-[#38241F] focus:outline-none focus:border-[#541719] shadow-subtle cursor-pointer font-sans"
              >
                <option value="recommended">Best Match / Curated</option>
                <option value="experience">Years Experience</option>
                <option value="availability">Available First</option>
              </select>
            </div>
          </div>

          {/* MAIN CONTENT GRID (Sidebar + Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Left Filter Sidebar (1 col) */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-white border border-[#E6D8CF] rounded-3xl p-6 shadow-subtle">
                <div className="flex items-center justify-between border-b border-[#E6D8CF] pb-3 mb-5">
                  <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-[#38241F] flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#541719]" />
                    Filter Specialists
                  </h2>
                  {activeFilterCount > 0 && (
                    <span className="text-[10px] font-sans bg-[#541719]/10 text-[#541719] px-2 py-0.5 rounded-full font-bold">
                      {activeFilterCount} Active
                    </span>
                  )}
                </div>
                <FilterPanel />
              </div>
            </aside>

            {/* Designers Cards Grid (3 cols) */}
            <div className="lg:col-span-3 space-y-8">
              {displayedDesigners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedDesigners.map((designer) => (
                    <DesignerCard key={designer.id} designer={designer} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No specialists match your criteria"
                  description="Try broadening your industry focus, experience thresholds, or search parameters."
                  actionLabel="Clear all filters"
                  onAction={resetFilters}
                />
              )}

              {/* Load More Button */}
              {displayedDesigners.length < filteredDesigners.length && (
                <div className="text-center pt-8">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 9)}
                    className="border-[#E6D8CF] hover:border-[#541719] text-[#38241F] rounded-full px-8 py-3"
                  >
                    Load More Creative Talent
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#38241F]/60 backdrop-blur-md"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white border-l border-[#E6D8CF] h-full overflow-y-auto p-6 z-10 space-y-6 shadow-card">
            <div className="flex items-center justify-between border-b border-[#E6D8CF] pb-4">
              <h3 className="font-serif font-bold text-[#38241F] text-base">Filter Specialists</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 text-[#76665F] hover:text-[#38241F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function DesignersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF6F0]" />}>
      <DesignersContent />
    </Suspense>
  );
}