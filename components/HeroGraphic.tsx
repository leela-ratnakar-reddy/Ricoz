"use client";

import React, { useState, useEffect } from "react";

// Safe coordinate rounding utility to prevent floating-point SSR/client hydration differences
const round = (value: number) => Math.round(value * 100) / 100;

// Deterministic tick marks on Orbit radius 180 (center: 250, 250)
// Angles: 0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330 deg
const ORBIT_TICK_MARKS = [
  0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330,
].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    deg,
    x1: round(250 + 175 * Math.cos(rad)),
    y1: round(250 + 175 * Math.sin(rad)),
    x2: round(250 + 185 * Math.cos(rad)),
    y2: round(250 + 185 * Math.sin(rad)),
    strokeWidth: deg % 90 === 0 ? "1.5" : "0.75",
  };
});

export const HeroGraphic: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full max-w-[540px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* Outer subtle radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-surface-muted via-transparent to-accent-subtle rounded-full opacity-60 blur-2xl" />

      {/* Main geometric canvas with fixed, deterministic viewBox */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D92D20" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#D92D20" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#D92D20" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E0E10" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#D92D20" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0E0E10" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Ambient Radar Area */}
        <circle cx="250" cy="250" r="220" fill="url(#radarGlow)" />

        {/* Concentric Circles */}
        <circle
          cx="250"
          cy="250"
          r="230"
          stroke="#E5E5E2"
          strokeWidth="1"
          strokeDasharray="4 6"
          className="opacity-70"
        />
        <circle
          cx="250"
          cy="250"
          r="180"
          stroke="#E2E2DF"
          strokeWidth="1"
          className="opacity-80"
        />
        <circle
          cx="250"
          cy="250"
          r="125"
          stroke="#D4D4D0"
          strokeWidth="1.2"
          strokeDasharray="2 4"
        />
        <circle
          cx="250"
          cy="250"
          r="70"
          stroke="#0E0E10"
          strokeWidth="1.2"
          className="opacity-60"
        />
        <circle
          cx="250"
          cy="250"
          r="24"
          stroke="#D92D20"
          strokeWidth="1"
          strokeDasharray="3 3"
          className={`origin-center ${mounted ? "animate-radar" : ""}`}
        />

        {/* Orthogonal Coordinate Axes */}
        <line x1="20" y1="250" x2="480" y2="250" stroke="#ECECE8" strokeWidth="1" />
        <line x1="250" y1="20" x2="250" y2="480" stroke="#ECECE8" strokeWidth="1" />

        {/* Diagonal Ray Guides */}
        <line x1="80" y1="80" x2="420" y2="420" stroke="#F0F0EC" strokeWidth="0.75" />
        <line x1="80" y1="420" x2="420" y2="80" stroke="#F0F0EC" strokeWidth="0.75" />

        {/* Degree Tick Marks on Orbit 180 (Fully Deterministic & Rounded) */}
        {ORBIT_TICK_MARKS.map((tick) => (
          <line
            key={tick.deg}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#A8A8A2"
            strokeWidth={tick.strokeWidth}
          />
        ))}

        {/* Network Vector Connections */}
        <path
          d="M 160 140 L 250 250 L 370 190 L 340 330 L 250 250 L 170 340 Z"
          stroke="url(#lineGrad1)"
          strokeWidth="1.2"
          fill="none"
          className="opacity-75"
        />
        <line x1="370" y1="190" x2="410" y2="280" stroke="#C4C4C0" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="160" y1="140" x2="110" y2="210" stroke="#C4C4C0" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* Network Nodes */}
        {/* Node A (Creative Direction) */}
        <circle cx="160" cy="140" r="5" fill="#0E0E10" />
        <circle cx="160" cy="140" r="10" stroke="#0E0E10" strokeWidth="0.75" strokeDasharray="2 2" className="opacity-60" />

        {/* Node B (Brand Strategy) */}
        <circle cx="370" cy="190" r="5.5" fill="#1C1C20" />
        <circle cx="370" cy="190" r="12" stroke="#2B2B30" strokeWidth="0.75" className="opacity-40" />

        {/* Node C (Typography Specialist) */}
        <circle cx="340" cy="330" r="4.5" fill="#2E2E33" />

        {/* Node D (Visual Identity) */}
        <circle cx="170" cy="340" r="5" fill="#0E0E10" />

        {/* Node E (Satellite) */}
        <circle cx="410" cy="280" r="3" fill="#888884" />
        <circle cx="110" cy="210" r="3" fill="#888884" />

        {/* Center Primary Node */}
        <circle cx="250" cy="250" r="8" fill="#0E0E10" />
        <circle cx="250" cy="250" r="16" stroke="#0E0E10" strokeWidth="0.75" className="opacity-30" />

        {/* SIGNATURE ACCENT NODE: Deep Modern Red Point */}
        <g className={mounted ? "animate-pulse" : ""}>
          <circle cx="310" cy="170" r="18" fill="#D92D20" fillOpacity="0.15" />
          <circle cx="310" cy="170" r="10" fill="#D92D20" fillOpacity="0.3" />
          <circle cx="310" cy="170" r="5" fill="#D92D20" />
        </g>
        <line x1="250" y1="250" x2="310" y2="170" stroke="#D92D20" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Technical Coordinate Typography */}
        <text x="325" y="165" fill="#D92D20" fontSize="10" fontFamily="monospace" fontWeight="600" letterSpacing="1">
          96% MATCH
        </text>
        <text x="165" y="125" fill="#555552" fontSize="9" fontFamily="monospace" letterSpacing="0.5">
          DIR_01 [NYC]
        </text>
        <text x="380" y="210" fill="#555552" fontSize="9" fontFamily="monospace" letterSpacing="0.5">
          STRAT_03 [LDN]
        </text>
        <text x="255" y="470" fill="#8A8A85" fontSize="8" fontFamily="monospace" letterSpacing="1">
          COORDINATES // REBRAND_CORE
        </text>
      </svg>
    </div>
  );
};
