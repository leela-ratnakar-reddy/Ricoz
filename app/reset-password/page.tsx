"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { EditorialStar, ContourFlourish } from "@/components/ui/EditorialDecorations";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#FFF9F3] text-accent border border-[#E6D8CF] shadow-xs mb-1">
          <EditorialStar size={11} className="text-accent" />
          <span>SECURITY & ACCESS</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-espresso">
          Create New Password
        </h1>
        <p className="text-xs text-muted max-w-xs mx-auto">
          {emailParam
            ? `Setting new credentials for ${emailParam}`
            : "Choose a secure password for your RICOZ account."}
        </p>
      </div>

      <div className="bg-[#FFF9F3] border border-[#E6D8CF] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {success ? (
          <div className="space-y-5 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-normal text-espresso">
                Password successfully updated
              </h3>
              <p className="text-xs text-muted leading-relaxed font-sans max-w-sm mx-auto">
                Your new password has been set. You can now sign in to access your projects and dossiers.
              </p>
            </div>

            <div className="pt-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-accent text-[#FFF9F3] text-xs font-semibold hover:bg-[#3E1012] transition-colors shadow-md"
              >
                <span>Sign In With New Password</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                New Password (min. 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono shadow-2xs"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono shadow-2xs"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg">
                Update Account Password
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-[#E6D8CF]">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-espresso font-mono transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel and return to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <ContourFlourish className="absolute -top-16 -right-16 w-80 h-80 text-taupe/15 pointer-events-none" />
        <ContourFlourish className="absolute -bottom-16 -left-16 w-72 h-72 text-taupe/15 pointer-events-none rotate-180" />

        <Suspense fallback={<div className="font-serif text-espresso text-base">Loading security verification...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
