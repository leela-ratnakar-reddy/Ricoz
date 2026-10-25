"use client";

import React, { useState } from "react";
import Image from "next/image";

interface TalentAvatarProps {
  src?: string;
  alt: string;
  initials: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export const TalentAvatar: React.FC<TalentAvatarProps> = ({
  src,
  alt,
  initials,
  size = 48,
  className = "",
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  // Normalize image source path
  const normalizedSrc = React.useMemo(() => {
    if (!src) return "";
    return src.startsWith("/") ? src : `/${src}`;
  }, [src]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden shrink-0 select-none bg-[#FFF9F3] border border-[#E6D8CF] shadow-subtle ${className}`}
      style={{ width: size, height: size }}
    >
      {!hasError && normalizedSrc ? (
        <Image
          src={normalizedSrc}
          alt={alt || "Creative Specialist"}
          fill
          sizes={`${size}px`}
          className="object-cover transition-opacity duration-200"
          onError={() => setHasError(true)}
          priority={priority}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#541719] to-[#38241F] text-[#FFF9F3] font-serif font-bold tracking-wider"
          style={{ fontSize: Math.max(10, Math.floor(size * 0.36)) }}
          aria-label={alt || initials}
        >
          {initials || "TC"}
        </div>
      )}
    </div>
  );
};