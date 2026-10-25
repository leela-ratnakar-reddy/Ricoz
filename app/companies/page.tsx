import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EditorialStar, ContourFlourish } from "@/components/ui/EditorialDecorations";
import {
  ShieldCheck,
  Layers,
  Target,
  FileCheck,
  ArrowRight
} from "lucide-react";

export default function ForCompaniesPage() {
  const companyBenefits = [
    {
      icon: ShieldCheck,
      title: "Direct Senior Partnership",
      desc: "Work directly with seasoned Creative Directors and Studio Principals. No junior account managers or bait-and-switch staffing.",
    },
    {
      icon: Target,
      title: "Domain Sector Track Record",
      desc: "Match with creative talent who already understand the nuances of your industry—from healthcare regulatory complexities to B2B enterprise software.",
    },
    {
      icon: Layers,
      title: "Complete Identity Systems",
      desc: "Receive comprehensive, tokenized design systems, custom variable typefaces, and rigorous brand guidelines ready for multi-channel deployment.",
    },
    {
      icon: FileCheck,
      title: "Enterprise Contracting & NDAs",
      desc: "Standardized intellectual property assignment and confidentiality frameworks accelerate legal sign-off and risk compliance.",
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
              <span>FOR ENTERPRISE ORGANIZATIONS</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-espresso leading-[1.12]">
              Enterprise rebranding without <span className="italic text-accent">agency bloat.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed font-sans">
              When venture-backed scaleups, private equity funds, and enterprise conglomerates undergo generational transformation, they partner with Ricoz to access verified creative leadership on demand.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/start-project"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-[#FFF9F3] font-semibold text-sm hover:bg-[#3E1012] transition-all shadow-md active:translate-y-0.5"
              >
                <span>Create a Project Brief</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/talent"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-[#E6D8CF] text-espresso font-semibold text-sm hover:bg-[#FFF9F3] transition-colors shadow-2xs"
              >
                <span>Explore Specialist Talent</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-16">
            {companyBenefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="bg-white border border-[#E6D8CF] rounded-2xl p-8 hover:border-accent/40 transition-all shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FFF9F3] flex items-center justify-center text-accent mb-6 border border-[#E6D8CF]">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-normal text-espresso mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed font-sans">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* COMPARISON TABLE */}
          <div className="bg-[#FFF9F3] border border-[#E6D8CF] rounded-2xl p-8 sm:p-10 my-16 shadow-xs">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-espresso mb-6 tracking-tight">
              How RICOZ compares to traditional models
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E6D8CF] text-muted font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 pr-4">Dimension</th>
                    <th className="py-3 px-4 text-accent font-bold">RICOZ</th>
                    <th className="py-3 px-4 text-muted">Traditional Agency</th>
                    <th className="py-3 pl-4 text-muted">Generic Marketplace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6D8CF] text-muted">
                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-espresso">Senior Involvement</td>
                    <td className="py-3.5 px-4 font-semibold text-accent">100% Senior Creative Leads</td>
                    <td className="py-3.5 px-4">Senior pitch, junior execution</td>
                    <td className="py-3.5 pl-4">Unverified / mostly junior</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-espresso">Procurement Cycle</td>
                    <td className="py-3.5 px-4 font-semibold text-accent">Under 7 days to match</td>
                    <td className="py-3.5 px-4">6 to 12 weeks RFP</td>
                    <td className="py-3.5 pl-4">Fast but high vetting overhead</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-espresso">Agency Overhead Markup</td>
                    <td className="py-3.5 px-4 font-semibold text-accent">Zero unnecessary overhead</td>
                    <td className="py-3.5 px-4">150% - 300% agency markup</td>
                    <td className="py-3.5 pl-4">Unpredictable quality</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-espresso">Enterprise NDA & IP</td>
                    <td className="py-3.5 px-4 font-semibold text-accent">Standardized institutional terms</td>
                    <td className="py-3.5 px-4">Custom legal negotiations</td>
                    <td className="py-3.5 pl-4">Vague click-through terms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
