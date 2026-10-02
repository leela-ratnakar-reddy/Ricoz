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
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-accent">
              ENTERPRISE ACCESS
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Sign in to RICOZ
            </h1>
            <p className="text-xs text-brand-muted max-w-xs mx-auto">
              Access your project matching pipeline or senior creative director studio.
            </p>
          </div>

          {/* Quick Demo Pre-fill helper */}
          <div className="bg-surface/80 border border-surface-border rounded-xl p-4 space-y-2 shadow-subtle">
            <div className="text-[11px] font-mono text-brand-muted uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>1-Click Demo Login</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleQuickDemoCompany}
                className="py-2.5 px-3 text-xs bg-surface-elevated border border-surface-border rounded text-brand hover:border-accent/40 transition-colors text-left"
              >
                <div className="font-medium text-brand">Enterprise Client</div>
                <div className="text-[10px] text-brand-muted font-mono truncate">Vantage Robotics</div>
              </button>
              <button
                type="button"
                onClick={handleQuickDemoDesigner}
                className="py-2.5 px-3 text-xs bg-surface-elevated border border-surface-border rounded text-brand hover:border-accent/40 transition-colors text-left"
              >
                <div className="font-medium text-brand">Creative Director</div>
                <div className="text-[10px] text-brand-muted font-mono truncate">Alex Morgan</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted mb-1.5 font-medium">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40 font-mono"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-muted font-medium">
                  Password
                </label>
                <span className="text-xs text-brand-muted hover:text-brand cursor-pointer font-mono">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-elevated border border-surface-border rounded-md text-xs text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-secondary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-surface-border text-accent accent-[#C8FF3D] focus:ring-accent"
                />
                <span className="font-mono text-xs">Remember this terminal</span>
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg">
                Sign In to RICOZ
              </Button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-surface-border text-xs text-brand-secondary font-mono">
            Don&apos;t have an enterprise account?{" "}
            <Link href="/register" className="font-semibold text-brand hover:text-accent underline transition-colors">
              Register now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
