"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import {
  setCurrentUser,
  DEFAULT_USER,
  DEFAULT_DESIGNER_USER,
} from "@/lib/storage";
import { Lock, Mail, Sparkles } from "lucide-react";
import { EditorialStar, ContourFlourish } from "@/components/ui/EditorialDecorations";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alex@vantagerobotics.com");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("morgan") || email.includes("designer")) {
      setCurrentUser(DEFAULT_DESIGNER_USER);
      router.push("/dashboard/designer");
    } else {
      setCurrentUser(DEFAULT_USER);
      router.push("/dashboard/company");
    }
  };

  const handleQuickDemoCompany = () => {
    setCurrentUser(DEFAULT_USER);
    router.push("/dashboard/company");
  };

  const handleQuickDemoDesigner = () => {
    setCurrentUser(DEFAULT_DESIGNER_USER);
    router.push("/dashboard/designer");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
        <ContourFlourish className="absolute -top-16 -right-16 w-80 h-80 text-taupe/15 pointer-events-none" />
        <ContourFlourish className="absolute -bottom-16 -left-16 w-72 h-72 text-taupe/15 pointer-events-none rotate-180" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#FFF9F3] text-accent border border-[#E6D8CF] shadow-xs mb-1">
              <EditorialStar size={11} className="text-accent" />
              <span>ENTERPRISE ACCESS</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-espresso">
              Sign in to RICOZ
            </h1>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Access your project matching pipeline or senior creative studio.
            </p>
          </div>

          <div className="bg-[#FFF9F3] border border-[#E6D8CF] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Quick Demo Pre-fill helper */}
            <div className="bg-white border border-[#E6D8CF] rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="text-[11px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>1-Click Demo Login</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleQuickDemoCompany}
                  className="py-2.5 px-3 text-xs bg-[#FFF9F3] border border-[#E6D8CF] rounded-xl text-espresso hover:border-accent/40 transition-colors text-left"
                >
                  <div className="font-semibold text-espresso">Enterprise Client</div>
                  <div className="text-[10px] text-taupe font-mono truncate">Vantage Robotics</div>
                </button>
                <button
                  type="button"
                  onClick={handleQuickDemoDesigner}
                  className="py-2.5 px-3 text-xs bg-[#FFF9F3] border border-[#E6D8CF] rounded-xl text-espresso hover:border-accent/40 transition-colors text-left"
                >
                  <div className="font-semibold text-espresso">Creative Director</div>
                  <div className="text-[10px] text-taupe font-mono truncate">Alex Morgan</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono shadow-2xs"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted font-medium">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted hover:text-accent font-mono transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#E6D8CF] text-accent accent-[#541719] focus:ring-accent"
                  />
                  <span className="font-mono text-xs">Remember this device</span>
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" fullWidth size="lg">
                  Sign In to RICOZ
                </Button>
              </div>
            </form>

            <div className="text-center pt-4 border-t border-[#E6D8CF] text-xs text-muted font-mono">
              Don&apos;t have an enterprise account?{" "}
              <Link href="/register" className="font-semibold text-espresso hover:text-accent underline transition-colors">
                Register now
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
