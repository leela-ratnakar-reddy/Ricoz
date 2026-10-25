import React from "react";

interface BrandMarkProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
  variant?: "dark" | "light" | "editorial";
  accentColor?: "burgundy" | "lime" | "red";
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 28,
  className = "",
  withGlow = false,
  variant = "editorial",
  accentColor = "burgundy",
}) => {
  // Deep burgundy is the primary signature accent for the Canva luxury theme
  const primaryAccent = accentColor === "burgundy" ? "#541719" : accentColor === "red" ? "#541719" : "#541719";
  const glowColor = "rgba(84, 23, 25, 0.2)";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {withGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-30 pointer-events-none"
          style={{ backgroundColor: glowColor }}
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
        {/* Editorial Luxury Facets: Deep Burgundy, Rich Espresso, Champagne Taupe */}
        
        {/* Main stem vertical facet (Rich espresso #38241F with taupe border) */}
        <path
          d="M7 5H13V27H7V5Z"
          fill="#38241F"
          stroke="#C7A99A"
          strokeWidth="0.75"
        />

        {/* Stem Left Highlight Edge (Champagne taupe #E0CEC3) */}
        <path
          d="M7 5H8.5V27H7V5Z"
          fill="#E0CEC3"
        />

        {/* Upper bowl outer curve (Deep Burgundy #541719 with delicate border) */}
        <path
          d="M13 5H19.5C23.0899 5 26 7.91015 26 11.5C26 15.0899 23.0899 18 19.5 18H13V5Z"
          fill="#541719"
          stroke="#C7A99A"
          strokeWidth="0.75"
        />

        {/* Upper bowl inner counter (Warm ivory #FBF6F0 recessed area) */}
        <path
          d="M13 9.5H19C20.1046 9.5 21 10.3954 21 11.5C21 12.6046 20.1046 13.5 19 13.5H13V9.5Z"
          fill="#FBF6F0"
          stroke="#E6D8CF"
          strokeWidth="0.75"
        />

        {/* Diagonal dynamic leg (Espresso #38241F) */}
        <path
          d="M16 16.5L24.5 27H18L13 18.5H16Z"
          fill="#38241F"
          stroke="#C7A99A"
          strokeWidth="0.75"
        />

        {/* Diagonal leg lead edge chamfer (Taupe #C7A99A) */}
        <path
          d="M16 16.5L24.5 27H23L14.5 16.5H16Z"
          fill="#C7A99A"
          opacity="0.8"
        />

        {/* Signature Accent apex bevel (Burgundy #702225) */}
        <path
          d="M13 5L15 2.5H9L7 5H13Z"
          fill="#702225"
        />

        {/* Signature Editorial Pearl Dot */}
        <circle cx="24.5" cy="26" r="1.5" fill={primaryAccent} />
      </svg>
    </div>
  );
};