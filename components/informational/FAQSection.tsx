"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is RICOZ?",
      answer:
        "RICOZ is a platform designed to help businesses discover and connect with creative talent for their projects.",
    },
    {
      question: "What type of creative talent can I find on RICOZ?",
      answer:
        "RICOZ is designed to support creative professionals across areas such as creative direction, brand identity and specialized design.",
    },
    {
      question: "How does RICOZ help me find talent?",
      answer:
        "You can explore relevant profiles, review their capabilities and build a shortlist based on your project requirements.",
    },
    {
      question: "How do I start a project?",
      answer:
        "Start by sharing your project requirements through the RICOZ onboarding flow. From there, you can discover relevant talent and continue through the project workflow.",
    },
    {
      question: "Can I shortlist multiple creative professionals?",
      answer:
        "Yes. The platform's shortlist workflow allows you to review and organize potential creative talent before moving forward.",
    },
    {
      question: "Is RICOZ suitable for businesses and startups?",
      answer:
        "Yes. RICOZ is designed to help businesses and teams find creative expertise for specific projects and ongoing requirements.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-100 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>COMMON INQUIRIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Everything you need to know about the platform, talent curation, and project onboarding.
          </p>
        </div>

        {/* ACCORDION CONTAINER */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-red-300 shadow-md shadow-slate-200/50"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 sm:py-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isOpen
                        ? "bg-red-600 text-white rotate-180"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                    {faq.answer}
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
