"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, ShieldCheck, Send } from "lucide-react";
import { EditorialStar } from "@/components/ui/EditorialDecorations";

interface ConciergeBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConciergeBriefingModal: React.FC<ConciergeBriefingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [mandateType, setMandateType] = useState("Brand Architecture & Rebrand");
  const [timeline, setTimeline] = useState("Within 4 weeks");
  const [projectBrief, setProjectBrief] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Please enter your name.";
    if (!email.trim() || !email.includes("@")) newErrors.email = "Please enter a valid business email.";
    if (!company.trim()) newErrors.company = "Please enter your company name.";
    if (!projectBrief.trim()) newErrors.projectBrief = "Please describe your mandate requirements.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const existingInquiries = JSON.parse(localStorage.getItem("ricoz_briefing_requests") || "[]");
      existingInquiries.push({
        id: `brief-${Date.now()}`,
        fullName,
        email,
        company,
        mandateType,
        timeline,
        projectBrief,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem("ricoz_briefing_requests", JSON.stringify(existingInquiries));
    } catch (err) {
      console.error("Failed to store briefing request", err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  const handleReset = () => {
    setFullName("");
    setEmail("");
    setCompany("");
    setProjectBrief("");
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#38241F]/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-modal-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-card border border-[#E6D8CF] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6D8CF] bg-[#FFF9F3]">
          <div className="flex items-center gap-2 text-xs font-sans font-bold text-[#541719] uppercase tracking-wider">
            <EditorialStar size={10} color="#541719" />
            <span>CONCIERGE MANDATE BRIEFING</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#76665F] hover:text-[#38241F] rounded-full hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#541719]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-[#541719]/10 text-[#541719] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#38241F] tracking-tight">
                Briefing Request Received
              </h3>
              <p className="text-sm text-[#76665F] max-w-md mx-auto leading-relaxed font-sans">
                Thank you, <span className="font-semibold text-[#38241F]">{fullName}</span>. A senior RICOZ curatorial advisor will review your mandate requirements for <span className="font-semibold text-[#38241F]">{company}</span> and follow up within 24 business hours under mutual NDA.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 rounded-full bg-[#541719] text-[#FFF9F3] font-semibold text-xs hover:bg-[#3E1012] transition-colors shadow-burgundy font-sans"
                >
                  Return to Overview
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 id="briefing-modal-title" className="text-xl sm:text-2xl font-serif font-black text-[#38241F] tracking-tight">
                  Book a Mandate Briefing Call
                </h3>
                <p className="text-xs sm:text-sm text-[#76665F] mt-1 font-sans">
                  Connect directly with a dedicated curatorial lead to match specialists to your scope.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-sans font-bold text-[#38241F] uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className={`w-full px-3.5 py-2.5 rounded-full border text-xs text-[#38241F] focus:outline-none focus:ring-2 focus:ring-[#541719] transition-all bg-[#FFF9F3] ${
                      errors.fullName ? "border-[#541719]" : "border-[#E6D8CF]"
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-[#541719] mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-[#38241F] uppercase tracking-wider mb-1.5">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="s.jenkins@acme.com"
                    className={`w-full px-3.5 py-2.5 rounded-full border text-xs text-[#38241F] focus:outline-none focus:ring-2 focus:ring-[#541719] transition-all bg-[#FFF9F3] ${
                      errors.email ? "border-[#541719]" : "border-[#E6D8CF]"
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-[#541719] mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-sans font-bold text-[#38241F] uppercase tracking-wider mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Cloud"
                    className={`w-full px-3.5 py-2.5 rounded-full border text-xs text-[#38241F] focus:outline-none focus:ring-2 focus:ring-[#541719] transition-all bg-[#FFF9F3] ${
                      errors.company ? "border-[#541719]" : "border-[#E6D8CF]"
                    }`}
                  />
                  {errors.company && <p className="text-[11px] text-[#541719] mt-1">{errors.company}</p>}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-[#38241F] uppercase tracking-wider mb-1.5">
                    Mandate Focus
                  </label>
                  <select
                    value={mandateType}
                    onChange={(e) => setMandateType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-full border border-[#E6D8CF] bg-[#FFF9F3] text-xs text-[#38241F] focus:outline-none focus:ring-2 focus:ring-[#541719]"
                  >
                    <option value="Brand Architecture & Rebrand">Brand Architecture & Rebrand</option>
                    <option value="Design System & Token Architecture">Design System & Token Architecture</option>
                    <option value="Packaging & Physical Brand Suite">Packaging & Physical Brand Suite</option>
                    <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                    <option value="Executive Creative Direction">Executive Creative Direction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-[#38241F] uppercase tracking-wider mb-1.5">
                  Project Brief & Objectives *
                </label>
                <textarea
                  rows={3}
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  placeholder="Summarize your creative goals, key milestones, and desired specialist background..."
                  className={`w-full px-4 py-3 rounded-2xl border text-xs text-[#38241F] focus:outline-none focus:ring-2 focus:ring-[#541719] transition-all bg-[#FFF9F3] ${
                    errors.projectBrief ? "border-[#541719]" : "border-[#E6D8CF]"
                  }`}
                />
                {errors.projectBrief && <p className="text-[11px] text-[#541719] mt-1">{errors.projectBrief}</p>}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#76665F] font-sans">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#541719]" />
                  <span>Standard Mutual NDA</span>
                </span>
                <span>Response in &lt;24h</span>
              </div>

              <div className="pt-3 border-t border-[#E6D8CF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-[#E6D8CF] text-[#38241F] font-semibold text-xs hover:bg-[#FFF9F3] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#541719] text-[#FFF9F3] font-semibold text-xs hover:bg-[#3E1012] disabled:opacity-50 transition-all shadow-burgundy"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit Mandate Briefing</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};