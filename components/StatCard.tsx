import React from "react";

interface StatCardProps {
  value: string;
  label: string;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, subtext }) => {
  return (
    <div className="bg-surface/80 border border-surface-border rounded-xl p-6 hover:border-accent/40 transition-colors shadow-subtle">
      <div className="text-3xl md:text-4xl font-light tracking-tight text-brand font-mono flex items-baseline gap-1">
        <span>{value}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-brand tracking-tight">
        {label}
      </div>
      {subtext && (
        <div className="mt-1 text-xs text-brand-muted font-mono">
          {subtext}
        </div>
      )}
    </div>
  );
};
