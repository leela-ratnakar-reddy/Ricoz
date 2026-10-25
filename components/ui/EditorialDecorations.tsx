"use client";

import React from "react";

/**
 * 4-Point Editorial Sparkle / Star Motif (✦)
 * Commonly used across luxury editorial publications and the Canva reference.
 */
export const EditorialStar: React.FC<{
  size?: number;
  className?: string;
  color?: string;
}> = ({ size = 16, className = "", color = "currentColor" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * Delicate Organic Contour Lines / Flowing Vector Flourish
 * Matches the organic outline art from the Canva aesthetic.
 */
export const ContourFlourish: React.FC<{
  className?: string;
  strokeColor?: string;
  width?: number;
  height?: number;
}> = ({
  className = "",
  strokeColor = "rgba(199, 169, 154, 0.4)",
  width = 320,
  height = 180,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M10 90C45 40 95 20 160 50C225 80 250 160 310 130"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <path
        d="M30 140C90 150 140 100 190 120C240 140 280 90 310 40"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="160" cy="50" r="2.5" fill={strokeColor} />
      <circle cx="190" cy="120" r="2.5" fill={strokeColor} />
    </svg>
  );
};

/**
 * Botanical Line Art Flourish (Subtle editorial leaf/twig contour)
 */
export const BotanicalSprig: React.FC<{
  size?: number;
  className?: string;
  strokeColor?: string;
}> = ({ size = 28, className = "", strokeColor = "#C7A99A" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 40C16 32 24 22 36 10"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Leaves */}
      <path
        d="M20 31C18 27 19 23 23 23C27 23 26 27 24 29"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M25 24C28 20 32 20 33 23C34 26 30 28 27 26"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M30 17C30 13 33 11 36 12C39 13 38 17 34 17"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Delicate Editorial Section Divider with centered star or diamond motif
 */
export const EditorialDivider: React.FC<{
  className?: string;
  withStar?: boolean;
}> = ({ className = "", withStar = true }) => {
  return (
    <div className={`relative flex items-center justify-center my-8 ${className}`}>
      <div className="flex-grow border-t border-[#E6D8CF]" />
      {withStar && (
        <div className="px-4 text-[#C7A99A] flex items-center gap-2">
          <EditorialStar size={12} color="#C7A99A" />
        </div>
      )}
      <div className="flex-grow border-t border-[#E6D8CF]" />
    </div>
  );
};

/**
 * Editorial Pill Badge with italic or serif accent
 */
export const EditorialBadge: React.FC<{
  children: React.ReactNode;
  variant?: "burgundy" | "taupe" | "cream";
  className?: string;
}> = ({ children, variant = "cream", className = "" }) => {
  const styles = {
    burgundy: "bg-[#541719]/10 text-[#541719] border-[#541719]/20",
    taupe: "bg-[#C7A99A]/15 text-[#38241F] border-[#C7A99A]/30",
    cream: "bg-[#FFF9F3] text-[#38241F] border-[#E6D8CF]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[variant]} shadow-subtle ${className}`}
    >
      <EditorialStar size={10} color={variant === "burgundy" ? "#541719" : "#C7A99A"} />
      {children}
    </span>
  );
};
