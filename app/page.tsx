"use client";

import React, { useState } from "react";
import { LandingNavbar } from "@/components/informational/LandingNavbar";
import { HeroSection } from "@/components/informational/HeroSection";
import { BrandArtifactsShowcase } from "@/components/informational/BrandArtifactsShowcase";
import { PlatformPreview } from "@/components/informational/PlatformPreview";
import { InteractiveDisciplineFilter } from "@/components/informational/InteractiveDisciplineFilter";
import { HowItWorksSection } from "@/components/informational/HowItWorksSection";
import { WhyRicozSection } from "@/components/informational/WhyRicozSection";
import { MandateEstimator } from "@/components/informational/MandateEstimator";
import { WhoIsItForSection } from "@/components/informational/WhoIsItForSection";
import { PlatformFeaturesSection } from "@/components/informational/PlatformFeaturesSection";
import { ProductShowcaseSection } from "@/components/informational/ProductShowcaseSection";
import { TrustValueSection } from "@/components/informational/TrustValueSection";
import { FAQSection } from "@/components/informational/FAQSection";
import { FinalCTASection } from "@/components/informational/FinalCTASection";
import { LandingFooter } from "@/components/informational/LandingFooter";
import { ConciergeBriefingModal } from "@/components/informational/ConciergeBriefingModal";

export default function HomePage() {
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);

  const handleOpenBriefing = () => {
    setBriefingModalOpen(true);
  };

  const handleCloseBriefing = () => {
    setBriefingModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand selection:bg-accent selection:text-cream font-sans antialiased overflow-x-hidden">
      {/* 1. STICKY TOP NAVIGATION */}
      <LandingNavbar onOpenBriefing={handleOpenBriefing} />

      <main className="flex-1">
        {/* 2. HERO SECTION WITH CURATED TALENT COMPOSITION */}
        <HeroSection onOpenBriefing={handleOpenBriefing} />

        {/* 3. BRAND ARTIFACTS & DELIVERABLE SPECIMENS */}
        <BrandArtifactsShowcase />

        {/* 4. PRODUCT VISUAL / PLATFORM PREVIEW FRAME */}
        <PlatformPreview />

        {/* 5. INTERACTIVE TALENT SEARCH & DISCIPLINE FILTER */}
        <InteractiveDisciplineFilter />

        {/* 6. HOW RICOZ WORKS (4-STEP ONBOARDING PROGRESSION) */}
        <HowItWorksSection />

        {/* 7. WHY RICOZ ASYMMETRIC BENTO GRID */}
        <WhyRicozSection />

        {/* 8. INTERACTIVE SCOPE & MANDATE ESTIMATOR */}
        <MandateEstimator onOpenBriefing={handleOpenBriefing} />

        {/* 9. WHO RICOZ IS FOR (AUDIENCE ALIGNMENT) */}
        <WhoIsItForSection />

        {/* 10. PRODUCT / PLATFORM FEATURES SHOWCASE */}
        <PlatformFeaturesSection />

        {/* 11. TALENT SPOTLIGHT & VERIFIED ROLES */}
        <ProductShowcaseSection />

        {/* 12. TRUST, QUALITY & ESCROW GUARANTEES */}
        <TrustValueSection />

        {/* 13. FREQUENTLY ASKED QUESTIONS ACCORDION */}
        <FAQSection />

        {/* 14. FINAL INVITATION / HIGH-CONVERSION CTA */}
        <FinalCTASection onOpenBriefing={handleOpenBriefing} />
      </main>

      {/* 15. MULTI-COLUMN AGENCY FOOTER */}
      <LandingFooter onOpenBriefing={handleOpenBriefing} />

      {/* CONCIERGE BRIEFING MODAL */}
      <ConciergeBriefingModal
        isOpen={briefingModalOpen}
        onClose={handleCloseBriefing}
      />
    </div>
  );
}