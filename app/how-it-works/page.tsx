import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { EditorialStar, ContourFlourish } from "@/components/ui/EditorialDecorations";

export default function HowItWorksPage() {
  const detailedSteps = [
    {
      num: "01",
      title: "Define your creative mandate",
      subtitle: "Structured brief creation",
      desc: "Enterprise rebrands fail when objectives are vague. Our project architecture tool prompts key executives on post-M&A goals, international expansion needs, market differentiation, and required disciplines.",
      points: [
        "Select required senior disciplines (Creative Direction, Bespoke Type, Systems)",
        "Establish timeline, budget tiers, and target enterprise audiences",
        "Define aesthetic benchmarks and brand personality directives",
      ],
      time: "5-10 minutes",
    },
    {
      num: "02",
      title: "Deterministic talent matching",
      subtitle: "Multi-dimensional algorithmic alignment",
      desc: "Our matching engine evaluates over 7 weighted dimensions: domain sector history, senior years of practice, visual sensibility, budget tier, and verified immediate bandwidth.",
      points: [
        "Weighted scoring with granular factor breakdowns",
        "No opaque black boxes; clear transparency into why each specialist fits",
        "Direct sector track records in B2B tech, finance, robotics, and luxury",
      ],
      time: "Instant recommendation",
    },
    {
      num: "03",
      title: "Portfolio-first review & shortlisting",
      subtitle: "Evaluate verified enterprise case studies",
      desc: "Compare proven Creative Directors without wading through junior portfolios or generic mockups. Review tangible client case studies, challenges overcome, and commercial impact.",
      points: [
        "Curate bespoke team rosters across multiple disciplines",
        "Save and compare candidates with executive colleagues",
        "Access structured verified career timelines and studio tenures",
      ],
      time: "24-48 hours",
    },
    {
      num: "04",
      title: "Direct engagement & project kickoff",
      subtitle: "Streamlined contracts & mutual confidentiality",
      desc: "Initiate direct conversations with shortlisted Creative Directors. Refine scope, establish weekly design milestones, and seamlessly transition into high-impact execution.",
      points: [
        "Built-in enterprise mutual NDA and IP assignment protections",
        "Direct communications without platform lock-in friction",
        "Milestone visibility and ongoing brand governance support",
      ],
      time: "1-2 weeks to kickoff",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 relative overflow-hidden">
        <ContourFlourish className="absolute -top-16 -right-16 w-80 h-80 text-taupe/15 pointer-events-none" />
        <ContourFlourish className="absolute top-1/2 -left-20 w-72 h-72 text-taupe/15 pointer-events-none rotate-90" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* HERO */}
          <div className="max-w-3xl mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-[#FFF9F3] text-accent border border-[#E6D8CF] shadow-xs">
              <EditorialStar size={13} className="text-accent" />
              <span>METHODOLOGY & OPERATIONAL DISCIPLINE</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-espresso leading-[1.12]">
              A disciplined pathway to <span className="italic text-accent">creative excellence.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed font-sans">
              Traditional branding agencies charge massive overhead for junior execution. Freelance sites offer unverified clutter. RICOZ delivers direct access to elite Creative Directors calibrated for high-impact enterprise mandates.
            </p>
          </div>

          {/* DETAILED STEPS */}
          <div className="space-y-6">
            {detailedSteps.map((step) => (
              <div
                key={step.num}
                className="bg-white border border-[#E6D8CF] rounded-2xl p-8 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-start hover:border-accent/40 transition-all group"
              >
                <div className="lg:col-span-3 space-y-2">
                  <div className="font-serif text-3xl sm:text-4xl font-normal text-accent">
                    {step.num}
                  </div>
                  <span className="text-xs font-mono text-taupe uppercase tracking-wider block font-semibold">
                    {step.subtitle}
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9F3] text-espresso text-xs font-mono border border-[#E6D8CF]">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>{step.time}</span>
                  </div>
                </div>

                <div className="lg:col-span-9 space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-espresso tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {step.desc}
                  </p>

                  <div className="pt-2 space-y-2">
                    {step.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-espresso">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* VETTING ACCORD SECTION */}
          <div className="mt-16 bg-espresso text-[#FFF9F3] border border-[#38241F] rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <ContourFlourish className="absolute -right-16 -bottom-16 w-80 h-80 text-white/5 pointer-events-none" />

            <div className="max-w-3xl space-y-4 relative z-10">
              <span className="font-mono text-xs font-medium uppercase text-taupe tracking-wider">
                CURATION STANDARDS & QUALITY ASSURANCE
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#FFF9F3] tracking-tight">
                How we vet creative professionals
              </h2>
              <p className="text-sm text-[#FFF9F3]/80 leading-relaxed font-sans">
                Fewer than 4% of applicant creative directors are admitted to the Ricoz network. Every professional undergoes rigorous portfolio case study analysis, executive client references, and deep-dive technical evaluations into design system scalability.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/start-project"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-[#FFF9F3] font-semibold text-sm hover:bg-[#3E1012] transition-all shadow-md active:translate-y-0.5"
                >
                  <span>Create a Project Brief</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/talent"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFF9F3] font-semibold text-sm transition-colors"
                >
                  <span>Explore Curated Talent</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
