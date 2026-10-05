"use client";

import React, { useEffect } from "react";
import { LandingNavbar } from "@/components/informational/LandingNavbar";
import { HeroSection } from "@/components/informational/HeroSection";
import { PlatformPreview } from "@/components/informational/PlatformPreview";
import { HowItWorksSection } from "@/components/informational/HowItWorksSection";
import { WhyRicozSection } from "@/components/informational/WhyRicozSection";
import { WhoIsItForSection } from "@/components/informational/WhoIsItForSection";
import { PlatformFeaturesSection } from "@/components/informational/PlatformFeaturesSection";
import { ProductShowcaseSection } from "@/components/informational/ProductShowcaseSection";
import { TrustValueSection } from "@/components/informational/TrustValueSection";
import { FAQSection } from "@/components/informational/FAQSection";
import { FinalCTASection } from "@/components/informational/FinalCTASection";
import { LandingFooter } from "@/components/informational/LandingFooter";

export default function HomePage() {
  useEffect(() => {
    // Ensure clean light page rendering on the informational landing page
    document.documentElement.style.backgroundColor = "#FFFFFF";
    document.documentElement.style.color = "#0F172A";
    document.body.style.backgroundColor = "#FFFFFF";
    document.body.style.color = "#0F172A";

    return () => {
      // Revert to dark theme when navigating to other existing RICOZ routes
      document.documentElement.style.backgroundColor = "#07080C";
      document.documentElement.style.color = "#F5F5F0";
      document.body.style.backgroundColor = "#07080C";
      document.body.style.color = "#F5F5F0";
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-red-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* 1. STICKY TOP NAVIGATION */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <HeroSection />

        {/* 3. PRODUCT VISUAL / PLATFORM PREVIEW */}
        <PlatformPreview />

        {/* 4. HOW RICOZ WORKS (4-STEP ONBOARDING PROGRESSION) */}
        <HowItWorksSection />

        {/* 5. WHY RICOZ (6 BENEFIT CARDS) */}
        <WhyRicozSection />

        {/* 6. WHO RICOZ IS FOR (3 AUDIENCE PERSONAS) */}
        <WhoIsItForSection />

        {/* 7. PLATFORM FEATURES (3 MAJOR FEATURE CARDS) */}
        <PlatformFeaturesSection />

        {/* 8. REAL PRODUCT SHOWCASE ("SEE RICOZ IN ACTION" ALTERNATING ROWS) */}
        <ProductShowcaseSection />

        {/* 9. TRUST / VALUE STRIP & CONFIDENCE SECTION */}
        <TrustValueSection />

        {/* 10. FAQ SECTION (6 ACCORDIONS) */}
        <FAQSection />

        {/* 11. FINAL HIGH-IMPACT CTA */}
        <FinalCTASection />
      </main>

      {/* 12. CLEAN SAAS FOOTER */}
      <LandingFooter />
    </div>
  );
}
