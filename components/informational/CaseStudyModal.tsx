"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { CaseStudyArtwork } from "@/components/ui/CaseStudyArtwork";
import { EditorialStar } from "@/components/ui/EditorialDecorations";

export interface CaseStudyItem {
  id: string;
  title: string;
  client: string;
  specialistName: string;
  specialistRole: string;
  specialistAvatar: string;
  discipline: string;
  deliverables: string[];
  challenge: string;
  solution: string;
  impact?: string;
  image?: string;
  timeline?: string;
  palette?: string[];
}

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseStudy: CaseStudyItem | null;
  onInquire?: (caseStudy: CaseStudyItem) => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  isOpen,
  onClose,
  caseStudy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !caseStudy) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#38241F]/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-card border border-[#E6D8CF] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6D8CF] bg-[#FFF9F3]">
          <div className="flex items-center gap-2 text-xs font-sans font-bold text-[#541719] uppercase tracking-wider">
            <EditorialStar size={10} color="#541719" />
            <span>PORTFOLIO CASE STUDY // {caseStudy.discipline}</span>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-2 text-[#76665F] hover:text-[#38241F] rounded-full hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* ARTWORK PREVIEW */}
          <CaseStudyArtwork
            src={caseStudy.image}
            title={caseStudy.title}
            discipline={caseStudy.discipline}
            deliverables={caseStudy.deliverables}
            palette={caseStudy.palette}
            aspectRatio="aspect-[16/9]"
          />

          {/* PROJECT HEADER */}
          <div>
            <div className="text-xs font-sans font-bold text-[#541719] uppercase tracking-wider mb-1">
              Client Mandate: {caseStudy.client}
            </div>
            <h2
              id="case-study-title"
              className="text-2xl sm:text-3xl font-serif font-black text-[#38241F] tracking-tight leading-tight"
            >
              {caseStudy.title}
            </h2>
          </div>

          {/* LEAD SPECIALIST INFO */}
          <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#E0CEC3] border border-[#C7A99A] shrink-0">
                <Image
                  src={caseStudy.specialistAvatar || "/images/talent/elena-rostova.jpg"}
                  alt={caseStudy.specialistName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-serif font-bold text-[#38241F] text-sm">
                  {caseStudy.specialistName}
                </div>
                <div className="text-xs text-[#541719] font-medium font-sans">
                  {caseStudy.specialistRole}
                </div>
              </div>
            </div>

            {caseStudy.timeline && (
              <div className="text-right">
                <span className="text-[11px] font-sans uppercase text-[#9E8E87] block">
                  Sprint Duration
                </span>
                <span className="text-xs font-mono font-bold text-[#38241F]">
                  {caseStudy.timeline}
                </span>
              </div>
            )}
          </div>

          {/* STRATEGIC CHALLENGE & SOLUTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] space-y-2">
              <div className="text-xs font-sans font-bold uppercase tracking-wider text-[#9E8E87]">
                Mandate Challenge
              </div>
              <p className="text-[#76665F] leading-relaxed text-xs sm:text-sm font-sans">
                {caseStudy.challenge}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#E6D8CF] space-y-2">
              <div className="text-xs font-sans font-bold uppercase tracking-wider text-[#9E8E87]">
                Strategic Execution
              </div>
              <p className="text-[#76665F] leading-relaxed text-xs sm:text-sm font-sans">
                {caseStudy.solution}
              </p>
            </div>
          </div>

          {/* DELIVERABLES BREAKDOWN */}
          <div>
            <div className="text-xs font-sans font-bold text-[#9E8E87] uppercase tracking-wider mb-2.5">
              Verified Deliverables Shipped
            </div>
            <div className="flex flex-wrap gap-2">
              {caseStudy.deliverables.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF9F3] text-[#38241F] text-xs font-semibold border border-[#E6D8CF] font-sans"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#541719]" />
                  <span>{d}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#E6D8CF] bg-[#FFF9F3]">
          <div className="flex items-center gap-2 text-xs text-[#76665F] font-sans">
            <ShieldCheck className="w-4 h-4 text-[#541719]" />
            <span>Standardized Mutual NDA Protection</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#E6D8CF] text-[#38241F] font-semibold text-xs hover:bg-white transition-colors"
            >
              Close
            </button>
            <Link
              href="/start-project"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-xs hover:bg-[#3E1012] transition-all flex items-center justify-center gap-1.5 shadow-burgundy"
            >
              <span>Commission Similar Mandate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};