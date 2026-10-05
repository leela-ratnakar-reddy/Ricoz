import React from "react";
import Link from "next/link";
import { BrandMark } from "./BrandMark";

interface WordmarkProps {
  markSize?: number;
  textSize?: string;
  className?: string;
  withLink?: boolean;
  variant?: "dark" | "light";
}

export const Wordmark: React.FC<WordmarkProps> = ({
  markSize = 24,
  textSize = "text-lg md:text-xl",
  className = "",
  withLink = true,
  variant = "dark",
}) => {
  const isLight = variant === "light";
  const textColor = isLight ? "text-slate-900" : "text-white";
  const dotColor = isLight ? "bg-red-600" : "bg-accent";

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <BrandMark
        size={markSize}
        variant={variant}
        withGlow
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <span className={`font-sans font-extrabold tracking-tight ${textColor} flex items-center ${textSize}`}>
        RICOZ
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ml-1.5 inline-block group-hover:scale-125 transition-transform`} />
      </span>
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
};
