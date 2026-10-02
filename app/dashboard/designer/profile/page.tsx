"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import { getDesigners, updateDesignerProfile } from "@/lib/storage";
import { ROLES, INDUSTRIES, DESIGN_STYLES, SKILLS } from "@/data/mockData";
import { Designer, Role, Industry, DesignStyle, AvailabilityStatus } from "@/types";
import { Check } from "lucide-react";

export default function DesignerProfileEditorPage() {
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Creative Director");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState(14);
  const [bio, setBio] = useState("");
  const [dayRate, setDayRate] = useState("$2,200 / day");
  const [availability, setAvailability] = useState<AvailabilityStatus>("Available now");
  const [skills, setSkills] = useState<string[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [styles, setStyles] = useState<DesignStyle[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const list = getDesigners();
    if (list.length > 0) {
      const d = list[0]; // Alex Morgan
      setDesigner(d);
      setName(d.name);
      setRole(d.role);
      setTitle(d.title);
      setLocation(d.location);
      setYearsExperience(d.yearsExperience);
      setBio(d.bio);
      setDayRate(d.dayRate);
      setAvailability(d.availability);
      setSkills(d.skills);
      setIndustries(d.industries);
      setStyles(d.styles);
    }
  }, []);

  if (!designer) return null;

  const toggleItem = <T extends string>(list: T[], item: T, setter: (val: T[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Designer = {
      ...designer,
      name,
      role,
      title,
      location,
      yearsExperience: Number(yearsExperience),
      bio,
      dayRate,
      availability,
      skills,
      industries,
      styles,
    };

    updateDesignerProfile(updated);
    setDesigner(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="designer" />

        <main className="flex-1 p-6 lg:p-10 max-w-4xl">
          <div className="pb-8 mb-8 border-b border-surface-border">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-1">
              STUDIO IDENTITY
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Edit Designer Profile
            </h1>
            <p className="text-xs text-brand-muted font-mono mt-1">
              Your public credentials, day rate, and domain sectors visible to enterprise clients
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* BASICS */}
            <div className="bg-surface/80 border border-surface-border rounded-xl p-6 space-y-4 shadow-subtle">
              <h3 className="font-medium text-sm text-brand">
                Core Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Lead Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Studio Subtitle / Distinction
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Former Studio Head, Pentagram Alum"
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Years Experience
                  </label>
                  <input
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Enterprise Day Rate
                  </label>
                  <input
                    type="text"
                    value={dayRate}
                    onChange={(e) => setDayRate(e.target.value)}
                    placeholder="e.g. $2,200 / day"
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Availability Status
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                  >
                    <option value="Available now">Available now</option>
                    <option value="Available soon">Available soon</option>
                    <option value="Booked">Booked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  Professional Biography
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 leading-relaxed font-sans font-light"
                />
              </div>
            </div>

            {/* SECTORS & SKILLS */}
            <div className="bg-surface/80 border border-surface-border rounded-xl p-6 space-y-6 shadow-subtle">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-2">
                  Target Industries
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => {
                    const isSelected = industries.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => toggleItem(industries, ind, setIndustries)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          isSelected
                            ? "bg-accent text-background border-accent font-semibold"
                            : "bg-surface-elevated text-brand-secondary border-surface-border hover:border-surface-borderLight hover:text-brand"
                        }`}
                      >
                        {ind}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-2">
                  Aesthetic Styles
                </label>
                <div className="flex flex-wrap gap-2">
                  {DESIGN_STYLES.map((style) => {
                    const isSelected = styles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleItem(styles, style, setStyles)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          isSelected
                            ? "bg-accent text-background border-accent font-semibold"
                            : "bg-surface-elevated text-brand-secondary border-surface-border hover:border-surface-borderLight hover:text-brand"
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-2">
                  Skills & Technical Capabilities
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((sk) => {
                    const isSelected = skills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleItem(skills, sk, setSkills)}
                        className={`px-3 py-1 rounded text-xs border transition-colors font-mono ${
                          isSelected
                            ? "bg-accent text-background border-accent font-semibold"
                            : "bg-surface-elevated text-brand-secondary border-surface-border hover:border-surface-borderLight hover:text-brand"
                        }`}
                      >
                        {sk}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs text-accent font-mono flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Profile updated & persisted!</span>
                </span>
              ) : (
                <div />
              )}

              <Button type="submit" size="md">
                Save Studio Changes
              </Button>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
}
