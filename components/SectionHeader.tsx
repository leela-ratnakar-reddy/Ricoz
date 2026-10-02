import React from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className = "",
}) => {
  const isCenter = align === "center";

  return (
    <div
      className={`mb-10 md:mb-14 ${
        isCenter ? "text-center max-w-3xl mx-auto" : "flex flex-col md:flex-row md:items-end justify-between gap-6"
      } ${className}`}
    >
      <div className={isCenter ? "" : "max-w-2xl"}>
        {eyebrow && (
          <div className="font-mono text-[11px] font-medium uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
            {isCenter && <span className="w-4 h-[1px] bg-accent" />}
            <span>{eyebrow}</span>
            {isCenter && <span className="w-4 h-[1px] bg-accent" />}
          </div>
        )}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight font-sans">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-brand-secondary text-sm md:text-base leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {!isCenter && action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
