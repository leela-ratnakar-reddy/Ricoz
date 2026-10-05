"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LandingNavbar } from "@/components/informational/LandingNavbar";
import { LandingFooter } from "@/components/informational/LandingFooter";
import { saveProject, getCurrentUser } from "@/lib/storage";
import { TALENT_PROFILES } from "@/data/talentProfiles";
import { TalentProfile } from "@/types/talent";
import { Industry, Role, BudgetTier, Project } from "@/types";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Star,
  Users,
  Building,
  Target,
  Clock,
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
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-red-500 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 py-12 sm:py-16 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* STEPPER PROGRESS BAR */}
          <div className="mb-10 sm:mb-12">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <span>Step {step} of 5</span>
              <span>
                {step === 1 && "Project Details"}
                {step === 2 && "Creative Goals"}
                {step === 3 && "Required Disciplines"}
                {step === 4 && "Budget & Timeline"}
                {step === 5 && "Squad Match Complete"}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* CARD CONTAINER */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-200/50">
            {/* ================= STEP 1: PROJECT ESSENTIALS ================= */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wider uppercase mb-3">
                    <Building className="w-3.5 h-3.5" />
                    <span>01 // PROJECT ESSENTIALS</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Tell us what you're building.
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Share basic context about your company and the core mandate.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Project Mandate Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Enterprise Cloud Rebrand & Design System"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Technologies"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Primary Industry
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {industries.map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => setIndustry(ind)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                            industry === ind
                              ? "bg-red-600 text-white border-red-600 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
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
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wider uppercase mb-3">
                    <Target className="w-3.5 h-3.5" />
                    <span>02 // CREATIVE GOALS & DELIVERABLES</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    What concrete deliverables do you need?
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
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
                            ? "bg-red-50/70 border-red-300 text-slate-900 shadow-sm"
                            : "bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-sm font-semibold">{goal}</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            isSelected ? "bg-red-600 text-white" : "border border-slate-300"
                          }`}
                        >
                          {isSelected && "✓"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
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
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wider uppercase mb-3">
                    <Users className="w-3.5 h-3.5" />
                    <span>03 // CREATIVE DISCIPLINES</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Which creative specialists do you require?
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
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
                            ? "bg-red-50/70 border-red-300 text-slate-900 shadow-sm"
                            : "bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold">{role}</div>
                          <div className="text-[11px] text-slate-500">Curated studio principal</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            isSelected ? "bg-red-600 text-white" : "border border-slate-300"
                          }`}
                        >
                          {isSelected && "✓"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
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
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wider uppercase mb-3">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>04 // BUDGET & TIMELINE</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Set project scope and parameters.
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Align budget expectations to receive matching talent proposals.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                              ? "bg-red-50/70 border-red-300 text-slate-900 shadow-sm"
                              : "bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-slate-900">{opt.range}</span>
                            <span className="font-mono text-xs font-bold text-red-600">{opt.tier}</span>
                          </div>
                          <div className="text-xs text-slate-500">{opt.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Estimated Duration
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["3-5 weeks", "6-8 weeks", "8-12 weeks"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setTimeline(time)}
                          className={`py-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                            timeline === time
                              ? "bg-red-600 text-white border-red-600 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteAndMatch}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
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
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Your Creative Squad Is Ready.
                  </h2>
                  <p className="text-sm text-slate-600">
                    We've matched senior practitioners to your project parameters with mutual NDA protection.
                  </p>
                </div>

                {/* PROJECT OVERVIEW SUMMARY STRIP */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Mandate:</span>{" "}
                    <span className="font-bold text-slate-900">{title}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Industry:</span>{" "}
                    <span className="font-semibold text-slate-900">{industry}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Budget:</span>{" "}
                    <span className="font-mono font-bold text-slate-900">{budgetRange}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Timeline:</span>{" "}
                    <span className="font-semibold text-slate-900">{timeline}</span>
                  </div>
                </div>

                {/* MATCHED TALENT CARDS */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Squad Members ({matchedTalents.length})
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchedTalents.map((t, idx) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:border-red-200 transition-all flex items-start gap-3.5"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
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
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm truncate">{t.name}</span>
                            <span className="text-xs font-mono font-bold text-red-600">{t.hourlyRate}</span>
                          </div>
                          <div className="text-xs text-red-600 font-medium truncate mb-1">
                            {t.specializations?.[0] || "Creative Specialist"}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {t.experience} yrs exp • {t.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link
                    href="/talent"
                    className="w-full sm:w-auto text-center px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Browse Complete Talent Pool
                  </Link>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link
                      href="/ai-match"
                      className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
                    >
                      Refine in AI Match V3.1
                    </Link>

                    <Link
                      href="/dashboard/company/projects"
                      className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
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

      <LandingFooter />
    </div>
  );
}
