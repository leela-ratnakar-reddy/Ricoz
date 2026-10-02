"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { setCurrentUser } from "@/lib/storage";
import { User } from "@/types";
import { Building2, UserCheck } from "lucide-react";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as "company" | "designer") || "company";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"company" | "designer">(defaultRole);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const initials = fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || (role === "company" ? "CO" : "CD");

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: fullName || (role === "company" ? "Alex Vance" : "Alex Morgan"),
      email: email || "user@enterprise.com",
      role,
      avatar: initials,
      title: role === "company" ? "VP of Product & Brand" : "Creative Director",
      companyName: role === "company" ? companyName || "Enterprise Client" : undefined,
    };

    setCurrentUser(newUser);

    if (role === "company") {
      router.push("/dashboard/company");
    } else {
      router.push("/dashboard/designer");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-accent">
              NETWORK REGISTRATION
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Create an enterprise account
            </h1>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">
              Join RICOZ to connect with top-tier creative leadership or showcase your senior portfolio.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* ACCOUNT TYPE SELECTION */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-2 font-medium">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("company")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === "company"
                      ? "border-accent bg-surface-elevated ring-1 ring-accent"
                      : "border-surface-border bg-surface-elevated/40 hover:border-surface-borderLight"
                  }`}
                >
                  <Building2
                    className={`w-5 h-5 mb-2 ${
                      role === "company" ? "text-accent" : "text-brand-muted"
                    }`}
                  />
                  <div className="font-medium text-xs text-brand">Company / Enterprise</div>
                  <div className="text-[11px] text-brand-muted mt-0.5 font-light">
                    Hiring creative directors & brand teams
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("designer")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === "designer"
                      ? "border-accent bg-surface-elevated ring-1 ring-accent"
                      : "border-surface-border bg-surface-elevated/40 hover:border-surface-borderLight"
                  }`}
                >
                  <UserCheck
                    className={`w-5 h-5 mb-2 ${
                      role === "designer" ? "text-accent" : "text-brand-muted"
                    }`}
                  />
                  <div className="font-medium text-xs text-brand">Creative Professional</div>
                  <div className="text-[11px] text-brand-muted mt-0.5 font-light">
                    Creative Directors, Designers & Strategists
                  </div>
                </button>
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@company.com"
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40 font-mono"
                />
              </div>

              {role === "company" && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Vantage Robotics"
                    className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg">
                Complete Registration & Open Dashboard
              </Button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-surface-border text-xs text-brand-secondary font-mono">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand hover:text-accent underline transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-12 text-center text-xs font-mono text-brand-muted">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
