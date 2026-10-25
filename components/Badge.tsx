import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "accent" | "violet" | "success" | "outline" | "subtle";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "sm",
  className,
}) => {
  const base = "inline-flex items-center font-medium tracking-tight select-none rounded-full";

  const variants = {
    neutral: "bg-[#FFF9F3] text-espresso border border-[#E6D8CF]",
    subtle: "bg-white text-muted border border-[#E6D8CF]/80",
    accent: "bg-accent/10 text-accent border border-accent/20 font-semibold",
    violet: "bg-taupe/15 text-espresso border border-taupe/30 font-semibold",
    success: "bg-emerald-50 text-emerald-850 border border-emerald-200",
    outline: "bg-transparent text-muted border border-[#E6D8CF]",
  };

  const sizes = {
    sm: "text-[11px] px-2.5 py-0.5 font-mono",
    md: "text-xs px-3 py-1 font-mono",
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
