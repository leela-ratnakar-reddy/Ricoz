import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import {
  DollarSign,
  Briefcase,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ForCreativesPage() {
  const creativePillars = [
    {
      icon: Briefcase,
      title: "Direct Enterprise Mandates",
      desc: "Connect directly with decision-makers: CEOs, Chief Marketing Officers, and Heads of Brand managing serious capital investments.",
    },
    {
      icon: DollarSign,
      title: "Uncompromised Compensation",
      desc: "Set your own day and project rates ($1,500 - $3,000+ / day). We believe senior expertise deserves enterprise budgets.",
    },
    {
      icon: Layers,
      title: "Portfolio-First Presentation",
      desc: "Showcase comprehensive rebranding case studies, technical type specimens, and spatial executions without algorithmic gimmicks.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Bidding Wars",
      desc: "No race to the bottom. Clients reach out based on curated deterministic matching and genuine creative alignment.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-3">
              FOR CREATIVE DIRECTORS & SPECIALISTS
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Lead transformative rebrands on your own terms<span className="text-accent">.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-brand-secondary leading-relaxed">
              RICOZ provides premier independent Creative Directors, Brand Strategists, and Typographers with direct access to ambitious enterprise clients.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button href="/register?role=designer" size="lg">
                Apply to Join Network
              </Button>
              <Button href="/dashboard/designer" variant="outline" size="lg">
                View Designer Studio Demo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
            {creativePillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-surface/80 border border-surface-border rounded-xl p-8 hover:border-accent/40 transition-all shadow-subtle group"
                >
                  <div className="w-10 h-10 rounded-md bg-surface-elevated flex items-center justify-center text-accent mb-6 border border-surface-border">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-medium text-brand mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed font-light">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* APPLICATION CRITERIA */}
          <div className="bg-surface/80 border border-surface-border rounded-xl p-8 sm:p-10 my-16">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight font-sans">
              Curatorial Admission Standards
            </h3>
            <p className="text-sm text-brand-secondary max-w-2xl mb-6">
              Our network maintains the highest creative concentration in the industry. Applicants must meet the following criteria:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Minimum 8+ years of dedicated professional design practice",
                "Proven lead role in at least two enterprise or venture rebrands",
                "Verifiable client references or top-tier design studio tenure",
                "Specialization in brand identity, typography, strategy, or creative direction",
              ].map((crit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-brand">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="font-light">{crit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
