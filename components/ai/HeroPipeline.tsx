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
      desc: "Domain & discipline mapping",
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
                  ? "bg-[#141418] border border-accent/40 shadow-[0_0_20px_rgba(184,255,0,0.12)]"
                  : step.highlight
                  ? "bg-[#141418] border border-white/20 shadow-md"
                  : "bg-[#111114] border border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold text-zinc-500">
                  {step.num}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    step.highlightAccent
                      ? "bg-accent text-black"
                      : "bg-white/5 text-zinc-300 border border-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold">
                  {step.title}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                  {step.desc}
                </p>
              </div>

              {/* Connecting arrow for desktop between steps */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-[#1A1A20] border border-white/15 items-center justify-center text-zinc-400">
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
