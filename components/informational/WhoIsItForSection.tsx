"use client";

import React from "react";
import { Building2, Megaphone, Compass, CheckCircle2 } from "lucide-react";

export const WhoIsItForSection: React.FC = () => {
  const personas = [
    {
      title: "Businesses & Startups",
      badge: "High Growth",
      icon: Building2,
      description:
        "For companies looking for creative professionals to support branding, design and growth projects.",
      highlights: [
        "Seed to Series C brand launches",
        "Category positioning & narrative creation",
        "Complete digital identity and product design",
      ],
    },
    {
      title: "Marketing & Brand Teams",
      badge: "Enterprise Scale",
      icon: Megaphone,
      description:
        "For teams that need specialized creative expertise without building every capability in-house.",
      highlights: [
        "Executive brand refresh & campaigns",
        "Design systems & token governance",
        "Senior creative direction on-demand",
      ],
    },
    {
      title: "Project Owners",
      badge: "Dedicated Mandates",
      icon: Compass,
      description:
        "For people who need the right creative talent for a specific project or requirement.",
      highlights: [
        "Specialized packaging & industrial design",
        "High-craft typographic & editorial monographs",
        "Interactive 3D & motion campaigns",
      ],
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-slate-50/70 border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase mb-4">
            <span>WHO RICOZ IS FOR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Built For Businesses That Need Great Creative Work.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Whether scaling a venture-backed startup or leading brand transformation inside an enterprise, RICOZ aligns senior creative talent with your exact mandate.
          </p>
        </div>

        {/* 3 AUDIENCE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <div
                key={persona.title}
                className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-red-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
                      {persona.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 uppercase tracking-tight">
                    {persona.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {persona.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-2.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Key Project Types
                  </div>
                  {persona.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
