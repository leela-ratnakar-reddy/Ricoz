"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, X, ArrowRight, Trash2, ArrowUpRight } from "lucide-react";
import { getShortlist, removeFromShortlist } from "@/lib/storage";
import { TALENT_PROFILES } from "@/data/talentProfiles";
import { TalentProfile } from "@/types/talent";
import { EditorialStar } from "@/components/ui/EditorialDecorations";

export const ShortlistDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);

  useEffect(() => {
    setShortlistIds(getShortlist());
    const handleUpdate = () => setShortlistIds(getShortlist());
    window.addEventListener("brandroom_shortlist_updated", handleUpdate);
    return () => window.removeEventListener("brandroom_shortlist_updated", handleUpdate);
  }, []);

  const shortlistedTalent: TalentProfile[] = shortlistIds
    .map((id) => TALENT_PROFILES.find((p) => p.id === id))
    .filter((p): p is TalentProfile => Boolean(p));

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white border border-[#E6D8CF] hover:border-[#C7A99A] text-[#38241F] shadow-card hover:scale-105 active:scale-95 transition-all group backdrop-blur-md"
        title="View Shortlisted Talent"
      >
        <Bookmark className="w-4 h-4 text-[#541719] fill-[#541719]" />
        <span className="text-xs font-sans font-bold">Shortlist</span>
        <span className="w-5 h-5 rounded-full bg-[#541719] text-[#FFF9F3] font-sans text-[11px] font-bold flex items-center justify-center">
          {shortlistedTalent.length}
        </span>
      </button>

      {/* Slide-over Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#38241F]/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-md bg-white border-l border-[#E6D8CF] h-full flex flex-col z-10 shadow-card animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-[#E6D8CF] bg-[#FFF9F3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-[#541719] fill-[#541719]" />
                <h3 className="font-serif font-bold text-[#38241F] text-base">Your Talent Shortlist</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-sans bg-[#541719]/10 text-[#541719] border border-[#541719]/20 font-bold">
                  {shortlistedTalent.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#76665F] hover:text-[#38241F] rounded-full hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#FBF6F0]">
              {shortlistedTalent.length === 0 ? (
                <div className="py-20 text-center text-[#76665F]">
                  <Bookmark className="w-10 h-10 mx-auto text-[#C7A99A] mb-3 opacity-40" />
                  <p className="text-sm font-serif font-bold text-[#38241F] mb-1">Your shortlist is empty</p>
                  <p className="text-xs max-w-xs mx-auto text-[#76665F] font-sans">
                    Browse talent profiles or use AI matching to save creative candidates you want to collaborate with.
                  </p>
                </div>
              ) : (
                shortlistedTalent.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#E6D8CF] hover:border-[#C7A99A] shadow-subtle transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-[#FFF9F3] border border-[#E6D8CF] shrink-0">
                        {t.profileImage ? (
                          <img
                            src={t.profileImage}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-serif font-bold text-xs text-[#38241F]">
                            {t.initials}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/talent/${t.id}`}
                          onClick={() => setIsOpen(false)}
                          className="font-serif font-bold text-sm text-[#38241F] hover:text-[#541719] transition-colors flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{t.name}</span>
                          <ArrowUpRight className="w-3 h-3 text-[#9E8E87] shrink-0" />
                        </Link>
                        <p className="text-xs text-[#76665F] truncate font-sans">{t.role}</p>
                        <span className="text-[11px] font-mono text-[#541719] font-bold">{t.hourlyRate}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromShortlist(t.id)}
                      className="p-2 text-[#9E8E87] hover:text-[#541719] hover:bg-[#541719]/10 rounded-full transition-colors shrink-0"
                      title="Remove from shortlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer CTA */}
            {shortlistedTalent.length > 0 && (
              <div className="p-5 border-t border-[#E6D8CF] bg-[#FFF9F3] space-y-3">
                <Link
                  href="/start-project"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#541719] text-[#FFF9F3] font-sans font-semibold text-sm hover:bg-[#3E1012] transition-all shadow-burgundy"
                >
                  <span>Start Project with Shortlist</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/ai-match"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-[#76665F] hover:text-[#541719] font-sans py-1"
                >
                  <span>Compare with AI Project Matcher</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};