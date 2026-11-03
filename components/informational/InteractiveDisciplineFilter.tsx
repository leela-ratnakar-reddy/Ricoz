"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight, Sparkles, X } from "lucide-react";
import { getCanonicalTalentProfiles } from "@/lib/talentData";
import { TalentProfile } from "@/types/talent";
import { TalentAvatar } from "@/components/ui/TalentAvatar";
import { CaseStudyModal, CaseStudyItem } from "@/components/informational/CaseStudyModal";
import { EditorialBadge } from "@/components/ui/EditorialDecorations";

export const InteractiveDisciplineFilter: React.FC = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalCase, setActiveModalCase] = useState<CaseStudyItem | null>(null);

  const disciplines = [
    "All",
    "Creative Director",
    "Brand Strategist",
    "Brand Identity Designer",
    "UI/UX Designer",
    "Packaging Designer",
    "Motion Designer",
    "Typography Specialist",
  ];

  // Filter profiles based on selected discipline & search query
  const filteredTalent = useMemo(() => {
    return getCanonicalTalentProfiles().filter((t) => {
      const matchesDiscipline =
        selectedDiscipline === "All" ||
        t.specializations?.some((s) => s.toLowerCase().includes(selectedDiscipline.toLowerCase())) ||
        t.skills?.some((sk) => sk.toLowerCase().includes(selectedDiscipline.toLowerCase())) ||
        t.bio?.toLowerCase().includes(selectedDiscipline.toLowerCase());

      const matchesSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDiscipline && matchesSearch;
    }).slice(0, 6); // Display top 6 matching candidates
  }, [selectedDiscipline, searchQuery]);

  const handleOpenCaseStudy = (talent: TalentProfile) => {
    const portfolioItem = talent.portfolio?.[0];
    const caseItem: CaseStudyItem = {
      id: portfolioItem?.id || `cs-${talent.id}`,
      title: portfolioItem?.title || `${talent.name} // Featured Project Work`,
      client: portfolioItem?.client || `${talent.name} Studio Mandate`,
      specialistName: talent.name,
      specialistRole: talent.specializations?.[0] || talent.role,
      specialistAvatar: talent.profileImage || `/images/talent/${talent.name.toLowerCase().replace(/[\s\.]+/g, "-")}.jpg`,
      discipline: selectedDiscipline === "All" ? talent.specializations?.[0] || "Creative Direction" : selectedDiscipline,
      deliverables: portfolioItem?.deliverables || talent.skills.slice(0, 4),
      challenge:
        portfolioItem?.description ||
        `Crafting a high-impact, cohesive creative execution requiring specialized ${talent.specializations?.[0] || "craft"} capabilities for global expansion.`,
      solution:
        portfolioItem?.impact ||
        `Developed structured creative deliverables, tokenized design systems, and strategic narrative framework overseen by ${talent.name}.`,
      image: portfolioItem?.image,
      timeline: portfolioItem?.year ? `${portfolioItem.year}` : "4-6 weeks",
      palette: ["#38241F", "#541719", "#C7A99A", "#FBF6F0"],
      talentId: talent.id,
    };
    setActiveModalCase(caseItem);
  };

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-[#E6D8CF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="mb-3">
              <EditorialBadge variant="burgundy">
                INTERACTIVE TALENT DIRECTORY
              </EditorialBadge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#38241F] tracking-tight leading-tight">
              Filter by Creative Discipline
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#76665F] max-w-xl font-sans font-normal">
              Explore available creative directors, brand architects, and design leaders. Click any specialist to inspect documented case studies.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#9E8E87] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, name, discipline..."
              className="w-full pl-10 pr-8 py-2.5 rounded-full border border-[#E6D8CF] text-xs text-[#38241F] placeholder:text-[#9E8E87] focus:outline-none focus:ring-2 focus:ring-[#541719] bg-[#FFF9F3] focus:bg-white transition-all shadow-subtle"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9E8E87] hover:text-[#38241F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* INTERACTIVE DISCIPLINE PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {disciplines.map((d) => {
            const isSelected = selectedDiscipline === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDiscipline(d)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719] ${
                  isSelected
                    ? "bg-[#541719] text-[#FFF9F3] shadow-burgundy font-bold"
                    : "bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF] hover:border-[#C7A99A] hover:text-[#38241F]"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* RESULTS GRID */}
        {filteredTalent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalent.map((talent) => {
              const portraitPath =
                talent.profileImage ||
                `/images/talent/${talent.name.toLowerCase().replace(/[\s\.]+/g, "-")}.jpg`;

              return (
                <div
                  key={talent.id}
                  className="bg-white rounded-2xl border border-[#E6D8CF] p-6 shadow-subtle hover:shadow-card hover:border-[#C7A99A] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Avatar + Name + Rates */}
                    <div className="flex items-start gap-4 mb-4">
                      <TalentAvatar
                        src={portraitPath}
                        alt={talent.name}
                        initials={talent.initials || talent.name.slice(0, 2).toUpperCase()}
                        size={52}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-bold text-[#38241F] text-base truncate">
                            {talent.name}
                          </h3>
                          <span className="text-xs font-mono font-bold text-[#38241F] bg-[#FFF9F3] px-2.5 py-0.5 rounded-full border border-[#E6D8CF]">
                            {talent.hourlyRate}
                          </span>
                        </div>
                        <div className="text-xs text-[#541719] font-medium truncate font-sans">
                          {talent.specializations?.[0] || "Creative Specialist"}
                        </div>
                        <div className="text-[11px] text-[#76665F] font-sans">
                          {talent.experience} yrs exp • {talent.location}
                        </div>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-[#76665F] leading-relaxed line-clamp-3 mb-4 font-normal font-sans">
                      {talent.bio}
                    </p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {talent.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-[#FFF9F3] text-[#76665F] text-[11px] border border-[#E6D8CF] font-sans font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-4 border-t border-[#E6D8CF] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenCaseStudy(talent)}
                      className="text-xs font-semibold text-[#76665F] hover:text-[#541719] flex items-center gap-1.5 transition-colors font-sans"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#541719]" />
                      <span>View Case Study</span>
                    </button>

                    <Link
                      href={`/talent/${talent.id}`}
                      className="text-xs font-bold text-[#541719] hover:underline flex items-center gap-1 font-sans"
                    >
                      <span>Full Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="text-center py-16 bg-[#FFF9F3] rounded-2xl border border-[#E6D8CF]">
            <p className="text-sm font-serif font-bold text-[#38241F]">No creative specialists match this query.</p>
            <p className="text-xs text-[#76665F] mt-1 mb-4 font-sans">Try clearing your search query or selecting "All" disciplines.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedDiscipline("All");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-full bg-[#541719] text-[#FFF9F3] text-xs font-bold hover:bg-[#3E1012] transition-colors shadow-burgundy"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* BOTTOM DIRECTORY LINK */}
        <div className="mt-12 text-center">
          <Link
            href="/talent"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E6D8CF] bg-[#FFF9F3] text-[#38241F] font-semibold text-sm hover:border-[#C7A99A] hover:bg-white transition-all shadow-subtle"
          >
            <span>Explore All 57 Curated Talent Profiles</span>
            <ArrowRight className="w-4 h-4 text-[#541719]" />
          </Link>
        </div>
      </div>

      {/* CASE STUDY MODAL */}
      <CaseStudyModal
        isOpen={!!activeModalCase}
        onClose={() => setActiveModalCase(null)}
        caseStudy={activeModalCase}
      />
    </section>
  );
};