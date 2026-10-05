"use client";

import React from "react";
import Link from "next/link";
import { Search, Sparkles, FolderKanban, ArrowRight, ShieldCheck, Check } from "lucide-react";

export const PlatformFeaturesSection: React.FC = () => {
  const features = [
    {
      step: "01",
      title: "Talent Discovery",
      eyebrow: "CURATED SEARCH",
      description:
        "Explore relevant creative professionals and discover the expertise your project needs.",
      icon: Search,
      href: "/talent",
      actionText: "Explore Talent Directory",
      capabilities: [
        "Filter across 19 specialized creative disciplines",
        "Vetted senior backgrounds (ex-Pentagram, Apple, Pentagram)",
        "Direct access to documented portfolio case studies",
      ],
    },
    {
      step: "02",
      title: "Shortlist & Match",
      eyebrow: "INTELLIGENT COMPATIBILITY",
      description:
        "Review profiles, compare options and build a focused shortlist.",
      icon: Sparkles,
      href: "/ai-match",
      actionText: "Try AI Matching Engine",
      capabilities: [
        "Deterministic V3.1 project understanding",
        "Objective alignment on scope, tone, and deliverables",
        "Interactive refinement and team pod composition",
      ],
    },
    {
      step: "03",
      title: "Project Management",
      eyebrow: "STREAMLINED EXECUTION",
      description:
        "Move from talent discovery into an organized project workflow.",
      icon: FolderKanban,
      href: "/dashboard/company",
      actionText: "Open Project Dashboard",
      capabilities: [
        "Structured deliverables & milestone roadmaps",
        "Mutual non-disclosure agreements built-in",
        "Centralized communication and escrow safety",
      ],
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
            <span>RICOZ PLATFORM</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            One Platform. A Better Way To Manage Creative Projects.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Discover talent, evaluate profiles, build your shortlist and move projects forward through a centralized experience.
          </p>
        </div>

        {/* 3 MAJOR FEATURE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 hover:border-red-200 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-300 group-hover:text-red-500 transition-colors">
                      {feature.step}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold uppercase tracking-wider text-red-600 mb-1">
                    {feature.eyebrow}
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {feature.description}
                  </p>

                  <div className="space-y-2.5 mb-8">
                    {feature.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors"
                  >
                    <span>{feature.actionText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
