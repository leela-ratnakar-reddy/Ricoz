import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import {
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function HowItWorksPage() {
  const detailedSteps = [
    {
      num: "01",
      title: "Define your rebranding mandate",
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
        "Direct sector track records in B2B tech, finance, robotics, and hospitality",
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
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HERO */}
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-3">
              METHODOLOGY & WORKFLOW
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
              A disciplined pathway to senior creative leadership<span className="text-accent">.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-brand-secondary leading-relaxed">
              Traditional branding agencies charge massive overhead for junior execution. Freelance sites offer unverified clutter. RICOZ delivers direct access to elite Creative Directors calibrated for high-impact enterprise mandates.
            </p>
          </div>

          {/* DETAILED STEPS */}
          <div className="space-y-8">
            {detailedSteps.map((step) => (
              <div
                key={step.num}
                className="bg-surface/80 border border-surface-border rounded-xl p-8 sm:p-10 shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 items-start hover:border-accent/40 transition-all"
              >
                <div className="lg:col-span-3 space-y-2">
                  <div className="font-mono text-3xl sm:text-4xl font-light text-accent">
                    {step.num}
                  </div>
                  <span className="text-xs font-mono text-brand-muted uppercase tracking-wider block">
                    {step.subtitle}
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-elevated text-brand-secondary text-xs font-mono border border-surface-border">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>{step.time}</span>
                  </div>
                </div>

                <div className="lg:col-span-9 space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                    {step.title}
                  </h3>
                  <p className="text-sm text-brand-secondary leading-relaxed">
                    {step.desc}
                  </p>

                  <div className="pt-3 space-y-2">
                    {step.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-brand">
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
          <div className="mt-16 bg-surface/80 border border-surface-border rounded-xl p-8 sm:p-10">
            <div className="max-w-3xl space-y-4">
              <span className="font-mono text-xs font-medium uppercase text-accent">
                QUALITY ASSURANCE
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight font-sans">
                How we vet creative professionals
              </h2>
              <p className="text-sm text-brand-secondary leading-relaxed">
                Fewer than 4% of applicant creative directors are admitted to the Ricoz network. Every professional undergoes rigorous portfolio case study analysis, executive client references, and deep-dive technical evaluations into design system scalability.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button href="/dashboard/company/projects/new" size="md">
                  Create a Project Brief
                </Button>
                <Button href="/designers" variant="outline" size="md">
                  Explore Curated Talent
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
