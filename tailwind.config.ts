import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base Canva Warm Editorial System
        background: "#FBF6F0", // Warm Ivory
        "background-secondary": "#FFF9F3", // Light Cream
        foreground: "#38241F", // Deep Espresso Brown
        surface: {
          DEFAULT: "#FFFFFF", // Pure Card White
          muted: "#FFF9F3", // Light Cream
          elevated: "#FFFFFF",
          card: "#FFFFFF",
          border: "#E6D8CF", // Subtle Warm Border
          borderLight: "#F0E7E0",
          borderDark: "#D8C5B8",
        },
        brand: {
          DEFAULT: "#38241F", // Espresso Brown primary text
          secondary: "#76665F", // Muted body text
          muted: "#9E8E87", // Light muted caption
          espresso: "#38241F",
        },
        accent: {
          DEFAULT: "#541719", // Deep Burgundy branding and primary actions
          hover: "#3E1012",
          light: "#702225",
          muted: "rgba(84, 23, 25, 0.08)",
          border: "rgba(84, 23, 25, 0.2)",
          glow: "rgba(84, 23, 25, 0.15)",
        },
        ivory: {
          DEFAULT: "#FBF6F0",
          50: "#FFFCF9",
          100: "#FBF6F0",
          200: "#F5EDE4",
          300: "#EFE3D6",
          400: "#E6D8CF",
        },
        cream: {
          DEFAULT: "#FFF9F3",
          50: "#FFFFFF",
          100: "#FFF9F3",
          200: "#FAF2EA",
          300: "#F4E8DC",
        },
        beige: {
          DEFAULT: "#E0CEC3",
          50: "#F8F4F1",
          100: "#EFE5DE",
          200: "#E0CEC3",
          300: "#D3BCB0",
          400: "#C4A89A",
        },
        taupe: {
          DEFAULT: "#C7A99A",
          50: "#F5EFEA",
          100: "#E8DCD4",
          200: "#C7A99A",
          300: "#B39281",
          400: "#9C7968",
        },
        burgundy: {
          DEFAULT: "#541719",
          50: "#FBF2F2",
          100: "#F4DFE0",
          200: "#E3B6B9",
          300: "#C77B80",
          400: "#9A3B40",
          500: "#702225",
          600: "#541719",
          700: "#3E1012",
          800: "#2B0B0C",
          900: "#1A0607",
        },
        espresso: {
          DEFAULT: "#38241F",
          muted: "#76665F",
          light: "#5A423B",
          dark: "#261714",
        },
      },
      fontFamily: {
        serif: [
          "Playfair Display",
          "DM Serif Display",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        sans: [
          "DM Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.03em",
        normal: "0em",
        wide: "0.03em",
        wider: "0.08em",
        widest: "0.15em",
        editorial: "0.2em",
      },
      boxShadow: {
        subtle: "0 2px 10px -2px rgba(56, 36, 31, 0.05)",
        card: "0 8px 30px -4px rgba(56, 36, 31, 0.06)",
        hover: "0 14px 40px -6px rgba(56, 36, 31, 0.1)",
        burgundy: "0 8px 25px -4px rgba(84, 23, 25, 0.25)",
        surface: "0 4px 20px -2px rgba(56, 36, 31, 0.06)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;