"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Hash } from "lucide-react";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

interface FAQItem {
  id: string;
  slug: string;
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      id: "faq-what-is-ricoz",
      slug: "what-is-ricoz",
      question: "What is RICOZ?",
      answer:
        "RICOZ is a curated creative services platform designed to help visionary businesses discover, evaluate, and connect directly with senior creative talent for project mandates.",
    },
    {
      id: "faq-talent-types",
      slug: "talent-types",
      question: "What type of creative talent can I find on RICOZ?",
      answer:
        "RICOZ supports senior creative specialists across 19 critical disciplines, including Creative Directors, Brand Strategists, Brand Identity Designers, UI/UX Architects, Packaging Designers, Motion Designers, and Typography Specialists.",
    },
    {
      id: "faq-how-it-works",
      slug: "how-matching-works",
      question: "How does RICOZ help me find talent?",
      answer:
        "You can explore relevant profiles, review their documented case studies, and use multi-dimensional matching based on industry background, aesthetic craft, and enterprise scale to build a focused shortlist.",
    },
    {
      id: "faq-start-project",
      slug: "start-project",
      question: "How do I start a project?",
      answer:
        "Start by sharing your project requirements through the RICOZ onboarding flow or scoping estimator. From there, you can review matching specialists and proceed through structured milestone sprints.",
    },
    {
      id: "faq-shortlisting",
      slug: "shortlisting-squads",
      question: "Can I shortlist multiple creative professionals?",
      answer:
        "Yes. The platform's shortlist workflow allows you to organize multiple specialists, compare portfolios side-by-side, and assemble multidisciplinary creative pods before kickoff.",
    },
    {
      id: "faq-suitability",
      slug: "business-suitability",
      question: "Is RICOZ suitable for businesses and startups?",
      answer:
        "Yes. RICOZ is designed for high-growth venture-backed startups, scale-ups, and enterprise marketing teams requiring senior creative expertise for high-stakes rebrands, product launches, or digital design systems.",
    },
    {
      id: "faq-contracts-nda",
      slug: "contracts-nda-safeguards",
      question: "How are confidential briefs and intellectual property protected?",
      answer:
        "All client engagements are governed by standardized mutual non-disclosure agreements prior to sensitive brief sharing. Upon completion of milestone deliverables, 100% full intellectual property rights transfer to your company.",
    },
    {
      id: "faq-rates-pricing",
      slug: "pricing-hourly-rates",
      question: "How are rates and project budgets determined?",
      answer:
        "Specialists on RICOZ specify transparent hourly rates (typically $140–$180/hr based on senior studio leadership). Projects can be structured as focused weekly sprints or milestone-based fixed budgets with zero hidden agency overhead.",
    },
  ];

  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;

      const matched = faqs.find((f) => f.id === hash || f.slug === hash);
      if (matched) {
        setOpenId(matched.id);
        const el = document.getElementById(matched.id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [faqs]);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#FBF6F0] border-b border-[#E6D8CF] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="mb-3">
            <EditorialBadge variant="burgundy">
              COMMON INQUIRIES & STANDARDS
            </EditorialBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#38241F] leading-tight">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#76665F] leading-relaxed font-sans font-normal">
            Everything you need to know about the platform, talent curation, contractual safeguards, and project onboarding.
          </p>
        </div>

        {/* ACCORDION CONTAINER */}
        <div className="space-y-3.5" role="region" aria-label="Frequently Asked Questions list">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                id={faq.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-subtle ${
                  isOpen
                    ? "border-[#541719]/40 shadow-card"
                    : "border-[#E6D8CF] hover:border-[#C7A99A]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-5 sm:py-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span className="text-base sm:text-lg font-serif font-bold text-[#38241F] leading-snug flex items-center gap-2">
                    <span>{faq.question}</span>
                  </span>

                  {/* CUSTOM ANIMATED CHEVRON INDICATOR */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-[#541719] text-[#FFF9F3] rotate-180 motion-reduce:rotate-0"
                        : "bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="px-6 pb-6 pt-1 text-sm sm:text-base text-[#76665F] leading-relaxed border-t border-[#E6D8CF] animate-in fade-in-50 duration-200 font-sans"
                  >
                    <p>{faq.answer}</p>
                    <div className="mt-3 pt-3 border-t border-[#E6D8CF] flex items-center justify-between text-xs text-[#9E8E87] font-sans">
                      <span>URL Fragment: #{faq.id}</span>
                      <a
                        href={`#${faq.id}`}
                        className="text-[#541719] hover:underline flex items-center gap-1 font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard?.writeText(window.location.origin + window.location.pathname + "#" + faq.id);
                        }}
                        title="Copy direct link to this FAQ"
                      >
                        <Hash className="w-3 h-3" />
                        <span>Copy Link</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};