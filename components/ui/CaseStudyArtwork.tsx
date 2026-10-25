"use client";

import React, { useState } from "react";
import Image from "next/image";
import { EditorialStar } from "./EditorialDecorations";

interface CaseStudyArtworkProps {
  src?: string;
  title: string;
  discipline?: string;
  deliverables?: string[];
  palette?: string[];
  className?: string;
  aspectRatio?: string;
}

export const CaseStudyArtwork: React.FC<CaseStudyArtworkProps> = ({
  src,
  title,
  discipline = "Brand Identity",
  deliverables = ["Visual Identity", "Design System", "Editorial Direction"],
  palette = ["#38241F", "#541719", "#C7A99A", "#FBF6F0"],
  className = "",
  aspectRatio = "aspect-[16/10]",
}) => {
  const [hasError, setHasError] = useState(false);

  const normalizedSrc = React.useMemo(() => {
    if (!src) return "";
    return src.startsWith("/") ? src : `/${src}`;
  }, [src]);

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-[#FFF9F3] border border-[#E6D8CF] ${aspectRatio} ${className}`}>
      {!hasError && normalizedSrc ? (
        <Image
          src={normalizedSrc}
          alt={title || "Case Study Project"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setHasError(true)}
        />
      ) : (
        /* Rich Project-Specific Editorial Generative Specimen Artifact */
        <div className="absolute inset-0 p-5 flex flex-col justify-between bg-gradient-to-br from-[#FFF9F3] via-[#FBF6F0] to-[#FAF2EA] text-[#38241F] border border-[#E6D8CF]">
          {/* Top Specimen Header */}
          <div className="flex items-center justify-between border-b border-[#E6D8CF] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#541719] animate-pulse" />
              <span className="text-[10px] font-sans font-semibold tracking-widest text-[#76665F] uppercase">
                {discipline} // MANDATE SPECIMEN
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-sans text-[#76665F]">
              <EditorialStar size={10} color="#541719" />
              <span>RICOZ CURATED</span>
            </div>
          </div>

          {/* Center Typographic Mark & Geometry */}
          <div className="my-auto py-2">
            <div className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#38241F] leading-tight">
              {title.split("—")[0].trim()}
            </div>
            {title.includes("—") && (
              <p className="text-xs text-[#76665F] mt-1 font-sans italic">
                {title.split("—")[1].trim()}
              </p>
            )}
            
            {/* Color Swatches */}
            <div className="flex items-center gap-1.5 mt-3">
              {palette.map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-[#E6D8CF] shadow-subtle"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Bottom Deliverables Tags */}
          <div className="pt-3 border-t border-[#E6D8CF] flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5 max-w-[80%]">
              {deliverables.slice(0, 3).map((d, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#541719] border border-[#E6D8CF] font-medium"
                >
                  {d}
                </span>
              ))}
            </div>
            <span className="text-[10px] font-mono text-[#9E8E87]">VERIFIED</span>
          </div>
        </div>
      )}
    </div>
  );
};