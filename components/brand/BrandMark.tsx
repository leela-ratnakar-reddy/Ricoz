import React from "react";

interface BrandMarkProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 28,
  className = "",
  withGlow = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {withGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 pointer-events-none"
          style={{ backgroundColor: "rgba(200, 255, 61, 0.35)" }}
        />
      )}
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Machine-like Dark Graphite & Polished Steel 3D Facets */}
        
        {/* Main stem vertical facet (Dark graphite #111318 with steel border) */}
        <path
          d="M7 5H13V27H7V5Z"
          fill="#111318"
          stroke="#454A53"
          strokeWidth="0.75"
        />

        {/* Stem Left Highlight Edge (Polished silver #8A909A) */}
        <path
          d="M7 5H8.5V27H7V5Z"
          fill="#8A909A"
        />

        {/* Upper bowl outer curve (Polished steel #454A53 with violet reflection) */}
        <path
          d="M13 5H19.5C23.0899 5 26 7.91015 26 11.5C26 15.0899 23.0899 18 19.5 18H13V5Z"
          fill="#1E222B"
          stroke="#6C7280"
          strokeWidth="0.75"
        />

        {/* Upper bowl inner counter (Black #07080C recessed area) */}
        <path
          d="M13 9.5H19C20.1046 9.5 21 10.3954 21 11.5C21 12.6046 20.1046 13.5 19 13.5H13V9.5Z"
          fill="#07080C"
          stroke="#242731"
          strokeWidth="0.75"
        />

        {/* Diagonal dynamic leg (Dark graphite #111318) */}
        <path
          d="M16 16.5L24.5 27H18L13 18.5H16Z"
          fill="#161820"
          stroke="#454A53"
          strokeWidth="0.75"
        />

        {/* Diagonal leg lead edge chamfer (Silver #8A909A) */}
        <path
          d="M16 16.5L24.5 27H23L14.5 16.5H16Z"
          fill="#8A909A"
          opacity="0.6"
        />

        {/* Signature Lime Accent apex bevel */}
        <path
          d="M13 5L15 2.5H9L7 5H13Z"
          fill="#C8FF3D"
        />

        {/* Machine Optical Sensor / Pivot dot (Signature lime) */}
        <circle cx="24.5" cy="26" r="1.5" fill="#C8FF3D" />
      </svg>
    </div>
  );
};
