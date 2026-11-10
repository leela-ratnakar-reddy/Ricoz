"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, Mail, AlertCircle, Sparkles, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { demoLogin, getDemoSession, DEMO_PRESET_ACCOUNTS } from "@/lib/demo";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");

  const [email, setEmail] = useState("aadinathachary@gmail.com");
  const [password, setPassword] = useState("Ricozhoo@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in with a demo session, redirect to /admin automatically
  useEffect(() => {
    const session = getDemoSession();
    if (session) {
      const destination = fromParam && fromParam.startsWith("/admin") && fromParam !== "/admin/login"
        ? fromParam
        : "/admin";
      router.push(destination);
    }
  }, [router, fromParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = demoLogin(email, password);
      if (!result.success || !result.user) {
        setError(result.error || "Simulated login failed. Please select a demo account.");
        setLoading(false);
        return;
      }

      const targetDestination =
        fromParam && fromParam.startsWith("/admin") && fromParam !== "/admin/login"
          ? fromParam
          : "/admin";

      router.push(targetDestination);
      router.refresh();
    } catch (err) {
      console.error("Demo login error:", err);
      setError("An unexpected error occurred during demo login.");
      setLoading(false);
    }
  };

  const handleQuickAccess = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("Ricozhoo@123");
    setError(null);
    setLoading(true);

    const result = demoLogin(presetEmail, "Ricozhoo@123");
    if (result.success) {
      const targetDestination =
        fromParam && fromParam.startsWith("/admin") && fromParam !== "/admin/login"
          ? fromParam
          : "/admin";
      router.push(targetDestination);
      router.refresh();
    } else {
      setError(result.error || "Failed to log in with selected demo account.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080C] text-[#F5F5F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-red-600 selection:text-white">
      {/* Background ambient subtle red radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-900/30">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white font-sans">
            RICOZ<span className="text-red-500 font-mono text-xs ml-1.5 px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/40">ADMIN</span>
          </span>
        </div>

        <h2 className="text-center text-xl font-bold tracking-tight text-slate-200">
          Operations & Platform Control
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Internal operations control and team workflow management
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Prominent Demo Mode Notice */}
        <div className="mb-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-2.5 text-xs text-amber-200 shadow-lg">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-300 uppercase tracking-wider font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              DEMO MODE — Frontend Prototype
            </div>
            <p className="text-[11px] leading-relaxed text-amber-200/90">
              This admin panel runs entirely in the browser with realistic sample data stored in LocalStorage. No backend or server database is required.
            </p>
          </div>
        </div>

        <div className="bg-[#0E1118] py-8 px-6 shadow-2xl rounded-2xl border border-white/10 sm:px-8 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Demo Access Shortcuts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-red-400 font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Quick 1-Click Demo Access
              </span>
              <span className="text-[10px] text-slate-500">Select any role</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_PRESET_ACCOUNTS.slice(0, 3).map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickAccess(acc.email)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-red-500/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${acc.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                      {acc.avatar}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({acc.role})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              or enter credentials manually
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
                  placeholder="aadinathachary@gmail.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Demo Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium text-xs shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed uppercase font-mono tracking-wider"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entering Control Center...</span>
                </>
              ) : (
                <span>Access Management Console (Demo)</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 space-y-2 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              Demo Access &bull; Stored in browser LocalStorage &bull; No server needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080C] text-slate-400 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
