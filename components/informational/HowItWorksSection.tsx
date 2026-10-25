"use client";

import React from "react";
import Link from "next/link";
import { FileEdit, Search, CheckSquare, Rocket, ArrowRight } from "lucide-react";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Tell Us About Your Project",
      description: "Share your project requirements, goals and creative vision with our structured intake engine.",
      icon: FileEdit,
      bullets: ["Define business goals & deliverables", "Set budget tier and target timeline", "Specify required creative specializations"],
    },
    {
      number: "02",
      title: "Discover Relevant Talent",
      description: "Explore curated creative specialists whose skills, philosophy, and experience match your brief.",
      icon: Search,
      bullets: ["19 vetted creative disciplines", "Deterministic multi-dimensional matching", "Verified studio-grade portfolios"],
    },
    {
      number: "03",
      title: "Review & Shortlist",
      description: "Compare profiles, evaluate work specimens, and assemble your multidisciplinary squad.",
      icon: CheckSquare,
      bullets: ["Side-by-side profile evaluations", "Documented client case studies", "Assemble multidisciplinary creative pods"],
    },
    {
      number: "04",
      title: "Start Your Project",
      description: "Commence execution under bilateral NDA and structured milestone escrow protections.",
      icon: Rocket,
      bullets: ["Standardized mutual NDA protection", "Structured milestone deliverables", "Centralized collaboration workspace"],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#FFF9F3] border-b border-[#E6D8CF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="mb-4">
            <EditorialBadge variant="burgundy">
              MANDATE PROGRESSION WORKFLOW
            </EditorialBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
            From Project Idea To The Right Creative Team.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#76665F] leading-relaxed font-sans font-normal">
            A transparent four-step workflow designed to take the friction, guesswork, and administrative overhead out of discovering senior creative professionals.
          </p>
        </div>

        {/* 4 HORIZONTAL STEPS WITH CONNECTING LINE */}
        <div className="relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div className="hidden lg:block absolute top-14 left-16 right-16 h-0.5 bg-[#E6D8CF] -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-white rounded-2xl border border-[#E6D8CF] p-6 sm:p-7 shadow-subtle hover:shadow-card hover:border-[#C7A99A] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Icon + Step Number */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#541719]/10 text-[#541719] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#541719] group-hover:text-[#FFF9F3] transition-all shadow-subtle">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-serif text-2xl font-bold text-[#C7A99A] group-hover:text-[#541719] transition-colors">
                        {step.number}
                      </span>
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="text-lg font-serif font-bold text-[#38241F] mb-2.5 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#76665F] leading-relaxed mb-5 font-sans font-normal">
                      {step.description}
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="pt-4 border-t border-[#E6D8CF] space-y-2">
                    {step.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#76665F] font-sans">
                        <EditorialStar size={10} color="#541719" className="mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/start-project"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#541719] text-[#FFF9F3] font-semibold text-sm shadow-burgundy hover:bg-[#3E1012] transition-all"
          >
            <span>Start Your Creative Mandate Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};