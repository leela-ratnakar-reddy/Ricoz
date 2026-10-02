"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import { saveProject, getCurrentUser } from "@/lib/storage";
import { INDUSTRIES, ROLES, DESIGN_STYLES } from "@/data/mockData";
import { Industry, Role, BudgetTier, DesignStyle } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function CreateProjectPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState("Industrial Autonomous Systems Rebrand");
  const [companyName, setCompanyName] = useState("Vantage Robotics");
  const [industry, setIndustry] = useState<Industry>("Technology");

  React.useEffect(() => {
    const u = getCurrentUser();
    if (u.companyName) setCompanyName(u.companyName);
  }, []);

  const [rebrandingGoals, setRebrandingGoals] = useState<string[]>([
    "Visual modernization",
    "New positioning",
    "Company growth",
  ]);

  const [targetAudience, setTargetAudience] = useState(
    "Enterprise procurement teams, Fortune 500 VP of Supply Chain, Industrial Operations Directors"
  );
  const [brandPersonality, setBrandPersonality] = useState<string[]>([
    "Modern",
    "Technical",
    "Trustworthy",
    "Minimal",
  ]);

  const [requiredServices, setRequiredServices] = useState<Role[]>([
    "Creative Director",
    "Brand Identity Designer",
    "Visual Identity Designer",
  ]);
  const [preferredStyles, setPreferredStyles] = useState<DesignStyle[]>([
    "Minimal",
    "Corporate",
    "Bold",
  ]);

  const [budgetTier, setBudgetTier] = useState<BudgetTier>("$$$$");
  const [budgetRange, setBudgetRange] = useState("$75,000 - $110,000");
  const [timeline, setTimeline] = useState("8-10 weeks");
  const [startDate, setStartDate] = useState("Within 2 weeks");
  const [availabilityRequirement, setAvailabilityRequirement] = useState("Available now");

  const goalOptions = [
    "New positioning",
    "New audience",
    "Company growth",
    "Visual modernization",
    "Merger/acquisition",
    "Product expansion",
    "International scaling",
  ];

  const personalityOptions = [
    "Modern",
    "Bold",
    "Premium",
    "Trustworthy",
    "Playful",
    "Minimal",
    "Technical",
    "Human",
  ];

  const toggleItem = <T extends string>(list: T[], item: T, setter: (val: T[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created = saveProject({
      companyId: "comp-user",
      companyName,
      title,
      industry,
      status: "Discovery",
      timeline,
      startDate,
      budgetRange,
      budgetTier,
      rebrandingGoals,
      targetAudience,
      brandPersonality,
      requiredServices,
      preferredStyles,
      availabilityRequirement,
    });

    router.push(`/dashboard/company/projects/${created.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="company" />

        <main className="flex-1 p-6 lg:p-10 max-w-4xl">
          {/* TOP BACK & PROGRESS BAR */}
          <div className="mb-8">
            <Link
              href="/dashboard/company/projects"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-muted hover:text-brand transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to projects</span>
            </Link>

            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
                STEP {step} OF 6 —{" "}
                {step === 1 && "01 COMPANY"}
                {step === 2 && "02 BRAND"}
                {step === 3 && "03 GOALS"}
                {step === 4 && "04 CREATIVE REQUIREMENTS"}
                {step === 5 && "05 BUDGET & TIMELINE"}
                {step === 6 && "06 REVIEW"}
              </span>
              <span className="text-xs font-mono text-brand-muted">
                {Math.round((step / 6) * 100)}% COMPLETE
              </span>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="w-full h-1 bg-surface-elevated rounded-full overflow-hidden flex">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-full flex-1 border-r border-background last:border-0 transition-all duration-300 ${
                    s <= step ? "bg-accent" : "bg-surface-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* MULTI-STEP CONTAINER */}
          <div className="bg-surface/80 border border-surface-border rounded-xl p-6 sm:p-10 shadow-subtle">
            {/* STEP 1: PROJECT BASICS */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                    Project Basics
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                    Establish the primary identity of your rebranding initiative.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                      Project / Brief Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Global Industrial Rebranding & Visual Architecture"
                      className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                      Primary Industry Sector
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value as Industry)}
                      className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: REBRANDING GOALS */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                    Why are you rebranding?
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                    Select all commercial drivers shaping this project.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goalOptions.map((goal) => {
                    const isSelected = rebrandingGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleItem(rebrandingGoals, goal, setRebrandingGoals)}
                        className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-surface-elevated border-accent text-brand ring-1 ring-accent font-medium"
                            : "bg-surface-elevated/50 border-surface-border text-brand-secondary hover:border-surface-borderLight hover:text-brand"
                        }`}
                      >
                        <span className="text-xs sm:text-sm">{goal}</span>
                        {isSelected && <Check className="w-4 h-4 text-accent shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: AUDIENCE & BRAND PERSONALITY */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                    Audience & Brand Personality
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                    Define who you are speaking to and how your brand tone should resonate.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                      Target Audience & Procurement Stakeholders
                    </label>
                    <textarea
                      rows={3}
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Enterprise CTOs, Institutional Partners, High-Net-Worth Individuals"
                      className="w-full p-3 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-2">
                      Brand Personality Attributes
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {personalityOptions.map((pers) => {
                        const isSelected = brandPersonality.includes(pers);
                        return (
                          <button
                            key={pers}
                            type="button"
                            onClick={() => toggleItem(brandPersonality, pers, setBrandPersonality)}
                            className={`px-3.5 py-1.5 rounded-full text-xs border transition-colors ${
                              isSelected
                                ? "bg-accent text-background border-accent font-semibold"
                                : "bg-surface-elevated text-brand-secondary border-surface-border hover:border-surface-borderLight hover:text-brand"
                            }`}
                          >
                            {pers}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CREATIVE REQUIREMENTS & DISCIPLINES */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                    Creative Requirements
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                    Select the senior roles and design styles needed for your rebrand.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-2">
                    Required Creative Disciplines
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ROLES.map((role) => {
                      const isSelected = requiredServices.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleItem(requiredServices, role, setRequiredServices)}
                          className={`p-3 rounded-md border text-left flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? "bg-surface-elevated border-accent text-brand ring-1 ring-accent font-medium"
                              : "bg-surface-elevated/50 border-surface-border text-brand-secondary hover:border-surface-borderLight hover:text-brand"
                          }`}
                        >
                          <span>{role}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-2">
                    Preferred Aesthetic Direction
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DESIGN_STYLES.map((style) => {
                      const isSelected = preferredStyles.includes(style);
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => toggleItem(preferredStyles, style, setPreferredStyles)}
                          className={`px-3.5 py-1.5 rounded-full text-xs border transition-colors ${
                            isSelected
                              ? "bg-accent text-background border-accent font-semibold"
                              : "bg-surface-elevated text-brand-secondary border-surface-border hover:border-surface-borderLight hover:text-brand"
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: BUDGET & TIMELINE */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                    Budget & Timeline
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                    Set financial parameters and delivery expectations.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-2">
                      Budget Tier
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { tier: "$$$", range: "$40,000 - $65,000", desc: "Mid-scale Rebrand" },
                        { tier: "$$$$", range: "$70,000 - $120,000", desc: "Enterprise System" },
                        { tier: "$$$$$", range: "$130,000+", desc: "Multinational Scale" },
                      ].map((item) => (
                        <button
                          key={item.tier}
                          type="button"
                          onClick={() => {
                            setBudgetTier(item.tier as BudgetTier);
                            setBudgetRange(item.range);
                          }}
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            budgetTier === item.tier
                              ? "border-accent bg-surface-elevated ring-1 ring-accent"
                              : "border-surface-border bg-surface-elevated/50 hover:border-surface-borderLight"
                          }`}
                        >
                          <span className="font-mono font-medium text-sm text-brand block">
                            {item.tier}
                          </span>
                          <span className="text-xs font-medium text-brand-secondary block mt-1">
                            {item.range}
                          </span>
                          <span className="text-[10px] text-brand-muted font-mono block mt-0.5">
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                        Project Timeline
                      </label>
                      <input
                        type="text"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        placeholder="e.g. 6-8 weeks"
                        className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                        Target Start Date
                      </label>
                      <input
                        type="text"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="e.g. Immediate / Next 2 weeks"
                        className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                      Availability Requirement
                    </label>
                    <select
                      value={availabilityRequirement}
                      onChange={(e) => setAvailabilityRequirement(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                    >
                      <option value="Available now">Available now (Immediate start)</option>
                      <option value="Available soon">Available soon (Within 3-4 weeks)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: REVIEW & LAUNCH */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                    Review Rebranding Brief
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                    Verify all parameters before launching your matching computation.
                  </p>
                </div>

                <div className="bg-surface-elevated border border-surface-border rounded-lg p-6 space-y-4 text-xs sm:text-sm divide-y divide-surface-border">
                  <div className="grid grid-cols-3 gap-2 pb-3">
                    <span className="font-mono text-brand-muted uppercase text-xs">Project Title</span>
                    <span className="col-span-2 font-medium text-brand">{title}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3">
                    <span className="font-mono text-brand-muted uppercase text-xs">Company & Sector</span>
                    <span className="col-span-2 font-light text-brand-secondary font-mono">
                      {companyName} • {industry}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3">
                    <span className="font-mono text-brand-muted uppercase text-xs">Goals</span>
                    <span className="col-span-2 flex flex-wrap gap-1.5">
                      {rebrandingGoals.map((g) => (
                        <span key={g} className="bg-surface border border-surface-border px-2 py-0.5 rounded text-xs text-brand-secondary font-mono">
                          {g}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3">
                    <span className="font-mono text-brand-muted uppercase text-xs">Services Needed</span>
                    <span className="col-span-2 flex flex-wrap gap-1.5">
                      {requiredServices.map((r) => (
                        <span key={r} className="bg-surface border border-surface-border text-brand px-2 py-0.5 rounded text-xs font-mono">
                          {r}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3">
                    <span className="font-mono text-brand-muted uppercase text-xs">Budget & Timeline</span>
                    <span className="col-span-2 font-mono text-brand">
                      {budgetTier} ({budgetRange}) • {timeline} • Starts {startDate}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <p className="text-xs text-brand leading-relaxed font-light">
                    Upon creation, Ricoz will calculate matching Creative Directors and rank them by domain compatibility.
                  </p>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="pt-8 mt-8 border-t border-surface-border flex items-center justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleBack}
                  icon={<ArrowLeft className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <Button
                  type="button"
                  size="md"
                  onClick={handleNext}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="button"
                  size="md"
                  onClick={handleFinalSubmit}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Create Project & Run Matcher
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
