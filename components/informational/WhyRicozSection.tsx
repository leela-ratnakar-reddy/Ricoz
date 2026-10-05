"use client";

import React from "react";
import {
  Award,
  Sparkles,
  BookmarkCheck,
  Target,
  Kanban,
  Users
} from "lucide-react";

export const WhyRicozSection: React.FC = () => {
  const cards = [
    {
      title: "Curated Creative Talent",
      description: "Discover creative professionals across different disciplines and specializations.",
      icon: Award,
      badge: "Vetted Specialists",
    },
    {
      title: "Smart Talent Discovery",
      description: "Find relevant professionals based on your project's creative requirements.",
      icon: Sparkles,
      badge: "Intelligent Search",
    },
    {
      title: "Easy Shortlisting",
      description: "Review profiles and organize the talent you want to consider.",
      icon: BookmarkCheck,
      badge: "Focused Pods",
    },
    {
      title: "Project-Based Matching",
      description: "Connect project requirements with creative expertise instead of searching blindly.",
      icon: Target,
      badge: "Objective Fit",
    },
    {
      title: "Centralized Project Flow",
      description: "Keep important project information and collaboration steps organized in one place.",
      icon: Kanban,
      badge: "Unified Workspace",
    },
    {
      title: "Professional Creative Network",
      description: "Build connections with creative professionals for current and future projects.",
      icon: Users,
      badge: "Senior Principals",
    },
  ];

  return (
    <section id="why-ricoz" className="py-20 sm:py-28 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
            <span>WHY RICOZ</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Everything You Need To Build The Right Creative Team.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Designed for high-growth companies and design leaders who require elite creative execution without the complexity of traditional agency retainers or freelance guesswork.
          </p>
        </div>

        {/* 6 BENEFIT CARDS (3x2 GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 hover:border-red-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-red-600 transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
