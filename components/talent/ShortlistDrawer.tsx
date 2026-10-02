"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, X, ArrowRight, Trash2, ArrowUpRight } from "lucide-react";
import { getShortlist, removeFromShortlist } from "@/lib/storage";
import { TALENT_PROFILES } from "@/data/talentProfiles";
import { TalentProfile } from "@/types/talent";

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
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#111114] border border-accent/40 text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:border-accent hover:scale-105 active:scale-95 transition-all group backdrop-blur-md"
        title="View Shortlisted Talent"
      >
        <Bookmark className="w-4 h-4 text-accent fill-accent" />
        <span className="text-xs font-semibold">Shortlist</span>
        <span className="w-5 h-5 rounded-full bg-accent text-black font-mono text-[11px] font-bold flex items-center justify-center">
          {shortlistedTalent.length}
        </span>
      </button>

      {/* Slide-over Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-md bg-[#111114] border-l border-white/10 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-accent fill-accent" />
                <h3 className="font-semibold text-white text-base">Your Talent Shortlist</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-accent/15 text-accent border border-accent/25">
                  {shortlistedTalent.length} Profiles
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {shortlistedTalent.length === 0 ? (
                <div className="py-20 text-center text-zinc-400">
                  <Bookmark className="w-10 h-10 mx-auto text-zinc-600 mb-3 opacity-40" />
                  <p className="text-sm font-medium text-white mb-1">Your shortlist is empty</p>
                  <p className="text-xs max-w-xs mx-auto text-zinc-400">
                    Browse talent profiles or use AI matching to save creative candidates you want to collaborate with.
                  </p>
                </div>
              ) : (
                shortlistedTalent.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-[#16161A] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                        {t.profileImage ? (
                          <img
                            src={t.profileImage}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white font-mono">
                            {t.initials}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/talent/${t.id}`}
                          onClick={() => setIsOpen(false)}
                          className="font-medium text-sm text-white hover:text-accent transition-colors flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{t.name}</span>
                          <ArrowUpRight className="w-3 h-3 text-zinc-400 shrink-0" />
                        </Link>
                        <p className="text-xs text-zinc-400 truncate">{t.role}</p>
                        <span className="text-[11px] font-mono text-accent font-semibold">{t.hourlyRate}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromShortlist(t.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
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
              <div className="p-5 border-t border-white/10 bg-[#0E0E11] space-y-3">
                <Link
                  href="/dashboard/company/projects/new"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover active:bg-[#B5F228] transition-all shadow-glow"
                >
                  <span>Start Project with Shortlist</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/ai-match"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-accent transition-colors font-mono py-1"
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
