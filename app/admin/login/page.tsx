"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ricoz.io");
  const [password, setPassword] = useState("AdminRicoz2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Network or server connection failed. Please try again.");
      setLoading(false);
    }
  };

  const handleQuickFill = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("AdminRicoz2026!");
    setError(null);
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
          Authorized personnel only. All access and actions are strictly audited.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0E1118] py-8 px-6 shadow-2xl rounded-2xl border border-white/10 sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Role Fill Presets for Local Testing / Operations */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3 h-3 text-red-400" />
              <span>Authorized Profiles</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@ricoz.io")}
                className="text-left p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-colors"
              >
                <div className="text-[11px] font-semibold text-slate-200">Super Admin</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">admin@ricoz.io</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("elena.ramos@ricoz.io")}
                className="text-left p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-colors"
              >
                <div className="text-[11px] font-semibold text-slate-200">Ops Admin</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">elena.ramos@ricoz.io</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("kai.chen@ricoz.io")}
                className="text-left p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-colors"
              >
                <div className="text-[11px] font-semibold text-slate-200">Tech Lead</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">kai.chen@ricoz.io</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("audit@ricoz.io")}
                className="text-left p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-colors"
              >
                <div className="text-[11px] font-semibold text-slate-200">Auditor</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">audit@ricoz.io</div>
              </button>
            </div>
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
                  placeholder="admin@ricoz.io"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Security Password
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
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-900/30"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In To Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-white/5">
            <Link
              href="/"
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              &larr; Return to RICOZ Public Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
