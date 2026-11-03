"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/informational/HeroSection";
import { HowItWorksSection } from "@/components/informational/HowItWorksSection";
import { InteractiveDisciplineFilter } from "@/components/informational/InteractiveDisciplineFilter";
import { BrandArtifactsShowcase } from "@/components/informational/BrandArtifactsShowcase";
import { PlatformPreview } from "@/components/informational/PlatformPreview";
import { WhyRicozSection } from "@/components/informational/WhyRicozSection";
import { WhoIsItForSection } from "@/components/informational/WhoIsItForSection";
import { FinalCTASection } from "@/components/informational/FinalCTASection";
import { Footer } from "@/components/Footer";
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
      {/* 1. GLOBAL NAVIGATION */}
      <Navbar />

      <main className="flex-1">
        {/* SECTION 1: HERO SECTION WITH CURATED TALENT COMPOSITION */}
        <HeroSection onOpenBriefing={handleOpenBriefing} />

        {/* SECTION 2: HOW RICOZ WORKS (4-STEP PROGRESSION) */}
        <HowItWorksSection />

        {/* SECTION 3: EXPLORE CURATED TALENT & DISCIPLINE FILTER */}
        <InteractiveDisciplineFilter />

        {/* SECTION 4: PRODUCTION ARTIFACTS SHIPPED ACROSS MANDATES */}
        <BrandArtifactsShowcase />

        {/* SECTION 5: AI MATCHER 5-SPECIALIST SQUAD PREVIEW */}
        <PlatformPreview />

        {/* SECTION 6: WHY RICOZ ASYMMETRIC BENTO GRID */}
        <WhyRicozSection />

        {/* SECTION 7: FOR COMPANIES AND CREATIVES */}
        <WhoIsItForSection />

        {/* SECTION 8: FINAL INVITATION / HIGH-CONVERSION CTA */}
        <FinalCTASection onOpenBriefing={handleOpenBriefing} />
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />

      {/* CONCIERGE BRIEFING MODAL */}
      <ConciergeBriefingModal
        isOpen={briefingModalOpen}
        onClose={handleCloseBriefing}
      />
    </div>
  );
}
