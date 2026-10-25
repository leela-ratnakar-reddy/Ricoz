"use client";

import React, { useState } from "react";
import { Search, X, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { TalentFilterState } from "@/types/talent";
import {
  ALL_ROLES,
  ALL_INDUSTRIES,
  ALL_PROJECT_TYPES,
  ALL_LOCATIONS
} from "@/data/talentProfiles";

interface TalentFiltersProps {
  filters: TalentFilterState;
  onChange: (filters: TalentFilterState) => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export const TalentFilters: React.FC<TalentFiltersProps> = ({
  filters,
  onChange,
  totalCount,
  filteredCount,
  onReset
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const updateField = (field: keyof TalentFilterState, value: string) => {
    onChange({
      ...filters,
      [field]: value
    });
  };

  const primaryFilterKeys: (keyof TalentFilterState)[] = [
    "role",
    "industry",
    "experience",
    "availability"
  ];

  const secondaryFilterKeys: (keyof TalentFilterState)[] = [
    "location",
    "workMode",
    "projectType",
    "skill"
  ];

  const activeSecondaryCount = secondaryFilterKeys.filter((k) => Boolean(filters[k])).length;
  const totalActiveFilters = [
    filters.search,
    ...primaryFilterKeys.map((k) => filters[k]),
    ...secondaryFilterKeys.map((k) => filters[k])
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* 1. Large Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E8E87]" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateField("search", e.target.value)}
          placeholder="Search by creative name, discipline, aesthetic specialty, or industry..."
          className="w-full bg-white border border-[#E6D8CF] hover:border-[#C7A99A] rounded-full pl-11 pr-12 py-3.5 text-sm text-[#38241F] placeholder-[#9E8E87] focus:outline-none focus:border-[#541719] focus:ring-1 focus:ring-[#541719] transition-all shadow-subtle"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => updateField("search", "")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9E8E87] hover:text-[#38241F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Primary Filter Controls Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Filter 1: Role / Discipline */}
        <div>
          <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-1.5">
            Discipline / Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => updateField("role", e.target.value)}
            className="w-full bg-white border border-[#E6D8CF] rounded-2xl px-3 py-2.5 text-xs text-[#38241F] focus:outline-none focus:border-[#541719] cursor-pointer truncate shadow-subtle"
          >
            <option value="">All Disciplines</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 2: Industry */}
        <div>
          <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-1.5">
            Industry Focus
          </label>
          <select
            value={filters.industry}
            onChange={(e) => updateField("industry", e.target.value)}
            className="w-full bg-white border border-[#E6D8CF] rounded-2xl px-3 py-2.5 text-xs text-[#38241F] focus:outline-none focus:border-[#541719] cursor-pointer truncate shadow-subtle"
          >
            <option value="">All Industries</option>
            {ALL_INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 3: Experience */}
        <div>
          <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-1.5">
            Experience Level
          </label>
          <select
            value={filters.experience}
            onChange={(e) => updateField("experience", e.target.value)}
            className="w-full bg-white border border-[#E6D8CF] rounded-2xl px-3 py-2.5 text-xs text-[#38241F] focus:outline-none focus:border-[#541719] cursor-pointer truncate shadow-subtle"
          >
            <option value="">Any Experience</option>
            <option value="5-8">5–8 yrs (Senior)</option>
            <option value="9-12">9–12 yrs (Lead)</option>
            <option value="13+">13+ yrs (Director)</option>
          </select>
        </div>

        {/* Filter 4: Availability */}
        <div>
          <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-1.5">
            Availability
          </label>
          <select
            value={filters.availability}
            onChange={(e) => updateField("availability", e.target.value)}
            className="w-full bg-white border border-[#E6D8CF] rounded-2xl px-3 py-2.5 text-xs text-[#38241F] focus:outline-none focus:border-[#541719] cursor-pointer truncate shadow-subtle"
          >
            <option value="">All Statuses</option>
            <option value="Available">● Available Now</option>
            <option value="Limited Availability">● Limited (Part-Time)</option>
            <option value="Busy">● Booked Out</option>
          </select>
        </div>

        {/* More Filters Toggle */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
          <button
            type="button"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border text-xs font-sans font-medium transition-colors ${
              showMoreFilters || activeSecondaryCount > 0
                ? "bg-[#541719]/10 border-[#541719] text-[#541719] font-bold"
                : "bg-white border-[#E6D8CF] text-[#38241F] hover:border-[#C7A99A] shadow-subtle"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
            {activeSecondaryCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#541719] text-[#FFF9F3] text-[10px] font-bold flex items-center justify-center">
                {activeSecondaryCount}
              </span>
            )}
            {showMoreFilters ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Collapsible "More Filters" Drawer */}
      {showMoreFilters && (
        <div className="p-5 rounded-3xl bg-[#FFF9F3] border border-[#E6D8CF] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Location */}
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-1.5">
              Global Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="w-full bg-white border border-[#E6D8CF] rounded-2xl px-3 py-2.5 text-xs text-[#38241F] focus:outline-none focus:border-[#541719] truncate shadow-subtle"
            >
              <option value="">All Locations</option>
              {ALL_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-1.5">
              Project Type
            </label>
            <select
              value={filters.projectType}
              onChange={(e) => updateField("projectType", e.target.value)}
              className="w-full bg-white border border-[#E6D8CF] rounded-2xl px-3 py-2.5 text-xs text-[#38241F] focus:outline-none focus:border-[#541719] truncate shadow-subtle"
            >
              <option value="">All Project Types</option>
              {ALL_PROJECT_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#76665F] mb-1.5">
              Sort Results By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                updateField("sortBy", e.target.value as TalentFilterState["sortBy"])
              }
              className="w-full bg-white border border-[#E6D8CF] rounded-2xl px-3 py-2.5 text-xs text-[#38241F] focus:outline-none focus:border-[#541719] shadow-subtle"
            >
              <option value="recommended">Featured / Curated First</option>
              <option value="experience">Years Experience (High to Low)</option>
              <option value="availability">Availability (Available First)</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. Active Filters Bar & Clean Results Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-1 text-xs text-[#76665F] font-sans">
        <div>
          Showing <span className="text-[#38241F] font-bold">{filteredCount}</span> of{" "}
          <span className="text-[#38241F] font-bold">{totalCount}</span> creative specialists
          {totalActiveFilters > 0 && " (filtered)"}
        </div>

        {totalActiveFilters > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-[#541719] hover:underline font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset all filters ({totalActiveFilters})</span>
          </button>
        )}
      </div>
    </div>
  );
};