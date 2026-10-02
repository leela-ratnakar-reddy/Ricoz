"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, FileText, Sparkles, UserCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export const MatchingVisual: React.FC = () => {
  const [activeStep, setActiveStep] = useState(2); // 0: Company, 1: Brief, 2: Match, 3: Designer

  const flowNodes = [
    { id: 0, title: "COMPANY", icon: Building2, desc: "Vantage Robotics" },
    { id: 1, title: "PROJECT BRIEF", icon: FileText, desc: "Global Autonomous Rebrand" },
    { id: 2, title: "CREATIVE MATCH", icon: Sparkles, desc: "7-Factor Engine" },
    { id: 3, title: "SENIOR DESIGNER", icon: UserCheck, desc: "Alex Morgan (CD)" },
  ];

  const breakdownMetrics = [
    { label: "Brand Identity", val: 98 },
    { label: "Industry", val: 94 },
    { label: "Typography", val: 91 },
    { label: "Experience", val: 96 },
  ];

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-6 sm:p-10 shadow-surface overflow-hidden relative">
      {/* Background subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-radial-gradient from-accent-glow/20 via-transparent to-transparent pointer-events-none blur-3xl" />

      {/* Top flow node progression */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 mb-10">
        {flowNodes.map((node, idx) => {
          const Icon = node.icon;
          const isSelected = activeStep === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setActiveStep(node.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-surface-elevated border-accent shadow-glow"
                  : "bg-surface-muted border-surface-border hover:border-surface-borderLight"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${isSelected ? "text-accent" : "text-brand-muted"}`} />
                <span className="font-mono text-[10px] text-brand-muted">0{idx + 1}</span>
              </div>
              <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-brand">
                {node.title}
              </h4>
              <p className="text-[11px] text-brand-secondary mt-1 truncate">
                {node.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Center Animated Matching Card Showcase */}
      <div className="bg-background-secondary border border-surface-border rounded-xl p-6 sm:p-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Overall Score Dial */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-surface rounded-xl border border-surface-border">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-muted mb-2">
            OVERALL FIT
          </span>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="#242731"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="#C8FF3D"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - 0.94)}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-3xl font-extrabold text-brand">94%</span>
              <span className="font-mono text-[10px] text-accent font-semibold tracking-wider">MATCH</span>
            </div>
          </div>
          <span className="text-xs text-brand-secondary font-mono mt-3">
            Algorithmic Synergy
          </span>
        </div>

        {/* Right: Dimension Breakdown Bars */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <span className="font-mono text-xs uppercase tracking-widest text-brand font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Weighted Dimension Verification
            </span>
            <span className="text-[10px] font-mono text-brand-muted">
              MODEL // DETERMINISTIC_V2
            </span>
          </div>

          <div className="space-y-3">
            {breakdownMetrics.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-secondary font-medium">{item.label}</span>
                  <span className="font-mono font-bold text-accent">{item.val}%</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-surface-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.val}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-violet to-accent"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-brand-secondary">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              <span>Verified alignment across design styles, day rates, and immediate bandwidth.</span>
            </div>
            <Link
              href="/designers/des-1"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:text-accent-hover shrink-0"
            >
              <span>Inspect candidate profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
