"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Info
} from "lucide-react";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

interface DisciplineConfig {
  id: string;
  name: string;
  roleTitle: string;
  hourlyBenchmark: number;
  deliverables: { id: string; name: string; hoursEstimate: number }[];
}

const DISCIPLINE_CONFIGS: DisciplineConfig[] = [
  {
    id: "brand-identity",
    name: "Brand Identity Design",
    roleTitle: "Brand Identity Designer",
    hourlyBenchmark: 155,
    deliverables: [
      { id: "logomark", name: "Core Vector Logomark & Wordmark", hoursEstimate: 35 },
      { id: "guidelines", name: "Comprehensive Brand Guidelines (PDF & Web)", hoursEstimate: 45 },
      { id: "tokens", name: "Design Token Color & Type Hierarchy", hoursEstimate: 25 },
      { id: "collateral", name: "Stationery & Digital Collateral Suite", hoursEstimate: 30 },
      { id: "social-kit", name: "Multi-Platform Social & Campaign Kit", hoursEstimate: 20 },
    ],
  },
  {
    id: "creative-direction",
    name: "Creative Direction & Strategy",
    roleTitle: "Creative Director",
    hourlyBenchmark: 175,
    deliverables: [
      { id: "category-narrative", name: "Category Narrative & Verbal Playbook", hoursEstimate: 40 },
      { id: "creative-brief", name: "Executive Creative Brief & North Star", hoursEstimate: 25 },
      { id: "campaign-concept", name: "Global Launch Concept & Mood Architecture", hoursEstimate: 35 },
      { id: "art-direction", name: "Editorial & Broadcast Art Direction System", hoursEstimate: 45 },
    ],
  },
  {
    id: "ui-ux",
    name: "UI/UX & Product Design",
    roleTitle: "UI/UX Designer",
    hourlyBenchmark: 160,
    deliverables: [
      { id: "design-system", name: "Figma Tokenized Component Library", hoursEstimate: 60 },
      { id: "core-flows", name: "Core Product User Flows & Wireframes", hoursEstimate: 45 },
      { id: "interactive-proto", name: "High-Fidelity Interactive Prototype", hoursEstimate: 40 },
      { id: "responsive-web", name: "Production Marketing Experience & Funnel", hoursEstimate: 50 },
    ],
  },
  {
    id: "packaging",
    name: "Structural Packaging Design",
    roleTitle: "Packaging Designer",
    hourlyBenchmark: 150,
    deliverables: [
      { id: "dielines", name: "Custom Structural Dielines & Tooling", hoursEstimate: 40 },
      { id: "unboxing", name: "Tactile Unboxing Experience & Folio", hoursEstimate: 35 },
      { id: "print-spec", name: "Pantone & Print Finish Production Specs", hoursEstimate: 30 },
      { id: "3d-renders", name: "Photorealistic 3D Packshot Renders", hoursEstimate: 25 },
    ],
  },
  {
    id: "motion",
    name: "Motion Design & 3D Visuals",
    roleTitle: "Motion Designer",
    hourlyBenchmark: 165,
    deliverables: [
      { id: "kinetic-logo", name: "Kinetic Logo Reveal & UI Micro-Interactions", hoursEstimate: 30 },
      { id: "teaser-film", name: "30-Second 3D Product Teaser Anthem", hoursEstimate: 60 },
      { id: "lottie-assets", name: "Production Lottie/Rive Web Asset Suite", hoursEstimate: 35 },
    ],
  },
];

const TIMELINE_OPTIONS = [
  { id: "sprint-2w", name: "Focused Sprint", weeks: 2, multiplier: 1.0, desc: "Fast execution for immediate deliverables" },
  { id: "mandate-4w", name: "Core Mandate", weeks: 4, multiplier: 1.0, desc: "Standard sprint rhythm with weekly reviews" },
  { id: "overhaul-8w", name: "Comprehensive Overhaul", weeks: 8, multiplier: 1.05, desc: "Full multi-phase transformation" },
];

interface MandateEstimatorProps {
  onOpenBriefing?: () => void;
}

