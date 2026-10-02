import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { HeroEcosystem } from "@/components/hero/HeroEcosystem";
import { TypographyTransition } from "@/components/landing/TypographyTransition";
import { TalentStream } from "@/components/landing/TalentStream";
import { VisualMatchingCanvas } from "@/components/landing/VisualMatchingCanvas";
import { TeamFormationCanvas } from "@/components/landing/TeamFormationCanvas";
import { CollaborationFlow } from "@/components/landing/CollaborationFlow";
import { CinematicCTA } from "@/components/landing/CinematicCTA";
import { Reveal } from "@/components/animations/Reveal";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-brand relative selection:bg-accent selection:text-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================================
            HERO: Open Interactive Creative-Talent Canvas (No Giant Boxes)
        ========================================================================= */}
        <section className="relative min-h-[88vh] lg:min-h-[94vh] flex items-center justify-center pt-8 pb-16 lg:py-24 border-b border-white/5 overflow-hidden">
          {/* Extremely Subtle Ambient Glow & Depth (No harsh grid lines) */}
          <div className="absolute inset-0 bg-hero-glow pointer-events-none opacity-60" />
          <div className="absolute inset-0 bg-subtle-grid pointer-events-none opacity-15" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* LEFT: Short, Powerful Headline + Supporting Text + CTAs */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-6 sm:space-y-7">
                <Reveal>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md text-xs font-mono tracking-widest text-brand-secondary uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    RICOZ // TALENT INTELLIGENCE
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <h1 className="text-[clamp(32px,4.2vw,56px)] font-black tracking-tight text-white leading-[1.08] uppercase font-sans">
                    FIND THE RIGHT<br />
                    CREATIVE TALENT.
                    <span className="block mt-2 sm:mt-3 text-[clamp(20px,2.4vw,32px)] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent to-accent-hover">
                      FOR YOUR NEXT BIG IDEA.
                    </span>
                  </h1>
                </Reveal>

                <Reveal delay={0.2}>
                  <p className="text-sm sm:text-base text-brand-secondary max-w-[480px] leading-relaxed">
                    Discover creative professionals, match the right talent to your project, and build the team you need to bring your ideas to life.
                  </p>
                </Reveal>

                <Reveal delay={0.3}>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                    <Link
                      href="/designers"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-accent-hover transition-colors shadow-glow"
                    >
                      <span>Find Creative Talent</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/dashboard/company/projects/new"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/25 font-mono text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                      <span>Start a Project</span>
                    </Link>
                  </div>
                </Reveal>

                <Reveal delay={0.4}>
                  <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-6 text-xs text-brand-muted font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>Curated Studio Principals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>Deterministic Match Engine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>Standard Mutual NDA</span>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* RIGHT: Floating Open Creative Talent Ecosystem (Zero Box Containers) */}
              <div className="lg:col-span-7 xl:col-span-7 relative w-full flex items-center justify-center">
                <Reveal delay={0.2}>
                  <HeroEcosystem />
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            TYPOGRAPHY TRANSITION: "Great work starts with the right people."
        ========================================================================= */}
        <TypographyTransition />

        {/* =========================================================================
            SECTION 01: DISCOVER ("Find creative talent that fits your project.")
            Flowing River of Talent Profiles (No rigid 3x2 grid!)
        ========================================================================= */}
        <section className="py-24 sm:py-32 border-b border-white/5 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
                    01 — DISCOVER
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight uppercase font-sans">
                    Find creative talent<br />
                    <span className="text-accent">that fits your project.</span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-brand-secondary max-w-xl leading-relaxed">
                    A flowing network of senior Creative Directors, Brand Identity Designers, UI/UX Architects, and Motion Specialists vetted from world-renowned design practices.
                  </p>
                </div>

                <Link
                  href="/designers"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20 font-mono text-xs font-semibold transition-all shrink-0"
                >
                  <span>Explore All Specialists</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Flowing Horizontal Stream */}
          <TalentStream />
        </section>

        {/* =========================================================================
            SECTION 02: MATCH ("Match skills, experience and creative expertise.")
            Visual Requirement-to-Talent Constellation
        ========================================================================= */}
        <section className="py-24 sm:py-32 border-b border-white/5 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-3xl mb-12">
                <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
                  02 — MATCH
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans uppercase">
                  Match skills, experience<br />
                  <span className="text-accent">and creative expertise.</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-brand-secondary leading-relaxed">
                  We replace superficial keyword searches with deterministic multi-dimensional matching: sector history, aesthetic philosophy, typographic craftsmanship, and enterprise scale compatibility.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <VisualMatchingCanvas />
            </Reveal>
          </div>
        </section>

        {/* =========================================================================
            SECTION 03: SHORTLIST ("Build your ideal creative team.")
            Open, Spacious Team Formation Canvas
        ========================================================================= */}
        <section className="py-24 sm:py-32 border-b border-white/5 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-3xl mb-12">
                <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
                  03 — SHORTLIST
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans uppercase">
                  Build your ideal<br />
                  <span className="text-accent">creative team.</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-brand-secondary leading-relaxed">
                  Assemble high-impact, multidisciplinary creative pods in minutes. Select specialists and watch your dedicated project team form in real-time.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <TeamFormationCanvas />
            </Reveal>
          </div>
        </section>

        {/* =========================================================================
            SECTION 04: COLLABORATE ("Turn the right talent into meaningful work.")
            Visual Flow (IDEA -> TEAM -> COLLABORATION -> CREATIVE OUTPUT)
        ========================================================================= */}
        <section className="py-24 sm:py-32 border-b border-white/5 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-3xl mb-14">
                <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
                  04 — COLLABORATE
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans uppercase">
                  Turn the right talent<br />
                  <span className="text-accent">into meaningful work.</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-brand-secondary leading-relaxed">
                  From initial strategic brief to monolithic design token delivery, Ricoz provides the enterprise governance, legal safety, and escrow infrastructure for seamless creative execution.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <CollaborationFlow />
            </Reveal>
          </div>
        </section>

        {/* =========================================================================
            FINAL CTA: Large Cinematic CTA with Ambient Glow
        ========================================================================= */}
        <CinematicCTA />
      </main>

      <Footer />
    </div>
  );
}
