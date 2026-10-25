"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { PortfolioVisual } from "@/components/PortfolioVisual";
import { EmptyState } from "@/components/EmptyState";
import {
  getDesignerById,
  isShortlisted,
  toggleShortlist,
  startOrGetConversation,
  sendMessage,
} from "@/lib/storage";
import { Designer, PortfolioProject } from "@/types";
import {
  Heart,
  MessageSquare,
  MapPin,
  Briefcase,
  ShieldCheck,
  ArrowLeft,
  X,
  Send,
} from "lucide-react";
import { EditorialStar, EditorialBadge } from "@/components/ui/EditorialDecorations";

export default function DesignerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const designerId = params.id as string;

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [shortlisted, setShortlisted] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    if (designerId) {
      const found = getDesignerById(designerId);
      if (found) {
        setDesigner(found);
        setShortlisted(isShortlisted(found.id));
      }
    }
  }, [designerId]);

  if (!designer) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF6F0] text-[#38241F]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20">
          <EmptyState
            title="Designer profile not found"
            description="The requested creative talent profile may have been relocated or is currently inactive."
            actionLabel="Return to talent directory"
            actionHref="/designers"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const handleShortlistToggle = () => {
    const nextState = toggleShortlist(designer.id);
    setShortlisted(nextState);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    const conv = startOrGetConversation(designer);
    sendMessage(conv.id, contactMessage.trim(), "Alex Vance (Vantage Robotics)");
    setContactModalOpen(false);
    router.push("/dashboard/company/messages");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF6F0] text-[#38241F] selection:bg-[#541719] selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* BREADCRUMB / BACK LINK */}
          <div className="mb-8">
            <Link
              href="/designers"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#76665F] hover:text-[#541719] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to talent directory</span>
            </Link>
          </div>

          {/* TOP PROFILE HEADER SECTION */}
          <div className="bg-white border border-[#E6D8CF] rounded-3xl p-6 sm:p-10 mb-10 shadow-card">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              {/* Left: Avatar & Primary Info */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#FFF9F3] border-2 border-[#E6D8CF] shrink-0 shadow-subtle flex items-center justify-center font-serif text-2xl font-bold text-[#38241F]">
                  {designer.avatar ? (
                    <img src={designer.avatar} alt={designer.name} className="w-full h-full object-cover" />
                  ) : (
                    designer.initials
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-[#38241F]">
                      {designer.name}
                    </h1>
                    {designer.verified && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-sans font-bold bg-[#541719]/10 text-[#541719] border border-[#541719]/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#541719]" />
                        Vetted Principal
                      </span>
                    )}
                  </div>

                  <p className="text-base text-[#541719] font-sans font-medium">
                    {designer.role} —{" "}
                    <span className="font-normal text-[#76665F]">{designer.title}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#76665F] pt-1 font-sans">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#9E8E87]" />
                      {designer.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-[#9E8E87]" />
                      {designer.yearsExperience} Years Experience
                    </span>
                    <span>•</span>
                    <span className="text-[#38241F] font-bold font-mono">
                      {designer.dayRate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          designer.availability === "Available now"
                            ? "bg-[#541719] animate-pulse"
                            : "bg-[#C7A99A]"
                        }`}
                      />
                      <span className="text-xs font-sans text-[#76665F]">
                        {designer.availability}
                      </span>
                    </div>
                    <span className="text-[#E6D8CF]">•</span>
                    <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-[#541719]/10 text-[#541719]">
                      {designer.matchPercentage || 94}% Compatibility Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex sm:flex-col items-center gap-3 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setContactModalOpen(true)}
                  icon={<MessageSquare className="w-4 h-4" />}
                  className="bg-[#541719] hover:bg-[#3E1012] text-[#FFF9F3] rounded-full px-6 shadow-burgundy"
                  fullWidth
                >
                  Contact Designer
                </Button>

                <Button
                  variant={shortlisted ? "outline" : "secondary"}
                  size="md"
                  onClick={handleShortlistToggle}
                  className="rounded-full border-[#E6D8CF] hover:border-[#C7A99A]"
                  icon={
                    <Heart
                      className={`w-4 h-4 ${
                        shortlisted ? "fill-[#541719] text-[#541719]" : "text-[#76665F]"
                      }`}
                    />
                  }
                  fullWidth
                >
                  {shortlisted ? "Shortlisted" : "Add to Shortlist"}
                </Button>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN DETAILS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-12">
              {/* ABOUT / BIOGRAPHY */}
              <section className="space-y-4 bg-white border border-[#E6D8CF] rounded-3xl p-8 shadow-subtle">
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#541719]">
                  Professional Biography
                </h2>
                <p className="text-base text-[#76665F] leading-relaxed font-sans font-normal">
                  {designer.bio}
                </p>
              </section>

              {/* PORTFOLIO GRID */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[#541719]">
                      Selected Rebranding Case Studies
                    </h2>
                    <h3 className="text-2xl font-serif font-bold text-[#38241F] mt-1">
                      Visual Identity & Strategic Work
                    </h3>
                  </div>
                  <span className="text-xs font-sans text-[#76665F] px-3 py-1 rounded-full bg-white border border-[#E6D8CF]">
                    {designer.portfolio.length} Projects
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {designer.portfolio.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProject(proj)}
                      className="group cursor-pointer bg-white border border-[#E6D8CF] rounded-3xl overflow-hidden hover:border-[#C7A99A] shadow-subtle hover:shadow-card transition-all duration-200"
                    >
                      <PortfolioVisual
                        title={proj.title}
                        client={proj.client}
                        industry={proj.industry}
                        palette={proj.palette}
                        aspectRatio="aspect-[16/10]"
                      />
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#76665F] font-sans">
                          <span>{proj.industry}</span>
                          <span>{proj.year}</span>
                        </div>
                        <h4 className="font-serif font-bold text-[#38241F] text-base group-hover:text-[#541719] transition-colors truncate">
                          {proj.title}
                        </h4>
                        <p className="text-xs text-[#76665F] line-clamp-2 leading-relaxed font-sans">
                          {proj.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Credentials Sidebar */}
            <div className="space-y-6">
              <div className="bg-white border border-[#E6D8CF] rounded-3xl p-6 sm:p-7 shadow-subtle space-y-6">
                <div>
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#76665F] mb-3">
                    Core Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {designer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-xs font-sans bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6D8CF]">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#76665F] mb-3">
                    Industry Verticals
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {designer.industries.map((ind) => (
                      <span
                        key={ind}
                        className="px-3 py-1 rounded-full text-xs font-sans bg-[#FFF9F3] text-[#76665F] border border-[#E6D8CF]"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6D8CF] space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-[#76665F]">Studio Location:</span>
                    <span className="font-semibold text-[#38241F]">{designer.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#76665F]">Day Rate Benchmark:</span>
                    <span className="font-bold text-[#541719] font-mono">{designer.dayRate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CONTACT MODAL */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#38241F]/60 backdrop-blur-md">
          <div className="bg-white border border-[#E6D8CF] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6D8CF] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#38241F]">Contact {designer.name}</h3>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="p-1 text-[#76665F] hover:text-[#38241F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold text-[#38241F] mb-1.5">
                  Initial Mandate Inquiry Message
                </label>
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={`Hi ${designer.name}, we are looking for creative direction on an upcoming mandate...`}
                  className="w-full p-3.5 rounded-2xl border border-[#E6D8CF] bg-[#FFF9F3] text-xs text-[#38241F] focus:outline-none focus:ring-2 focus:ring-[#541719]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E6D8CF] text-xs text-[#38241F] font-semibold hover:bg-[#FFF9F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#541719] text-[#FFF9F3] text-xs font-semibold hover:bg-[#3E1012] shadow-burgundy"
                >
                  <span>Send Message</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASE STUDY MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#38241F]/60 backdrop-blur-md">
          <div className="bg-white border border-[#E6D8CF] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-card space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6D8CF] pb-3">
              <h3 className="font-serif font-bold text-xl text-[#38241F]">{selectedProject.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="p-1 text-[#76665F] hover:text-[#38241F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PortfolioVisual
              title={selectedProject.title}
              client={selectedProject.client}
              industry={selectedProject.industry}
              palette={selectedProject.palette}
              aspectRatio="aspect-[16/10]"
            />
            <p className="text-sm text-[#76665F] leading-relaxed font-sans">{selectedProject.description}</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}