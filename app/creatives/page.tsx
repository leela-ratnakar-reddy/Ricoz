import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EditorialStar, ContourFlourish } from "@/components/ui/EditorialDecorations";
import {
  DollarSign,
  Briefcase,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 relative overflow-hidden">
        <ContourFlourish className="absolute -top-16 -right-16 w-80 h-80 text-taupe/15 pointer-events-none" />
        <ContourFlourish className="absolute bottom-20 -left-20 w-72 h-72 text-taupe/15 pointer-events-none rotate-90" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-[#FFF9F3] text-accent border border-[#E6D8CF] shadow-xs">
              <EditorialStar size={13} className="text-accent" />
              <span>FOR CREATIVE DIRECTORS & SPECIALISTS</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-espresso leading-[1.12]">
              Lead transformative mandates on your <span className="italic text-accent">own terms.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed font-sans">
              RICOZ provides premier independent Creative Directors, Brand Strategists, and Typographers with direct access to ambitious enterprise clients.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/register?role=designer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-[#FFF9F3] font-semibold text-sm hover:bg-[#3E1012] transition-all shadow-md active:translate-y-0.5"
              >
                <span>Apply to Join Network</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/designer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-[#E6D8CF] text-espresso font-semibold text-sm hover:bg-[#FFF9F3] transition-colors shadow-2xs"
              >
                <span>View Designer Studio Demo</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-16">
            {creativePillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-white border border-[#E6D8CF] rounded-2xl p-8 hover:border-accent/40 transition-all shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FFF9F3] flex items-center justify-center text-accent mb-6 border border-[#E6D8CF]">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-normal text-espresso mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed font-sans">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* APPLICATION CRITERIA */}
          <div className="bg-[#FFF9F3] border border-[#E6D8CF] rounded-2xl p-8 sm:p-10 my-16 shadow-xs">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-espresso mb-3 tracking-tight">
              Curatorial Admission Standards
            </h3>
            <p className="text-sm text-muted max-w-2xl mb-6">
              Our network maintains the highest creative concentration in the industry. Applicants must meet the following criteria:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Minimum 8+ years of dedicated professional design practice",
                "Proven lead role in at least two enterprise or venture rebrands",
                "Verifiable client references or top-tier design studio tenure",
                "Specialization in brand identity, typography, strategy, or creative direction",
              ].map((crit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-espresso">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{crit}</span>
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
