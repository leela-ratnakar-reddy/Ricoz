"use client";

import React from "react";
import Link from "next/link";
import { FileEdit, Search, CheckSquare, Rocket, ArrowRight } from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Tell Us About Your Project",
      description: "Share your project requirements, goals and creative needs.",
      icon: FileEdit,
      bullets: ["Define business goals & deliverables", "Set budget tier and target timeline", "Specify required creative specializations"],
    },
    {
      number: "02",
      title: "Discover Relevant Talent",
      description: "Explore creative professionals whose skills and experience match your requirements.",
      icon: Search,
      bullets: ["19 vetted creative disciplines", "Deterministic multi-dimensional matching", "Verified studio-grade portfolios"],
    },
    {
      number: "03",
      title: "Review & Shortlist",
      description: "Compare profiles and shortlist the talent that fits your project.",
      icon: CheckSquare,
      bullets: ["Side-by-side profile evaluations", "Documented client case studies", "Assemble multidisciplinary creative pods"],
    },
    {
      number: "04",
      title: "Start Your Project",
      description: "Move forward with the right creative professionals and manage the project through RICOZ.",
      icon: Rocket,
      bullets: ["Standardized mutual NDA protection", "Structured milestone deliverables", "Centralized collaboration workspace"],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
            <span>HOW RICOZ WORKS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            From Project Idea To The Right Creative Team.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            A transparent four-step workflow designed to take the friction, guesswork, and administrative overhead out of finding senior creative professionals.
          </p>
        </div>

        {/* 4 HORIZONTAL STEPS WITH CONNECTING LINE */}
        <div className="relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div className="hidden lg:block absolute top-14 left-16 right-16 h-0.5 bg-slate-200 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-red-200 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Icon + Step Number */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-2xl font-black text-slate-300 group-hover:text-red-500 transition-colors">
                        {step.number}
                      </span>
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2.5 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-5 font-normal">
                      {step.description}
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    {step.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA LINK */}
        <div className="mt-14 text-center">
          <Link
            href="/start-project"
            className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors group"
          >
            <span>Ready to start? Create your project requirements in 2 minutes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
