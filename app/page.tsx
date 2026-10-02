import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { DesignerCard } from "@/components/DesignerCard";
import { HeroScene } from "@/components/three/HeroScene";
import { MatchingVisual } from "@/components/matching/MatchingVisual";
import { PortfolioVisual } from "@/components/PortfolioVisual";
import { Reveal } from "@/components/animations/Reveal";
import { BrandMark } from "@/components/brand/BrandMark";
import { CreativeTalentMotion } from "@/components/CreativeTalentMotion";
import { MOCK_DESIGNERS } from "@/data/mockData";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Layers,
  Sparkles,
  Type,
  TrendingUp,
  Eye,
  Hexagon,
} from "lucide-react";

export default function HomePage() {
  const featuredDesigners = MOCK_DESIGNERS.filter((d) => d.featured).slice(0, 6);

  const problems = [
    {
      num: "01",
      title: "Finding senior creative talent",
      desc: "Traditional agency RFPs waste months on pitch presentations, only to hand delivery to junior account executives. Finding genuine studio principals on freelance platforms means sifting through unverified noise.",
    },
    {
      num: "02",
      title: "Finding the right creative fit",
      desc: "A fintech infrastructure rebrand requires radically different visual rigor than a boutique hospitality flag. True compatibility requires matching on sector history, typographic craftsmanship, and aesthetic philosophy.",
    },
    {
      num: "03",
      title: "Turning a rebrand into a coherent system",
      desc: "Rebranding is not a logo refresh. It demands monolithic design tokens, custom variable typefaces, tactile packaging, and executive verbal tone that survive enterprise scaling across thousands of touchpoints.",
    },
  ];

  const portfolioHighlights = [
    {
      title: "Northstar Cloud Global Identity",
      client: "Northstar Technologies",
      industry: "Technology",
      designer: "Alex Morgan (Creative Director)",
      palette: ["#101218", "#181B24", "#C8FF3D", "#F5F5F0"],
      impact: "+64% enterprise perception rating post-acquisition",
      services: ["Creative Direction", "Design Systems", "Typography"],
    },
    {
      title: "Synthetix Genomic Intelligence",
      client: "Synthetix Bio",
      industry: "Healthcare",
      designer: "Elena Rostova (Brand Identity Designer)",
      palette: ["#0E0E14", "#181824", "#8B5CF6", "#F5F5F0"],
      impact: "$120M Series C repositioning & visual architecture",
      services: ["Visual Identity", "Algorithmic Geometry", "Guidelines"],
    },
    {
      title: "Atelier House Hospitality Typeface",
      client: "Atelier House",
      industry: "Hospitality",
      designer: "Sophie Chen (Typography Specialist)",
      palette: ["#141210", "#26221C", "#C8FF3D", "#F5F5F0"],
      impact: "Proprietary 6-weight optical variable font family",
      services: ["Custom Typography", "Lettering", "Wayfinding"],
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Define the rebrand",
      desc: "Build a structured project brief establishing post-M&A goals, domain sectors, brand personality attributes, budget tiers, and target timelines.",
    },
    {
      num: "02",
      title: "Meet your creative team",
      desc: "Evaluate senior Creative Directors matched across 7 weighted dimensions. Compare case studies, previous enterprise clients, and verified bandwidth.",
    },
    {
      num: "03",
      title: "Build the new identity",
      desc: "Kick off direct collaboration under enterprise mutual NDAs. Receive comprehensive brand systems, custom typefaces, and scalable design manuals.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand relative selection:bg-accent selection:text-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================================
            SECTION 01: HERO (3D Letter R + Powerful Editorial Headline)
        ========================================================================= */}
        <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center pt-8 pb-16 lg:py-20 border-b border-surface-border overflow-hidden bg-hero-glow">
          {/* Subtle architectural grid texture */}
          <div className="absolute inset-0 bg-subtle-grid pointer-events-none opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
              {/* LEFT: Powerful Editorial Headline & Copy (approx 50-55%) */}
              <div className="lg:col-span-6 xl:col-span-7 space-y-6 sm:space-y-8">
                <Reveal>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-surface-border text-xs font-mono tracking-widest text-brand-secondary uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    CREATIVE TALENT / REBRANDING
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <h1 className="text-[clamp(42px,5.6vw,84px)] font-extrabold tracking-tight text-white leading-[1.03] uppercase font-sans">
                    REBRANDING<br />
                    NEEDS<br />
                    <span className="text-accent">
                      DIRECTION.
                    </span>
                  </h1>
                </Reveal>

                <Reveal delay={0.2}>
                  <p className="text-base sm:text-lg text-brand-secondary max-w-[650px] leading-[1.6]">
                    Connect your company with senior creative directors, brand identity designers and typography specialists for high-impact rebranding projects.
                  </p>
                </Reveal>

                <Reveal delay={0.3}>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                    <Button
                      variant="accent"
                      size="lg"
                      href="/dashboard/company/projects/new"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Find Creative Talent
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      href="/dashboard/company/projects/new"
                    >
                      Start a Rebranding Project
                    </Button>
                  </div>
                </Reveal>

                <Reveal delay={0.4}>
                  <div className="pt-6 border-t border-surface-border flex flex-wrap items-center gap-6 text-xs text-brand-muted font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>Senior Creative Directors Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>Deterministic Match Engine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>Standard Enterprise NDA</span>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* RIGHT: Large 3D Letter R Model (approx 45-50%) */}
              <div className="lg:col-span-6 xl:col-span-5 relative w-full flex items-center justify-center">
                <HeroScene />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 02: THE PROBLEM (Minimal Animated Typography)
        ========================================================================= */}
        <section className="py-20 lg:py-28 border-b border-surface-border bg-background-secondary relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-3xl mb-16">
                <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-3">
                  THE CRITICAL GAP
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Great brands need great creative direction.
                </h2>
                <p className="mt-4 text-sm sm:text-base text-brand-secondary leading-relaxed">
                  Companies fail rebranding when treated as an ad-hoc visual skin. Ricoz solves the three structural bottlenecks of corporate transformation.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {problems.map((prob, idx) => (
                <Reveal key={prob.num} delay={0.15 * idx}>
                  <div className="bg-surface border border-surface-border rounded-xl p-8 hover:border-surface-borderLight transition-all duration-300 h-full flex flex-col justify-between group">
                    <div>
                      <span className="font-mono text-3xl font-extrabold text-accent block mb-4">
                        {prob.num}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-3 tracking-tight group-hover:text-accent transition-colors">
                        {prob.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                        {prob.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-surface-border text-[10px] font-mono text-brand-muted uppercase tracking-widest">
                      CHALLENGE // 0{idx + 1}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 02.5: CREATIVE TALENT IN MOTION (Scroll Interaction Showcase)
        ========================================================================= */}
        <CreativeTalentMotion />

        {/* =========================================================================
            SECTION 03: DISCOVER TALENT (Premium Designer Cards)
        ========================================================================= */}
        <section className="py-20 lg:py-28 border-b border-surface-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
                    CURATED ROSTER
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight uppercase">
                    THE PEOPLE BEHIND<br />THE BEST BRANDS.
                  </h2>
                </div>
                <Button variant="outline" href="/designers" size="md">
                  Explore All Specialists ({MOCK_DESIGNERS.length})
                </Button>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredDesigners.map((designer, idx) => (
                <Reveal key={designer.id} delay={0.1 * idx}>
                  <DesignerCard designer={designer} showLargeVisual={true} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 04: MATCHING (Interactive Visual Flow)
        ========================================================================= */}
        <section className="py-20 lg:py-28 border-b border-surface-border bg-background-secondary relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-3xl mb-12">
                <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-3">
                  COMPATIBILITY ENGINE
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Algorithmic precision for creative chemistry.
                </h2>
                <p className="mt-4 text-sm sm:text-base text-brand-secondary leading-relaxed">
                  We measure 7 weighted dimensions so enterprise teams can cut through superficial portfolios and partner with Creative Directors calibrated to their exact sector and scale.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <MatchingVisual />
            </Reveal>
          </div>
        </section>

        {/* =========================================================================
            SECTION 05: CREATIVE WORK (Immersive Portfolio Section)
        ========================================================================= */}
        <section className="py-20 lg:py-28 border-b border-surface-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
                    DELIVERED REBRANDS
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    Proof in the work.
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-brand-secondary max-w-md font-mono">
                  Explore transformational case studies delivered across technology, biotechnology, and luxury hospitality.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {portfolioHighlights.map((item, idx) => (
                <Reveal key={item.title} delay={0.15 * idx}>
                  <div className="bg-surface border border-surface-border rounded-xl overflow-hidden group hover:border-surface-borderLight transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <PortfolioVisual
                        title={item.title}
                        client={item.client}
                        industry={item.industry}
                        palette={item.palette}
                        aspectRatio="aspect-[16/10]"
                        className="w-full h-full transform transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-brand-muted">
                          <span>{item.client}</span>
                          <span className="text-accent">{item.industry}</span>
                        </div>
                        <h3 className="font-bold text-lg text-white group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-brand-secondary font-mono">
                          Lead: {item.designer}
                        </p>
                        <div className="p-3 bg-surface-elevated rounded-lg border border-surface-border text-xs text-brand">
                          <span className="text-[10px] font-mono uppercase text-accent block mb-1">
                            Measured Impact
                          </span>
                          {item.impact}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-surface-muted border-t border-surface-border flex items-center justify-between text-xs">
                      <div className="flex flex-wrap gap-1">
                        {item.services.map((s) => (
                          <span key={s} className="text-[10px] font-mono text-brand-muted">
                            #{s.replace(/\s+/g, "")}
                          </span>
                        ))}
                      </div>
                      <Link
                        href="/designers"
                        className="text-brand-secondary hover:text-accent font-mono text-[11px] flex items-center gap-1"
                      >
                        <span>Case study</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 06: HOW IT WORKS (3 Steps with Animated Numbers)
        ========================================================================= */}
        <section className="py-20 lg:py-28 border-b border-surface-border bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-2xl mx-auto text-center mb-16">
                <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold block mb-3">
                  ENTERPRISE PROTOCOL
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  How Ricoz Works
                </h2>
                <p className="mt-3 text-sm text-brand-secondary">
                  A disciplined 3-stage pathway to senior creative leadership.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((st, idx) => (
                <Reveal key={st.num} delay={0.15 * idx}>
                  <div className="bg-surface border border-surface-border rounded-xl p-8 h-full flex flex-col justify-between relative group hover:border-accent/40 transition-all duration-300">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-mono text-4xl font-extrabold text-white group-hover:text-accent transition-colors">
                          {st.num}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">
                          STAGE // 0{idx + 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {st.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                        {st.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-surface-border flex items-center justify-between text-xs font-mono text-brand-muted">
                      <span>VERIFIED WORKFLOW</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-14 text-center">
              <Button href="/how-it-works" variant="outline" size="md">
                Read Full Methodology & Timelines
              </Button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 07: FINAL CTA (Large Typography + 3D Letter R Integration)
        ========================================================================= */}
        <section className="py-24 lg:py-32 relative bg-surface overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left: Large Typography & CTA */}
              <div className="lg:col-span-8 space-y-6">
                <Reveal>
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-accent uppercase tracking-widest font-semibold">
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    ENTERPRISE ONBOARDING ACTIVE
                  </span>
                </Reveal>

                <Reveal delay={0.1}>
                  <h2 className="text-[clamp(36px,5vw,72px)] font-extrabold tracking-tight text-white uppercase leading-[1.04] font-sans">
                    YOUR NEXT<br />
                    IDENTITY<br />
                    <span className="text-accent">STARTS HERE.</span>
                  </h2>
                </Reveal>

                <Reveal delay={0.2}>
                  <p className="text-sm sm:text-base text-brand-secondary max-w-xl leading-relaxed">
                    Define your rebranding brief in under 5 minutes and receive curated, deterministic matches with senior Creative Directors.
                  </p>
                </Reveal>

                <Reveal delay={0.3}>
                  <div className="pt-2 flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="accent"
                      size="lg"
                      href="/dashboard/company/projects/new"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      START A REBRANDING PROJECT
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      href="/designers"
                    >
                      Explore Specialists
                    </Button>
                  </div>
                </Reveal>
              </div>

              {/* Right: Architectural 3D Letter R Mark Accent */}
              <div className="lg:col-span-4 flex items-center justify-center">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center p-8 bg-background-secondary/80 border border-surface-border rounded-2xl shadow-surface backdrop-blur-md">
                  <div className="absolute inset-0 bg-radial-gradient from-accent-glow/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
                  <BrandMark size={140} withGlow className="relative z-10 transform hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-[10px] text-brand-muted tracking-widest uppercase">
                    RICOZ // 3D ICONOGRAPHY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
