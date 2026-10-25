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
import { EditorialStar, ContourFlourish } from "@/components/ui/EditorialDecorations";

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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
        <ContourFlourish className="absolute -top-16 -right-16 w-80 h-80 text-taupe/15 pointer-events-none" />
        <ContourFlourish className="absolute -bottom-16 -left-16 w-72 h-72 text-taupe/15 pointer-events-none rotate-180" />

        <div className="w-full max-w-lg space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#FFF9F3] text-accent border border-[#E6D8CF] shadow-xs mb-1">
              <EditorialStar size={11} className="text-accent" />
              <span>NETWORK REGISTRATION</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-espresso">
              Create an enterprise account
            </h1>
            <p className="text-xs text-muted max-w-sm mx-auto font-sans">
              Join RICOZ to connect with top-tier creative leadership or showcase your senior portfolio.
            </p>
          </div>

          <div className="bg-[#FFF9F3] border border-[#E6D8CF] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* ACCOUNT TYPE SELECTION */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-2 font-medium">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("company")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      role === "company"
                        ? "border-2 border-accent bg-white shadow-xs"
                        : "border-[#E6D8CF] bg-white/70 hover:border-accent/40"
                    }`}
                  >
                    <Building2
                      className={`w-5 h-5 mb-2 ${
                        role === "company" ? "text-accent" : "text-taupe"
                      }`}
                    />
                    <div className="font-semibold text-xs text-espresso">Company / Enterprise</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      Hiring creative directors & brand teams
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("designer")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      role === "designer"
                        ? "border-2 border-accent bg-white shadow-xs"
                        : "border-[#E6D8CF] bg-white/70 hover:border-accent/40"
                    }`}
                  >
                    <UserCheck
                      className={`w-5 h-5 mb-2 ${
                        role === "designer" ? "text-accent" : "text-taupe"
                      }`}
                    />
                    <div className="font-semibold text-xs text-espresso">Creative Professional</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      Creative Directors & Specialists
                    </div>
                  </button>
                </div>
              </div>

              {/* FORM FIELDS */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-sans shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@company.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono shadow-2xs"
                  />
                </div>

                {role === "company" && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Vantage Robotics"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-sans shadow-2xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" fullWidth size="lg">
                  Complete Registration & Open Dashboard
                </Button>
              </div>
            </form>

            <div className="text-center pt-4 border-t border-[#E6D8CF] text-xs text-muted font-mono">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-espresso hover:text-accent underline transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-12 text-center text-xs font-mono text-muted">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
