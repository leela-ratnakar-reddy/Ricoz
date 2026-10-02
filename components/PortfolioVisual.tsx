import React from "react";

interface PortfolioVisualProps {
  title: string;
  client: string;
  industry: string;
  palette?: string[];
  aspectRatio?: string;
  className?: string;
}

export const PortfolioVisual: React.FC<PortfolioVisualProps> = ({
  title,
  client,
  industry,
  palette = ["#101218", "#151820", "#C8FF3D", "#F5F5F0"],
  aspectRatio = "aspect-[16/10]",
  className = "",
}) => {
  const charSum = (title + client).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const variant = charSum % 4;

  const bgDark = palette[0] || "#101218";
  const bgMid = palette[1] || "#151820";
  const accentLime = palette[2] || "#C8FF3D";
  const textLight = palette[3] || "#F5F5F0";

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-surface-border ${aspectRatio} ${className} select-none group`}
      style={{ backgroundColor: bgDark }}
    >
      {/* Background architectural grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${charSum}`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#242731" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${charSum})`} />
      </svg>

      {/* Abstract geometric composition based on variant */}
      {variant === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative w-44 h-44">
            <div
              className="absolute inset-0 rounded-full border border-dashed opacity-30 animate-spin-slow"
              style={{ borderColor: textLight }}
            />
            <div
              className="absolute inset-4 rounded-full border opacity-50"
              style={{ borderColor: bgMid }}
            />
            <div
              className="absolute inset-10 rounded-full border opacity-80"
              style={{ borderColor: "#242731" }}
            />
            <div
              className="absolute top-0 right-1/4 w-3.5 h-3.5 rounded-full shadow-glow"
              style={{ backgroundColor: accentLime }}
            />
            <div
              className="absolute bottom-6 left-6 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: textLight }}
            />
          </div>
        </div>
      )}

      {variant === 1 && (
        <div className="absolute inset-0 p-8 flex items-center justify-center">
          <div className="relative w-52 h-36">
            <div
              className="absolute top-0 left-0 w-32 h-32 border transform rotate-12 transition-transform duration-700 group-hover:rotate-6 opacity-40"
              style={{ borderColor: textLight }}
            />
            <div
              className="absolute bottom-0 right-4 w-28 h-28 border transform -rotate-6 opacity-60"
              style={{ borderColor: "#8B5CF6" }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full shadow-glow"
              style={{ backgroundColor: accentLime }}
            />
            <div
              className="absolute top-4 right-10 w-12 h-[1px]"
              style={{ backgroundColor: textLight }}
            />
          </div>
        </div>
      )}

      {variant === 2 && (
        <div className="absolute inset-0 p-8 flex items-center justify-center">
          <div className="relative w-48 h-40">
            <div className="space-y-3">
              <div className="h-[1.5px] w-full bg-white/20" />
              <div className="h-[1.5px] w-3/4 bg-white/40" />
              <div className="h-[1.5px] w-5/6 bg-accent/40" />
              <div className="h-[1.5px] w-1/2 bg-white/30" />
            </div>
            <div
              className="absolute top-6 right-6 w-16 h-16 rounded-full border-2 shadow-glow"
              style={{ borderColor: accentLime }}
            />
            <div
              className="absolute bottom-4 left-8 w-2 h-2 rounded-full"
              style={{ backgroundColor: textLight }}
            />
          </div>
        </div>
      )}

      {variant === 3 && (
        <div className="absolute inset-0 p-8 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#242731" strokeWidth="0.75" strokeDasharray="3,3" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.6" />
              <circle cx="50" cy="50" r="15" fill="none" stroke={textLight} strokeWidth="0.5" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#242731" strokeWidth="0.75" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#242731" strokeWidth="0.75" />
              <circle cx="50" cy="50" r="3.5" fill={accentLime} />
            </svg>
          </div>
        </div>
      )}

      {/* Editorial sector badge overlay on top left */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span
          className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded border border-surface-border bg-background/80 backdrop-blur-md text-brand-secondary"
        >
          {industry}
        </span>
      </div>

      {/* Editorial minimal typography on bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
        <div>
          <p
            className="text-[10px] font-mono tracking-wider opacity-60 uppercase text-brand-muted"
          >
            {client}
          </p>
          <p
            className="text-xs sm:text-sm font-bold tracking-tight leading-tight line-clamp-1 text-white group-hover:text-accent transition-colors"
          >
            {title}
          </p>
        </div>
        <div
          className="w-2 h-2 rounded-full shrink-0 shadow-glow"
          style={{ backgroundColor: accentLime }}
        />
      </div>
    </div>
  );
};
