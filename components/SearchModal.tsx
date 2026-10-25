"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Briefcase } from "lucide-react";
import { getDesigners, getProjects } from "@/lib/storage";
import { Designer, Project } from "@/types";
import { TALENT_PROFILES } from "@/data/talentProfiles";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDesigners(getDesigners());
      setProjects(getProjects());
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredTalents = query.trim()
    ? TALENT_PROFILES.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.role.toLowerCase().includes(query.toLowerCase()) ||
          t.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
          t.industries.some((i) => i.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : TALENT_PROFILES.slice(0, 4);

  const filteredDesigners = query.trim()
    ? designers.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.role.toLowerCase().includes(query.toLowerCase()) ||
          d.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
          d.industries.some((i) => i.toLowerCase().includes(query.toLowerCase()))
      )
    : designers.slice(0, 3);

  const filteredProjects = query.trim()
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.companyName.toLowerCase().includes(query.toLowerCase()) ||
          p.industry.toLowerCase().includes(query.toLowerCase())
      )
    : projects.slice(0, 2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-espresso/40 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-[#E6D8CF] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-[#E6D8CF] bg-[#FFF9F3]">
          <Search className="w-5 h-5 text-taupe shrink-0 mr-3" />
          <input
            id="search-modal-title"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search senior talent, roles, skills, or projects..."
            autoFocus
            className="w-full py-4 text-sm sm:text-base bg-transparent text-espresso placeholder-[#76665F]/60 focus:outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-taupe hover:text-espresso rounded mr-2"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-mono text-muted bg-white border border-[#E6D8CF] rounded-md hover:text-espresso"
            aria-label="Close search dialog"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {/* 57 Talent Profiles */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold mb-2 px-2 flex items-center justify-between">
              <span>Verified Creative Specialists ({filteredTalents.length})</span>
              <span className="text-[9px] text-taupe">57 Profiles</span>
            </div>
            {filteredTalents.length === 0 ? (
              <p className="text-xs text-muted px-2 py-2">No matching creative specialists found.</p>
            ) : (
              <div className="space-y-1">
                {filteredTalents.map((t) => (
                  <Link
                    key={t.id}
                    href={`/talent/${t.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FFF9F3] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E0CEC3]/40 text-espresso font-serif text-sm flex items-center justify-center border border-[#E6D8CF] group-hover:border-accent/40">
                        {t.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-espresso group-hover:text-accent transition-colors flex items-center gap-2">
                          <span>{t.name}</span>
                          <span className="text-[10px] font-mono text-accent font-semibold">{t.hourlyRate}</span>
                        </div>
                        <div className="text-xs text-muted">
                          {t.role} • {t.location}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-taupe group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Designers */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted font-semibold mb-2 px-2">
              Featured Designers ({filteredDesigners.length})
            </div>
            {filteredDesigners.length === 0 ? (
              <p className="text-xs text-muted px-2 py-3">No matching creative talent found.</p>
            ) : (
              <div className="space-y-1">
                {filteredDesigners.map((d) => (
                  <Link
                    key={d.id}
                    href={`/designers/${d.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FFF9F3] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E0CEC3]/40 text-espresso font-serif text-sm flex items-center justify-center border border-[#E6D8CF]">
                        {d.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-espresso group-hover:text-accent transition-colors">
                          {d.name}
                        </div>
                        <div className="text-xs text-muted">
                          {d.role} • {d.location}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-taupe group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted font-semibold mb-2 px-2">
              Rebranding Projects ({filteredProjects.length})
            </div>
            {filteredProjects.length === 0 ? (
              <p className="text-xs text-muted px-2 py-3">No matching projects found.</p>
            ) : (
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/company/projects/${p.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FFF9F3] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF9F3] border border-[#E6D8CF] text-muted flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-espresso group-hover:text-accent transition-colors truncate">
                          {p.title}
                        </div>
                        <div className="text-xs text-muted">
                          {p.companyName} • {p.industry} • {p.status}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-taupe group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-3.5 bg-[#FFF9F3] border-t border-[#E6D8CF] flex items-center justify-between text-xs text-muted">
          <span>Explore full network</span>
          <Link
            href="/talent"
            onClick={onClose}
            className="text-espresso hover:text-accent font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View all 57 talents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
