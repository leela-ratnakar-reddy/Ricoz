"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { saveProject, getCurrentUser } from "@/lib/storage";
import { TALENT_PROFILES } from "@/data/talentProfiles";
import { TalentProfile } from "@/types/talent";
import { Industry, Role, BudgetTier, Project } from "@/types";
import { EditorialStar, ContourFlourish } from "@/components/ui/EditorialDecorations";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Users,
  Building,
  Target,
  DollarSign
} from "lucide-react";

export default function StartProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState("Enterprise Brand Architecture & Identity");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState<Industry>("Technology");

  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Brand Identity & Logomark",
    "Category Positioning",
    "Design Token System",
  ]);

  const [selectedRoles, setSelectedRoles] = useState<Role[]>([
    "Brand Strategist",
    "Creative Director",
    "Brand Identity Designer",
  ]);

  const [budgetTier, setBudgetTier] = useState<BudgetTier>("$$$$");
  const [budgetRange, setBudgetRange] = useState("$60,000 - $90,000");
  const [timeline, setTimeline] = useState("8-10 weeks");
  const [targetAudience, setTargetAudience] = useState("Enterprise decision makers & procurement teams");

  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [matchedTalents, setMatchedTalents] = useState<TalentProfile[]>([]);

  React.useEffect(() => {
    const user = getCurrentUser();
    if (user && user.companyName) {
      setCompanyName(user.companyName);
    }
  }, []);

  const industries: Industry[] = [
    "Technology",
    "Finance",
    "Healthcare",
    "Consumer",
    "Retail",
    "Hospitality",
    "Media & Entertainment",
    "Energy & Industrial",
  ];

  const goalOptions = [
    "Brand Identity & Logomark",
    "Category Positioning",
    "Design Token System",
    "UI/UX Product Architecture",
    "Motion & Launch Campaign",
    "Packaging & Print Monograph",
    "Typography & Editorial",
    "Investor Deck & Narrative",
  ];

  const roleOptions: Role[] = [
    "Creative Director",
    "Brand Strategist",
    "Brand Identity Designer",
    "Typography Specialist",
    "Art Director",
    "Visual Identity Designer",
    "Packaging Designer",
    "Logo Designer",
  ];

  const budgetOptions: { tier: BudgetTier; range: string; label: string }[] = [
    { tier: "$$$", range: "$30,000 - $60,000", label: "Focused Sprint (1-2 specialists)" },
    { tier: "$$$$", range: "$60,000 - $100,000", label: "Comprehensive Mandate (2-3 specialists)" },
    { tier: "$$$$$", range: "$100,000+", label: "Enterprise Transformation (Full Squad)" },
  ];

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const toggleRole = (role: Role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleCompleteAndMatch = () => {
    // Save project
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title,
      companyId: getCurrentUser()?.id || "client-guest",
      companyName: companyName.trim() || "Apex Ventures",
      industry,
      status: "Matching",
      timeline,
      startDate: "Within 2 weeks",
      budgetRange,
      budgetTier,
      rebrandingGoals: selectedGoals,
      targetAudience,
      brandPersonality: ["Modern", "Authoritative", "Crafted"],
      requiredServices: selectedRoles,
      preferredStyles: ["Minimal", "Bold"],
      availabilityRequirement: "Immediate",
      createdAt: new Date().toISOString(),
      recommendedCount: 4,
    };

    saveProject(newProj);
    setSavedProjectId(newProj.id);

    // Compute top matching talent from TALENT_PROFILES based on selected roles
    const matches = TALENT_PROFILES.filter((t) =>
      selectedRoles.some(
        (r) =>
          t.specializations?.some((s) => s.toLowerCase().includes(r.toLowerCase())) ||
          t.bio?.toLowerCase().includes(r.toLowerCase()) ||
          t.skills?.some((sk) => sk.toLowerCase().includes(r.toLowerCase()))
      )
    ).slice(0, 4);

    setMatchedTalents(matches.length > 0 ? matches : TALENT_PROFILES.slice(0, 4));
    setStep(5);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 relative overflow-hidden">
        <ContourFlourish className="absolute -top-16 -right-16 w-80 h-80 text-taupe/15 pointer-events-none" />
        <ContourFlourish className="absolute -bottom-16 -left-16 w-72 h-72 text-taupe/15 pointer-events-none rotate-180" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* STEPPER PROGRESS BAR */}
          <div className="mb-10 sm:mb-12">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-muted uppercase tracking-wider mb-3">
              <span>Step {step} of 5</span>
              <span className="text-espresso font-semibold">
                {step === 1 && "Project Details"}
                {step === 2 && "Creative Goals"}
                {step === 3 && "Required Disciplines"}
                {step === 4 && "Budget & Timeline"}
                {step === 5 && "Squad Match Complete"}
              </span>
            </div>
            <div className="w-full bg-[#E0CEC3]/40 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* CARD CONTAINER */}
          <div className="bg-[#FFF9F3] rounded-3xl border border-[#E6D8CF] p-6 sm:p-10 shadow-xs">
            {/* ================= STEP 1: PROJECT ESSENTIALS ================= */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-accent text-xs font-mono font-semibold tracking-wider uppercase mb-3 border border-[#E6D8CF]">
                    <Building className="w-3.5 h-3.5" />
                    <span>01 // PROJECT ESSENTIALS</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-espresso tracking-tight">
                    Tell us what you&apos;re <span className="italic text-accent">building.</span>
                  </h2>
                  <p className="text-sm text-muted mt-1 font-sans">
                    Share essential context about your organization and the core creative mandate.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-espresso uppercase tracking-wider mb-2">
                      Project Mandate Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Enterprise Cloud Rebrand & Design System"
                      className="w-full px-4 py-3 rounded-xl border border-[#E6D8CF] bg-white text-espresso placeholder-[#76665F]/60 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-espresso uppercase tracking-wider mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Technologies"
                      className="w-full px-4 py-3 rounded-xl border border-[#E6D8CF] bg-white text-espresso placeholder-[#76665F]/60 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-espresso uppercase tracking-wider mb-2">
                      Primary Industry
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {industries.map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => setIndustry(ind)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all text-center ${
                            industry === ind
                              ? "bg-accent text-[#FFF9F3] border-accent shadow-xs"
                              : "bg-white border-[#E6D8CF] text-espresso hover:border-accent/40"
                          }`}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E6D8CF] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-[#FFF9F3] font-semibold text-sm hover:bg-[#3E1012] transition-all shadow-xs active:translate-y-0.5"
                  >
                    <span>Next: Creative Goals</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: CREATIVE GOALS ================= */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-accent text-xs font-mono font-semibold tracking-wider uppercase mb-3 border border-[#E6D8CF]">
                    <Target className="w-3.5 h-3.5" />
                    <span>02 // CREATIVE GOALS & DELIVERABLES</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-espresso tracking-tight">
                    What concrete deliverables do you require?
                  </h2>
                  <p className="text-sm text-muted mt-1 font-sans">
                    Select all creative outputs required for this mandate.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {goalOptions.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-white border-2 border-accent text-espresso shadow-xs"
                            : "bg-white border border-[#E6D8CF] text-muted hover:border-accent/40 hover:text-espresso"
                        }`}
                      >
                        <span className="text-sm font-semibold">{goal}</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            isSelected ? "bg-accent text-[#FFF9F3]" : "border border-[#E6D8CF]"
                          }`}
                        >
                          {isSelected && "✓"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-[#E6D8CF] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-espresso transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-[#FFF9F3] font-semibold text-sm hover:bg-[#3E1012] transition-all shadow-xs active:translate-y-0.5"
                  >
                    <span>Next: Required Roles</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: REQUIRED ROLES ================= */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-accent text-xs font-mono font-semibold tracking-wider uppercase mb-3 border border-[#E6D8CF]">
                    <Users className="w-3.5 h-3.5" />
                    <span>03 // CREATIVE DISCIPLINES</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-espresso tracking-tight">
                    Which creative specialists do you require?
                  </h2>
                  <p className="text-sm text-muted mt-1 font-sans">
                    Select roles for your dedicated project squad.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {roleOptions.map((role) => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-white border-2 border-accent text-espresso shadow-xs"
                            : "bg-white border border-[#E6D8CF] text-muted hover:border-accent/40 hover:text-espresso"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold">{role}</div>
                          <div className="text-[11px] text-taupe font-mono">Curated studio principal</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            isSelected ? "bg-accent text-[#FFF9F3]" : "border border-[#E6D8CF]"
                          }`}
                        >
                          {isSelected && "✓"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-[#E6D8CF] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-espresso transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-[#FFF9F3] font-semibold text-sm hover:bg-[#3E1012] transition-all shadow-xs active:translate-y-0.5"
                  >
                    <span>Next: Budget & Timeline</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: BUDGET & TIMELINE ================= */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-accent text-xs font-mono font-semibold tracking-wider uppercase mb-3 border border-[#E6D8CF]">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>04 // BUDGET & TIMELINE</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-espresso tracking-tight">
                    Set project scope and parameters.
                  </h2>
                  <p className="text-sm text-muted mt-1 font-sans">
                    Align budget expectations to receive matching talent proposals.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-espresso uppercase tracking-wider mb-2">
                      Target Budget Range
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {budgetOptions.map((opt) => (
                        <button
                          key={opt.tier}
                          type="button"
                          onClick={() => {
                            setBudgetTier(opt.tier);
                            setBudgetRange(opt.range);
                          }}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            budgetTier === opt.tier
                              ? "bg-white border-2 border-accent text-espresso shadow-xs"
                              : "bg-white border border-[#E6D8CF] text-muted hover:border-accent/40 hover:text-espresso"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-espresso">{opt.range}</span>
                            <span className="font-mono text-xs font-bold text-accent">{opt.tier}</span>
                          </div>
                          <div className="text-xs text-muted">{opt.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-espresso uppercase tracking-wider mb-2">
                      Estimated Duration
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["3-5 weeks", "6-8 weeks", "8-12 weeks"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setTimeline(time)}
                          className={`py-3 rounded-xl text-xs font-mono font-semibold border text-center transition-all ${
                            timeline === time
                              ? "bg-accent text-[#FFF9F3] border-accent shadow-xs"
                              : "bg-white border-[#E6D8CF] text-espresso hover:border-accent/40"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E6D8CF] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-espresso transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteAndMatch}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-[#FFF9F3] font-semibold text-sm hover:bg-[#3E1012] transition-all shadow-xs active:translate-y-0.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Assemble & Match Squad</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 5: SQUAD MATCH RESULT ================= */}
            {step === 5 && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="text-center max-w-xl mx-auto space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-espresso tracking-tight">
                    Your Creative Squad Is Ready.
                  </h2>
                  <p className="text-sm text-muted">
                    We&apos;ve matched senior practitioners to your project parameters with mutual NDA protection.
                  </p>
                </div>

                {/* PROJECT OVERVIEW SUMMARY STRIP */}
                <div className="p-4 rounded-2xl bg-white border border-[#E6D8CF] flex flex-wrap items-center justify-between gap-4 text-xs shadow-2xs">
                  <div>
                    <span className="text-muted">Mandate:</span>{" "}
                    <span className="font-bold text-espresso">{title}</span>
                  </div>
                  <div>
                    <span className="text-muted">Industry:</span>{" "}
                    <span className="font-semibold text-espresso">{industry}</span>
                  </div>
                  <div>
                    <span className="text-muted">Budget:</span>{" "}
                    <span className="font-mono font-bold text-accent">{budgetRange}</span>
                  </div>
                  <div>
                    <span className="text-muted">Timeline:</span>{" "}
                    <span className="font-semibold text-espresso">{timeline}</span>
                  </div>
                </div>

                {/* MATCHED TALENT CARDS */}
                <div className="space-y-4">
                  <div className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">
                    Recommended Squad Members ({matchedTalents.length})
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchedTalents.map((t, idx) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl border border-[#E6D8CF] bg-white shadow-2xs hover:border-accent/40 transition-all flex items-start gap-3.5 group"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#E0CEC3]/40 border border-[#E6D8CF]">
                          <Image
                            src={
                              idx === 0
                                ? "/images/talent/marcus-vance.jpg"
                                : idx === 1
                                ? "/images/talent/julian-mercer.jpg"
                                : idx === 2
                                ? "/images/talent/sienna-rodriguez.jpg"
                                : "/images/talent/dominic-sterling.jpg"
                            }
                            alt={t.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-base font-normal text-espresso truncate">{t.name}</span>
                            <span className="text-xs font-mono font-bold text-accent">{t.hourlyRate}</span>
                          </div>
                          <div className="text-xs text-accent font-mono truncate mb-1">
                            {t.specializations?.[0] || "Creative Specialist"}
                          </div>
                          <div className="text-[11px] text-muted truncate">
                            {t.experience} yrs exp • {t.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="pt-6 border-t border-[#E6D8CF] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link
                    href="/talent"
                    className="w-full sm:w-auto text-center px-6 py-3 rounded-xl border border-[#E6D8CF] bg-white text-espresso font-semibold text-sm hover:bg-[#FFF9F3] transition-colors shadow-2xs"
                  >
                    Browse Complete Talent Pool
                  </Link>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link
                      href="/ai-match"
                      className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-white border border-[#E6D8CF] text-espresso font-semibold text-sm hover:bg-[#FFF9F3] transition-colors shadow-2xs"
                    >
                      Refine in AI Match
                    </Link>

                    <Link
                      href="/dashboard/company/projects"
                      className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-accent text-[#FFF9F3] font-semibold text-sm hover:bg-[#3E1012] transition-all shadow-xs active:translate-y-0.5"
                    >
                      Open Project Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
