"use client";

import React from "react";
import { FileText, Cpu, CheckSquare, Users2, ArrowRight } from "lucide-react";

export const HeroPipeline: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "PROJECT BRIEF",
      desc: "Raw idea & scope",
      icon: FileText
    },
    {
      num: "02",
      title: "RICOZ AI",
      desc: "Semantic decomposition",
      icon: Cpu,
      highlight: true
    },
    {
      num: "03",
      title: "CREATIVE NEEDS",
      desc: "Discipline mapping",
      icon: CheckSquare
    },
    {
      num: "04",
      title: "5 SPECIALISTS",
      desc: "Tailored creative squad",
      icon: Users2,
      highlightAccent: true
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className={`relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between ${
                step.highlightAccent
                  ? "bg-accent text-[#FFF9F3] border border-accent shadow-md"
                  : step.highlight
                  ? "bg-[#FFF9F3] border border-accent/30 shadow-xs"
                  : "bg-white border border-[#E6D8CF] shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-mono font-bold ${
                    step.highlightAccent ? "text-[#FFF9F3]/70" : "text-taupe"
                  }`}
                >
                  {step.num}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    step.highlightAccent
                      ? "bg-[#FFF9F3] text-accent"
                      : step.highlight
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-[#FFF9F3] text-espresso border border-[#E6D8CF]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <p
                  className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                    step.highlightAccent ? "text-[#FFF9F3]" : "text-espresso"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-xs mt-0.5 leading-snug ${
                    step.highlightAccent ? "text-[#FFF9F3]/80" : "text-muted"
                  }`}
                >
                  {step.desc}
                </p>
              </div>

              {/* Connecting arrow for desktop between steps */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-[#FFF9F3] border border-[#E6D8CF] items-center justify-center text-muted shadow-xs">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
