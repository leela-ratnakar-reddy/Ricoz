"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export function TypographyTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.1, 0.4, 0.8, 1], [0.3, 1, 1, 0.4]);
  const y = useTransform(
    scrollYProgress,
    [0.1, 0.5],
    shouldReduceMotion ? [0, 0] : [30, 0]
  );

  return (
    <section
      ref={containerRef}
      className="py-28 sm:py-40 relative overflow-hidden border-b border-white/5 bg-background select-none"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-accent/[0.04] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div style={{ opacity, y }}>
          <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold block mb-6">
            THE PHILOSOPHY // 00
          </span>

          <h2 className="text-[clamp(36px,6vw,84px)] font-black tracking-tight text-white leading-[1.05] uppercase font-sans max-w-4xl mx-auto">
            Great work starts with<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent">
              the right people.
            </span>
          </h2>

          <p className="mt-8 text-base sm:text-xl text-brand-secondary max-w-2xl mx-auto leading-relaxed font-sans">
            Traditional agency models are slowed down by bureaucracy. Freelance platforms are plagued by unverified noise. Ricoz is the high-velocity intelligence layer connecting enterprise ambition with vetted creative leadership.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 sm:gap-16 font-mono text-xs text-brand-muted">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Deterministic Skill Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Studio Principals Only</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Guaranteed IP Transfer</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
