"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import { getCurrentUser, setCurrentUser, DEFAULT_USER } from "@/lib/storage";
import { User, Industry } from "@/types";
import { INDUSTRIES } from "@/data/mockData";
import { Check } from "lucide-react";

export default function CompanyProfilePage() {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [companyName, setCompanyName] = useState(DEFAULT_USER.companyName || "Vantage Robotics");
  const [title, setTitle] = useState(DEFAULT_USER.title || "VP of Product & Brand");
  const [industry, setIndustry] = useState<Industry>("Technology");
  const [size, setSize] = useState("500-1000 employees");
  const [location, setLocation] = useState("San Francisco, CA & Zurich");
  const [description, setDescription] = useState(
    "Autonomous industrial robotics and enterprise supply-chain systems unifying hardware telemetry with predictive operations."
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    if (current.companyName) setCompanyName(current.companyName);
    if (current.title) setTitle(current.title);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      companyName,
      title,
    };
    setCurrentUser(updated);
    setUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="company" />

        <main className="flex-1 p-6 lg:p-10 max-w-3xl">
          <div className="pb-8 mb-8 border-b border-surface-border">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-1">
              ORGANIZATION SETTINGS
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Company Profile
            </h1>
            <p className="text-xs text-brand-muted font-mono mt-1">
              Corporate entity details shared with matched creative leadership
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-surface/80 border border-surface-border rounded-xl p-6 space-y-4 shadow-subtle">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  Executive Representative Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as Industry)}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                    Company Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                  >
                    <option value="50-100 employees">50-100 employees</option>
                    <option value="100-250 employees">100-250 employees</option>
                    <option value="250-500 employees">250-500 employees</option>
                    <option value="500-1000 employees">500-1000 employees</option>
                    <option value="1000+ employees">1000+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  Headquarters & Hubs
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-sm text-brand focus:outline-none focus:border-accent/40 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium mb-1.5">
                  Mission & Commercial Context
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-surface-elevated border border-surface-border rounded-md text-xs sm:text-sm text-brand focus:outline-none focus:border-accent/40 leading-relaxed font-light"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs text-accent font-mono flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </span>
              ) : (
                <div />
              )}

              <Button type="submit" size="md">
                Save Changes
              </Button>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
}
