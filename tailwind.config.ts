import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07080C",
        "background-secondary": "#0B0D12",
        foreground: "#F5F5F0",
        surface: {
          DEFAULT: "#101218",
          muted: "#0B0D12",
          elevated: "#151820",
          card: "#12141C",
          border: "#242731",
          borderLight: "#2C303D",
        },
        brand: {
          DEFAULT: "#F5F5F0",
          secondary: "#A0A3AD",
          muted: "#70747F",
        },
        accent: {
          DEFAULT: "#C8FF3D", // Primary Lime Accent
          hover: "#B5F228",
          muted: "rgba(200, 255, 61, 0.12)",
          border: "rgba(200, 255, 61, 0.3)",
          glow: "rgba(200, 255, 61, 0.25)",
        },
        violet: {
          DEFAULT: "#8B5CF6", // Secondary Accent
          muted: "rgba(139, 92, 246, 0.12)",
          border: "rgba(139, 92, 246, 0.3)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.03em",
        wide: "0.03em",
        wider: "0.08em",
        widest: "0.15em",
      },
      boxShadow: {
        glow: "0 0 35px -5px rgba(200, 255, 61, 0.2)",
        "glow-violet": "0 0 35px -5px rgba(139, 92, 246, 0.25)",
        surface: "0 4px 20px -2px rgba(0, 0, 0, 0.7)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
