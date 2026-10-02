"use client";

import React from "react";

interface FallbackRProps {
  className?: string;
  isFadingOut?: boolean;
}

export const FallbackR: React.FC<FallbackRProps> = ({
  className = "",
  isFadingOut = false,
}) => {
  return (
    <div
      className={`w-full h-full min-h-[380px] lg:min-h-[520px] relative flex flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface/30 select-none overflow-hidden transition-opacity duration-1000 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      } ${className}`}
    >
      {/* Background radial glow: violet + lime atmospheric depth */}
      <div className="absolute inset-0 pointer-events-none bg-hero-glow opacity-80" />
      <div className="absolute w-80 h-80 rounded-full bg-violet/10 blur-3xl pointer-events-none -top-10 -left-10" />
      <div className="absolute w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none -bottom-10 -right-10" />

      {/* Architectural framing guidelines */}
      <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-surface-border/50 pointer-events-none opacity-40 animate-[spin_60s_linear_infinite]" />
      <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-dashed border-surface-border/30 pointer-events-none opacity-30" />

      {/* Technical Scene Metadata (Corner annotations) */}
      <div className="absolute top-5 left-6 font-mono text-[10px] text-brand-muted tracking-widest uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span>RICOZ // 01 / R</span>
      </div>
      <div className="absolute top-5 right-6 font-mono text-[10px] text-brand-secondary tracking-widest uppercase hidden sm:block">
        CREATIVE IDENTITY
      </div>
      <div className="absolute bottom-5 left-6 font-mono text-[9px] text-brand-muted/70 tracking-widest uppercase hidden sm:block">
        MATERIAL // DARK GRAPHITE & METAL
      </div>
      <div className="absolute bottom-5 right-6 font-mono text-[9px] text-accent/80 tracking-widest uppercase flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-accent" />
        <span>REBRANDING ENGINE ACTIVE</span>
      </div>

      {/* Floating Particles in SVG */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle slow drift particle nodes */}
          <circle cx="25%" cy="30%" r="1.5" fill="#8A909A" opacity="0.6" className="animate-pulse" />
          <circle cx="75%" cy="28%" r="2" fill="#C8FF3D" opacity="0.7" className="animate-ping" style={{ animationDuration: "3s" }} />
          <circle cx="82%" cy="65%" r="1.5" fill="#8B5CF6" opacity="0.5" className="animate-pulse" />
          <circle cx="20%" cy="72%" r="2" fill="#454A53" opacity="0.6" />
          <circle cx="48%" cy="18%" r="1" fill="#F5F5F0" opacity="0.4" />
          <circle cx="55%" cy="84%" r="1.5" fill="#C8FF3D" opacity="0.6" />
        </svg>
      </div>

      {/* CENTER: Machine-like Engineered Stylized Letter R */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 transform transition-transform duration-700 hover:scale-105 animate-[bounce_6s_ease-in-out_infinite]">
        <svg
          viewBox="0 0 200 220"
          className="w-44 h-52 sm:w-56 sm:h-64 lg:w-64 lg:h-72 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] filter"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Metallic graphite gradients */}
            <linearGradient id="metalBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E222B" />
              <stop offset="50%" stopColor="#111318" />
              <stop offset="100%" stopColor="#08090C" />
            </linearGradient>

            <linearGradient id="metalFacetLight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6C7280" />
              <stop offset="40%" stopColor="#454A53" />
              <stop offset="100%" stopColor="#1A1C23" />
            </linearGradient>

            <linearGradient id="silverEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8A909A" />
              <stop offset="50%" stopColor="#D2D6DC" />
              <stop offset="100%" stopColor="#454A53" />
            </linearGradient>

            <linearGradient id="limeIllumination" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8FF3D" />
              <stop offset="100%" stopColor="#E2FF7E" />
            </linearGradient>

            <radialGradient id="violetRimGlow" cx="80%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>

            <filter id="limeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Deep shadow / backing plate */}
          <path
            d="M48 24 H124 C162 24 184 48 184 84 C184 114 164 134 136 142 L182 204 H134 L92 148 H76 V204 H48 V24 Z"
            fill="#050609"
            opacity="0.9"
            transform="translate(4, 6)"
          />

          {/* MAIN GRAPHITE BODY */}
          <path
            d="M48 24 H124 C162 24 184 48 184 84 C184 114 164 134 136 142 L182 204 H134 L92 148 H76 V204 H48 V24 Z"
            fill="url(#metalBody)"
            stroke="#242731"
            strokeWidth="2"
          />

          {/* FACET: Stem Left Bevel */}
          <path
            d="M48 24 H56 V204 H48 Z"
            fill="url(#silverEdge)"
            opacity="0.7"
          />

          {/* FACET: Top Horizontal Bevel */}
          <path
            d="M48 24 H124 L118 32 H56 L48 24 Z"
            fill="url(#silverEdge)"
            opacity="0.8"
          />

          {/* INNER COUNTER CUTOUT */}
          <path
            d="M76 52 H120 C138 52 152 64 152 84 C152 104 138 116 120 116 H76 V52 Z"
            fill="#07080C"
            stroke="#242731"
            strokeWidth="1.5"
          />

          {/* Inner counter inner light bevel */}
          <path
            d="M76 116 H120 C138 116 152 104 152 84"
            stroke="url(#silverEdge)"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />

          {/* FACET: Diagonal Leg Front Bevel */}
          <path
            d="M136 142 L182 204 H168 L126 148 Z"
            fill="url(#metalFacetLight)"
            opacity="0.85"
          />

          {/* VIOLET SECONDARY RIM REFLECTION */}
          <path
            d="M168 56 C178 68 184 80 184 84 C184 114 164 134 136 142"
            stroke="#8B5CF6"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* SIGNATURE LIME ILLUMINATED ACCENT BEVEL & CORNER */}
          {/* Top-right lead apex */}
          <path
            d="M118 24 H124 C138 24 150 28 160 36"
            stroke="url(#limeIllumination)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#limeGlow)"
          />

          {/* Diagonal leg apex illumination */}
          <path
            d="M92 148 L104 148 L146 204 H134 Z"
            fill="url(#limeIllumination)"
            opacity="0.15"
          />

          {/* Machine Rivet / Precision Optical Sensor Dots */}
          <circle cx="62" cy="38" r="3" fill="#C8FF3D" filter="url(#limeGlow)" />
          <circle cx="62" cy="38" r="1.2" fill="#07080C" />

          <circle cx="172" cy="198" r="3.5" fill="#C8FF3D" filter="url(#limeGlow)" />
          <circle cx="172" cy="198" r="1.5" fill="#07080C" />

          {/* Subtle horizontal laser calibration line */}
          <line
            x1="30"
            y1="148"
            x2="190"
            y2="148"
            stroke="#C8FF3D"
            strokeWidth="0.75"
            strokeDasharray="4 6"
            opacity="0.35"
          />
        </svg>
      </div>
    </div>
  );
};
