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
    neutral: "bg-surface-elevated text-brand-secondary border border-surface-border",
    subtle: "bg-surface text-brand-muted border border-surface-border/60",
    accent: "bg-accent-muted text-accent border border-accent-border font-semibold",
    violet: "bg-violet-muted text-violet border border-violet-border font-semibold",
    success: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50",
    outline: "bg-transparent text-brand-secondary border border-surface-border",
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