export const MandateEstimator: React.FC<MandateEstimatorProps> = ({ onOpenBriefing }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("brand-identity");
  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<string[]>([
    "logomark",
    "guidelines",
    "tokens",
  ]);
  const [selectedTimelineId, setSelectedTimelineId] = useState<string>("mandate-4w");
  const [validationError, setValidationError] = useState<string>("");

  const activeDiscipline = useMemo(
    () => DISCIPLINE_CONFIGS.find((d) => d.id === selectedDisciplineId) || DISCIPLINE_CONFIGS[0],
    [selectedDisciplineId]
  );

  const activeTimeline = useMemo(
    () => TIMELINE_OPTIONS.find((t) => t.id === selectedTimelineId) || TIMELINE_OPTIONS[1],
    [selectedTimelineId]
  );

  const estimateCalculation = useMemo(() => {
    const selectedDeliverables = activeDiscipline.deliverables.filter((d) =>
      selectedDeliverableIds.includes(d.id)
    );
    const totalHours = selectedDeliverables.reduce((acc, curr) => acc + curr.hoursEstimate, 0);
    const baseBudget = totalHours * activeDiscipline.hourlyBenchmark * activeTimeline.multiplier;
    const lowerRange = Math.round((baseBudget * 0.9) / 100) * 100;
    const upperRange = Math.round((baseBudget * 1.15) / 100) * 100;

    return {
      totalHours,
      lowerRange,
      upperRange,
      hourlyRate: activeDiscipline.hourlyBenchmark,
      selectedCount: selectedDeliverables.length,
    };
  }, [activeDiscipline, selectedDeliverableIds, activeTimeline]);

  const toggleDeliverable = (id: string) => {
    setValidationError("");
    if (selectedDeliverableIds.includes(id)) {
      if (selectedDeliverableIds.length === 1) {
        setValidationError("At least one deliverable must be selected to compute an estimate.");
        return;
      }
      setSelectedDeliverableIds(selectedDeliverableIds.filter((item) => item !== id));
    } else {
      setSelectedDeliverableIds([...selectedDeliverableIds, id]);
    }
  };

  const handleDisciplineChange = (discId: string) => {
    setSelectedDisciplineId(discId);
    const newDisc = DISCIPLINE_CONFIGS.find((d) => d.id === discId);
    if (newDisc) {
      setSelectedDeliverableIds(newDisc.deliverables.slice(0, 2).map((d) => d.id));
    }
  };

  const resetEstimator = () => {
    setSelectedDisciplineId("brand-identity");
    setSelectedDeliverableIds(["logomark", "guidelines", "tokens"]);
    setSelectedTimelineId("mandate-4w");
    setStep(1);
    setValidationError("");
  };

  return (
    <section id="mandate-estimator" className="py-20 sm:py-28 bg-[#FFF9F3] border-b border-[#E6D8CF] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="mb-3">
            <EditorialBadge variant="burgundy">
              TRANSPARENT SCOPE PLANNING
            </EditorialBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
            Interactive Mandate & Budget Estimator
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#76665F] font-sans">
            Configure target deliverables, evaluate benchmark production hours, and estimate required investment tiers based on senior studio benchmarks.
          </p>
        </div>

        {/* STEPPER CONTAINER CARD */}
        <div className="bg-white rounded-3xl border border-[#E6D8CF] shadow-card overflow-hidden">
          {/* STEP HEADER TABS */}
          <div className="grid grid-cols-3 border-b border-[#E6D8CF] bg-[#FFF9F3] text-xs sm:text-sm font-sans font-bold text-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`py-4 transition-colors ${
                step === 1
                  ? "bg-white text-[#541719] border-b-2 border-[#541719]"
                  : "text-[#76665F] hover:bg-white/50"
              }`}
            >
              1. Creative Discipline
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`py-4 transition-colors ${
                step === 2
                  ? "bg-white text-[#541719] border-b-2 border-[#541719]"
                  : step > 2
                  ? "text-[#38241F] hover:bg-white/50"
                  : "text-[#9E8E87]"
              }`}
            >
              2. Target Deliverables
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`py-4 transition-colors ${
                step === 3
                  ? "bg-white text-[#541719] border-b-2 border-[#541719]"
                  : "text-[#9E8E87]"
              }`}
            >
              3. Timeline & Estimate
            </button>
          </div>

          {/* STEPPER CONTENT CONTAINER */}
          <div className="p-6 sm:p-10">
            {/* STEP 1: DISCIPLINE */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#38241F]">Choose Primary Creative Discipline</h3>
                  <p className="text-xs sm:text-sm text-[#76665F] mt-1 font-sans">
                    Select the core craft specialization required for this mandate phase.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {DISCIPLINE_CONFIGS.map((disc) => {
                    const isSelected = selectedDisciplineId === disc.id;
                    return (
                      <button
                        key={disc.id}
                        type="button"
                        onClick={() => handleDisciplineChange(disc.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-[#541719]/10 border-[#541719]/40 shadow-subtle"
                            : "bg-[#FFF9F3] border-[#E6D8CF] hover:border-[#C7A99A]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif font-bold text-sm text-[#38241F]">{disc.name}</span>
                          <span className="text-[11px] font-mono text-[#541719] font-bold">
                            ~${disc.hourlyBenchmark}/hr
                          </span>
                        </div>
                        <span className="text-xs text-[#76665F] font-sans">{disc.roleTitle}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-xs hover:bg-[#3E1012] transition-all shadow-burgundy"
                  >
                    <span>Next: Select Deliverables</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DELIVERABLES */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#38241F]">
                      Select Deliverables for {activeDiscipline.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#76665F] mt-1 font-sans">
                      Choose all concrete outputs to include in the scope estimate.
                    </p>
                  </div>
                  <span className="text-xs font-sans font-bold text-[#541719] bg-[#541719]/10 px-3 py-1 rounded-full border border-[#541719]/20">
                    {selectedDeliverableIds.length} Selected
                  </span>
                </div>

                {validationError && (
                  <div className="p-3 rounded-xl bg-[#541719]/10 border border-[#541719]/30 text-xs text-[#541719]">
                    {validationError}
                  </div>
                )}

                <div className="space-y-2.5">
                  {activeDiscipline.deliverables.map((del) => {
                    const isChecked = selectedDeliverableIds.includes(del.id);
                    return (
                      <button
                        key={del.id}
                        type="button"
                        onClick={() => toggleDeliverable(del.id)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? "bg-[#541719]/10 border-[#541719]/40 text-[#38241F]"
                            : "bg-[#FFF9F3] border-[#E6D8CF] text-[#76665F] hover:border-[#C7A99A]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                              isChecked
                                ? "bg-[#541719] text-[#FFF9F3]"
                                : "border border-[#E6D8CF] bg-white"
                            }`}
                          >
                            {isChecked && "✓"}
                          </div>
                          <span className="text-xs sm:text-sm font-sans font-semibold text-[#38241F]">{del.name}</span>
                        </div>
                        <span className="text-xs font-mono text-[#76665F]">
                          ~{del.hoursEstimate} hrs
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#76665F] hover:text-[#38241F] font-sans"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Disciplines</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-xs hover:bg-[#3E1012] transition-all shadow-burgundy"
                  >
                    <span>Next: Timeline & Estimate</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: TIMELINE & RESULT SUMMARY */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#38241F]">Sprint Timeline & Duration</h3>
                  <p className="text-xs sm:text-sm text-[#76665F] mt-1 font-sans">
                    Select target completion window to calculate benchmark budget.
                  </p>
                </div>

                {/* Timeline Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TIMELINE_OPTIONS.map((time) => {
                    const isSelected = selectedTimelineId === time.id;
                    return (
                      <button
                        key={time.id}
                        type="button"
                        onClick={() => setSelectedTimelineId(time.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-[#541719]/10 border-[#541719]/40 shadow-subtle"
                            : "bg-[#FFF9F3] border-[#E6D8CF] hover:border-[#C7A99A]"
                        }`}
                      >
                        <div className="font-serif font-bold text-sm text-[#38241F] mb-0.5">{time.name}</div>
                        <div className="text-xs font-sans text-[#541719] font-bold mb-1">
                          {time.weeks} Weeks
                        </div>
                        <div className="text-[11px] text-[#76665F] leading-snug font-sans">{time.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* ESTIMATE BENCHMARK CARD */}
                <div className="p-7 rounded-2xl bg-[#38241F] text-[#FFF9F3] border border-[#C7A99A]/30 space-y-4 shadow-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-sans font-bold tracking-wider text-[#C7A99A] uppercase block mb-1">
                        PLANNING BENCHMARK
                      </span>
                      <div className="text-2xl sm:text-3xl font-serif font-black text-white">
                        ${estimateCalculation.lowerRange.toLocaleString()} – ${estimateCalculation.upperRange.toLocaleString()}{" "}
                        <span className="text-xs font-sans text-[#E0CEC3] font-normal">USD</span>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
                      <span className="text-[11px] font-sans text-[#C7A99A] block">
                        Estimated Hours
                      </span>
                      <span className="text-base font-bold font-mono text-[#E0CEC3]">
                        ~{estimateCalculation.totalHours} hrs @ ${estimateCalculation.hourlyRate}/hr
                      </span>
                    </div>
                  </div>

                  {/* Summary Breakdown Details */}
                  <div className="text-xs text-[#E0CEC3] space-y-1.5 pt-1 font-sans">
                    <div className="flex justify-between">
                      <span className="text-[#C7A99A]">Discipline:</span>
                      <span className="font-bold text-white">{activeDiscipline.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C7A99A]">Deliverables in Scope:</span>
                      <span className="font-bold text-white">
                        {estimateCalculation.selectedCount} Shipped Artifacts
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C7A99A]">Timeline:</span>
                      <span className="font-bold text-white">{activeTimeline.name} ({activeTimeline.weeks} wks)</span>
                    </div>
                  </div>

                  {/* Pricing Disclaimer Note */}
                  <div className="flex items-start gap-2 pt-3 border-t border-white/10 text-[11px] text-[#C7A99A] leading-relaxed font-sans">
                    <Info className="w-3.5 h-3.5 text-[#C7A99A] shrink-0 mt-0.5" />
                    <span>
                      Planning estimate derived from RICOZ verified talent rate benchmarks ($145–$180/hr). Not a formal contract or binding quote. Final scope & rates confirmed directly with selected talent.
                    </span>
                  </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#76665F] hover:text-[#38241F] font-sans"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Edit Deliverables</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetEstimator}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9E8E87] hover:text-[#541719] ml-3 font-sans"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <Link
                    href={`/start-project`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-xs hover:bg-[#3E1012] transition-all shadow-burgundy"
                  >
                    <span>Commission Mandate with this Scope</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};