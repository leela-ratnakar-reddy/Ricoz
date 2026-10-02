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

      // Min Experience
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

      // Budget
      if (selectedBudget !== "all" && d.budgetTier !== selectedBudget) {
        return false;
      }

      return true;
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
  ]);

  const sortedDesigners = useMemo(() => {
    const list = [...filteredDesigners];
    if (sortBy === "recommended") {
      list.sort((a, b) => (b.matchPercentage || 90) - (a.matchPercentage || 90));
    } else if (sortBy === "experience") {
      list.sort((a, b) => b.yearsExperience - a.yearsExperience);
    } else if (sortBy === "availability") {
      const order = { "Available now": 1, "Available soon": 2, Booked: 3 };
      list.sort((a, b) => order[a.availability] - order[b.availability]);
    }
    return list;
  }, [filteredDesigners, sortBy]);

  const displayedList = sortedDesigners.slice(0, visibleCount);

  const filterFormContent = (
    <div className="space-y-6 text-sm">
      {/* Role */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-2">
          Specialization Discipline
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-xs text-brand focus:outline-none focus:border-accent/40"
        >
          <option value="all">All Disciplines ({allDesigners.length})</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-2">
          Experience Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "All", val: 0 },
            { label: "5+ yrs", val: 5 },
            { label: "8+ yrs", val: 8 },
            { label: "10+ yrs", val: 10 },
            { label: "12+ yrs", val: 12 },
          ].map((lvl) => (
            <button
              key={lvl.val}
              type="button"
              onClick={() => setSelectedMinExp(lvl.val)}
              className={`py-1.5 px-2 text-xs rounded border transition-colors font-mono ${
                selectedMinExp === lvl.val
                  ? "bg-accent text-background border-accent font-semibold"
                  : "bg-surface-elevated text-brand-secondary border-surface-border hover:border-surface-borderLight hover:text-brand"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-2">
          Industry Sector
        </label>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-xs text-brand focus:outline-none focus:border-accent/40"
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
        <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-2">
          Availability Status
        </label>
        <div className="space-y-1.5">
          {["all", "Available now", "Available soon"].map((st) => (
            <label key={st} className="flex items-center gap-2 cursor-pointer text-xs text-brand-secondary hover:text-brand transition-colors">
              <input
                type="radio"
                name="availability"
                checked={selectedAvailability === st}
                onChange={() => setSelectedAvailability(st)}
                className="accent-[#C8FF3D] focus:ring-accent"
              />
              <span className="capitalize">{st === "all" ? "Any status" : st}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Design Style */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-2">
          Aesthetic Style
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedStyle("all")}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              selectedStyle === "all"
                ? "bg-accent text-background border-accent font-semibold"
                : "bg-surface-elevated text-brand-secondary border-surface-border hover:border-surface-borderLight hover:text-brand"
            }`}
          >
            All
          </button>
          {DESIGN_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(selectedStyle === style ? "all" : style)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                selectedStyle === style
                  ? "bg-accent text-background border-accent font-semibold"
                  : "bg-surface-elevated text-brand-secondary border-surface-border hover:border-surface-borderLight hover:text-brand"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Tier */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-2">
          Budget Tier
        </label>
        <div className="grid grid-cols-4 gap-2">
          {["all", "$$$", "$$$$", "$$$$$"].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBudget(b)}
              className={`py-1.5 px-2 text-xs rounded border transition-colors font-mono ${
                selectedBudget === b
                  ? "bg-accent text-background border-accent font-bold"
                  : "bg-surface-elevated text-brand-secondary border-surface-border hover:border-surface-borderLight hover:text-brand"
              }`}
            >
              {b === "all" ? "Any" : b}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-mono tracking-wider pt-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset all filters</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HEADER */}
          <div className="border-b border-surface-border pb-8 mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent block mb-2 font-medium">
              TALENT DIRECTORY
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase font-sans">
              Creative Talent<br />
              <span className="text-accent">For Serious Brands.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-brand-secondary max-w-2xl leading-relaxed">
              Discover senior creative directors, visual identity architects, and bespoke typography specialists curated for enterprise rebranding projects.
            </p>

            {/* SEARCH BAR */}
            <div className="mt-6 max-w-2xl relative">
              <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role (e.g. Creative Director), skill, or industry..."
                className="w-full pl-10 pr-10 py-3 bg-surface border border-surface-border rounded-lg text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all shadow-subtle"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand p-1"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* MAIN CONTENT WITH SIDEBAR & RESULTS */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* DESKTOP FILTER SIDEBAR */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 bg-surface/70 backdrop-blur-md border border-surface-border rounded-xl p-5 shadow-subtle">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-border">
                  <div className="flex items-center gap-2 font-medium text-brand text-sm">
                    <SlidersHorizontal className="w-4 h-4 text-accent" />
                    <span>Filter Talent</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-accent text-background font-semibold">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
                {filterFormContent}
              </div>
            </div>

            {/* RESULTS COLUMN */}
            <div className="lg:col-span-3">
              {/* RESULTS TOP BAR */}
              <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-surface-border">
                <div className="flex items-center gap-3">
                  {/* MOBILE FILTER TRIGGER */}
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-surface-border rounded bg-surface text-brand"
                  >
                    <Filter className="w-3.5 h-3.5 text-accent" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-accent text-background font-mono text-[9px] flex items-center justify-center font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <span className="text-xs font-mono text-brand-muted">
                    Showing <strong className="text-brand font-semibold">{filteredDesigners.length}</strong> creative {filteredDesigners.length === 1 ? "specialist" : "specialists"}
                  </span>
                </div>

                {/* SORT DROPDOWN */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-muted font-mono hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-surface border border-surface-border rounded px-2.5 py-1.5 text-xs text-brand focus:outline-none focus:border-accent/40 font-mono"
                  >
                    <option value="recommended">Recommended Match</option>
                    <option value="experience">Years of Experience</option>
                    <option value="availability">Availability First</option>
                  </select>
                </div>
              </div>

              {/* CARDS GRID OR EMPTY STATE */}
              {displayedList.length === 0 ? (
                <EmptyState
                  icon={<Search className="w-6 h-6 text-accent" />}
                  title="No creative talent match these filters."
                  description="Try broadening your criteria, removing specialized keywords, or clearing your active filters."
                  actionLabel="Clear all filters"
                  onAction={resetFilters}
                />
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedList.map((designer) => (
                      <DesignerCard key={designer.id} designer={designer} />
                    ))}
                  </div>

                  {/* LOAD MORE UI */}
                  {visibleCount < sortedDesigners.length && (
                    <div className="pt-6 text-center border-t border-surface-border">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                      >
                        Load More Talent ({sortedDesigners.length - visibleCount} remaining)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE FILTER DRAWER */}
      {mobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-title"
          className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-sm"
        >
          <div className="relative ml-auto w-full max-w-xs h-full bg-surface border-l border-surface-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-surface-border">
                <h3 id="mobile-filter-title" className="font-semibold text-base text-white font-sans">
                  Filters
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-brand-muted hover:text-brand"
                  aria-label="Close filters drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterFormContent}
            </div>

            <div className="pt-6 mt-6 border-t border-surface-border">
              <Button
                fullWidth
                size="md"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters ({filteredDesigners.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ExploreDesignersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-12 text-center text-xs text-brand-muted font-mono">Loading talent repository...</div>}>
      <DesignersContent />
    </Suspense>
  );
}
