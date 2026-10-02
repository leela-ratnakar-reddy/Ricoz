"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { MatchScore } from "@/components/MatchScore";
import { EmptyState } from "@/components/EmptyState";
import {
  getShortlist,
  getDesigners,
  removeFromShortlist,
  startOrGetConversation,
} from "@/lib/storage";
import { Designer } from "@/types";
import { Heart, Trash2, MessageSquare, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ShortlistPage() {
  const router = useRouter();
  const [shortlistedDesigners, setShortlistedDesigners] = useState<Designer[]>([]);

  const loadShortlist = () => {
    const ids = getShortlist();
    const all = getDesigners();
    const filtered = all.filter((d) => ids.includes(d.id));
    setShortlistedDesigners(filtered);
  };

  useEffect(() => {
    loadShortlist();
    window.addEventListener("brandroom_shortlist_updated", loadShortlist);
    return () => window.removeEventListener("brandroom_shortlist_updated", loadShortlist);
  }, []);

  const handleRemove = (designerId: string) => {
    removeFromShortlist(designerId);
  };

  const handleContact = (designer: Designer) => {
    startOrGetConversation(designer);
    router.push("/dashboard/company/messages");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="company" />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-surface-border">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-1">
                EXECUTIVE CANDIDATE ROSTER
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                Shortlisted Talent
              </h1>
              <p className="text-xs text-brand-muted font-mono mt-1">
                Saved Creative Directors and Specialists for comparison and review
              </p>
            </div>

            <Button href="/designers" size="md" variant="outline">
              Explore More Talent
            </Button>
          </div>

          {shortlistedDesigners.length === 0 ? (
            <EmptyState
              icon={<Heart className="w-6 h-6 text-accent" />}
              title="Your shortlist is empty."
              description="Save creative professionals from our talent directory to compare profiles, review client portfolios, or start a conversation."
              actionLabel="Explore designers"
              actionHref="/designers"
            />
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-mono text-brand-muted pb-2">
                {shortlistedDesigners.length} {shortlistedDesigners.length === 1 ? "Specialist" : "Specialists"} Shortlisted
              </div>

              {shortlistedDesigners.map((designer) => (
                <div
                  key={designer.id}
                  className="bg-surface/80 border border-surface-border rounded-xl p-6 hover:border-accent/40 transition-all shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left: Avatar & Meta */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-full bg-surface-elevated text-brand font-mono text-base font-bold flex items-center justify-center shrink-0 border border-surface-border">
                      {designer.initials}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/designers/${designer.id}`}
                          className="font-medium text-base text-brand hover:text-accent transition-colors"
                        >
                          {designer.name}
                        </Link>
                        {designer.verified && (
                          <ShieldCheck className="w-4 h-4 text-accent" />
                        )}
                        <span className="text-xs text-surface-border">•</span>
                        <span className="text-xs text-brand-muted font-mono">
                          {designer.location}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-brand-secondary">
                        {designer.role} —{" "}
                        <span className="text-brand-muted font-normal">
                          {designer.title}
                        </span>
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-xs text-brand-secondary font-mono">
                        <span>{designer.yearsExperience} yrs exp</span>
                        <span>•</span>
                        <span className="text-accent">{designer.dayRate}</span>
                        <span>•</span>
                        <span
                          className={`font-mono ${
                            designer.availability === "Available now"
                              ? "text-accent"
                              : "text-amber-400"
                          }`}
                        >
                          {designer.availability}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {designer.skills.slice(0, 3).map((s) => (
                          <Badge key={s} variant="subtle" size="sm">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-surface-border">
                    <MatchScore score={designer.matchPercentage || 94} size="sm" />

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleContact(designer)}
                      icon={<MessageSquare className="w-3.5 h-3.5" />}
                    >
                      Contact
                    </Button>

                    <Button
                      href={`/designers/${designer.id}`}
                      size="sm"
                      variant="secondary"
                    >
                      Profile
                    </Button>

                    <button
                      type="button"
                      onClick={() => handleRemove(designer.id)}
                      className="p-2 text-brand-muted hover:text-accent rounded hover:bg-surface-elevated transition-colors"
                      title="Remove from shortlist"
                      aria-label="Remove from shortlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
