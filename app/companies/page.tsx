import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import {
  ShieldCheck,
  Layers,
  Target,
  FileCheck,
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
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-3">
              FOR ENTERPRISE ORGANIZATIONS
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Enterprise rebranding without agency bloat<span className="text-accent">.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-brand-secondary leading-relaxed">
              When venture-backed scaleups, private equity funds, and enterprise conglomerates undergo generational transformation, they partner with Ricoz to access verified creative leadership on demand.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button href="/dashboard/company/projects/new" size="lg">
                Create a Rebrand Brief
              </Button>
              <Button href="/designers" variant="outline" size="lg">
                Explore Specialist Talent
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
            {companyBenefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="bg-surface/80 border border-surface-border rounded-xl p-8 hover:border-accent/40 transition-all shadow-subtle group"
                >
                  <div className="w-10 h-10 rounded-md bg-surface-elevated flex items-center justify-center text-accent mb-6 border border-surface-border">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-medium text-brand mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed font-light">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* COMPARISON TABLE */}
          <div className="bg-surface/80 border border-surface-border rounded-xl p-8 sm:p-10 my-16">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 tracking-tight font-sans">
              How RICOZ compares to traditional options
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-surface-border text-brand-muted font-mono text-[11px] uppercase">
                    <th className="py-3 pr-4">Dimension</th>
                    <th className="py-3 px-4 text-accent font-medium">RICOZ</th>
                    <th className="py-3 px-4 text-brand-secondary">Traditional Agency</th>
                    <th className="py-3 pl-4 text-brand-secondary">Generic Marketplace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-brand-secondary">
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-brand">Senior Involvement</td>
                    <td className="py-3.5 px-4 font-medium text-accent">100% Senior Creative Leads</td>
                    <td className="py-3.5 px-4 font-light">Senior pitch, junior execution</td>
                    <td className="py-3.5 pl-4 font-light">Unverified / mostly junior</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-brand">Procurement Cycle</td>
                    <td className="py-3.5 px-4 font-medium text-accent">Under 7 days to match</td>
                    <td className="py-3.5 px-4 font-light">6 to 12 weeks RFP</td>
                    <td className="py-3.5 pl-4 font-light">Fast but high vetting overhead</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-brand">Agency Overhead Markup</td>
                    <td className="py-3.5 px-4 font-medium text-accent">Zero unnecessary overhead</td>
                    <td className="py-3.5 px-4 font-light">150% - 300% agency markup</td>
                    <td className="py-3.5 pl-4 font-light">Unpredictable quality</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-brand">Enterprise NDA & IP</td>
                    <td className="py-3.5 px-4 font-medium text-accent">Standardized institutional terms</td>
                    <td className="py-3.5 px-4 font-light">Custom legal negotiations</td>
                    <td className="py-3.5 pl-4 font-light">Vague click-through terms</td>
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
