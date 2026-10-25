"use client";

import React from "react";
import Link from "next/link";
import { Search, Sparkles, FolderKanban, ArrowRight, Check } from "lucide-react";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export const PlatformFeaturesSection: React.FC = () => {
  const features = [
    {
      step: "01",
      title: "Talent Discovery",
      eyebrow: "CURATED SEARCH",
      description:
        "Explore senior creative professionals and discover the specialized craft your project demands.",
      icon: Search,
      href: "/talent",
      actionText: "Explore Talent Directory",
      capabilities: [
        "Filter across 19 specialized creative disciplines",
        "Vetted senior backgrounds (ex-Pentagram, Wolff Olins, Apple)",
        "Direct access to documented portfolio case studies",
      ],
    },
    {
      step: "02",
      title: "Shortlist & Match",
      eyebrow: "INTELLIGENT COMPATIBILITY",
      description:
        "Review profiles, evaluate work specimens, and assemble your multidisciplinary squad.",
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
        "Transition seamlessly from talent discovery into an organized milestone roadmap.",
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
    <section id="features" className="py-20 sm:py-28 bg-white border-b border-[#E6D8CF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="mb-4">
            <EditorialBadge variant="burgundy">
              RICOZ PLATFORM ARCHITECTURE
            </EditorialBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
            One Platform. A Better Way To Direct Creative Mandates.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#76665F] leading-relaxed font-sans font-normal">
            Discover talent, evaluate profiles, build your shortlist and execute projects through a centralized, curated ecosystem.
          </p>
        </div>

        {/* 3 MAJOR FEATURE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[#FFF9F3] rounded-3xl border border-[#E6D8CF] p-8 shadow-subtle hover:shadow-card hover:border-[#C7A99A] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#541719]/10 text-[#541719] flex items-center justify-center group-hover:bg-[#541719] group-hover:text-[#FFF9F3] transition-all shadow-subtle">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif text-sm font-bold text-[#C7A99A] group-hover:text-[#541719] transition-colors">
                      {feature.step}
                    </span>
                  </div>

                  <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#541719] mb-1">
                    {feature.eyebrow}
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-[#38241F] mb-3 tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-[#76665F] leading-relaxed mb-6 font-sans font-normal">
                    {feature.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-[#E6D8CF] mb-8">
                    {feature.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#76665F] font-sans">
                        <Check className="w-4 h-4 text-[#541719] shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6D8CF]">
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#541719] hover:underline font-sans"
                  >
                    <span>{feature.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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