"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { EditorialStar, ContourFlourish } from "@/components/ui/EditorialDecorations";
import { AUTH_CHANGE_EVENT, useAuth } from "@/lib/auth/AuthContext";

function resolveTargetDestination(
  fromParam: string | null,
  accountType?: string | null,
  fallbackUrl?: string | null
): string {
  // 1. If a valid, safe 'from' parameter was provided
  if (
    fromParam &&
    fromParam.startsWith("/") &&
    !fromParam.startsWith("//") &&
    !fromParam.startsWith("/login") &&
    !fromParam.startsWith("/signup") &&
    !fromParam.startsWith("/forgot-password") &&
    !fromParam.startsWith("/reset-password")
  ) {
    // Prevent cross-role workspace redirection loops
    if (accountType === "talent" && fromParam.startsWith("/dashboard/company")) {
      return "/dashboard/designer";
    }
    if (accountType === "company" && fromParam.startsWith("/dashboard/designer")) {
      return "/dashboard/company";
    }
    if (accountType === "admin") {
      return fromParam.startsWith("/admin") ? fromParam : "/admin";
    }
    return fromParam;
  }

  // 2. Role-specific authoritative destination
  if (accountType === "admin") return "/admin";
  if (accountType === "talent") return "/dashboard/designer";
  if (accountType === "company") return "/dashboard/company";

  return fallbackUrl || "/dashboard/company";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { user: authUser, accountType: authAccountType, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated with a valid session, navigate directly to dashboard
  React.useEffect(() => {
    if (!authLoading && authUser) {
      const destination = resolveTargetDestination(from, authUser.accountType || authAccountType);
      window.location.href = destination;
    }
  }, [authLoading, authUser, authAccountType, from]);

  // If email verification is required on login (HTTP 403)
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Please provide both your work email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 403 || data.requireEmailVerification) {
          setNeedsVerification(true);
          setError(data.error || "Please verify your email address to access your workspace.");
        } else {
          setError(data.error || "Invalid email or password. Please verify your credentials.");
        }
        setLoading(false);
        return;
      }

      // Notify AuthContext and execute definitive browser navigation
      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
      const targetUrl = resolveTargetDestination(from, data.accountType, data.redirectUrl);
      window.location.href = targetUrl;
    } catch (err: any) {
      console.error("Sign-in request failed:", err);
      setError("Network error while connecting to authentication service. Please try again.");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying) return;
    setError(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Invalid or expired code. Please try again.");
        setVerifying(false);
        return;
      }

      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
      const targetUrl = resolveTargetDestination(from, data.accountType, data.redirectUrl);
      window.location.href = targetUrl;
    } catch (err) {
      console.error("Verification submit error:", err);
      setError("Failed to verify code. Please check your connection.");
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setResendStatus("Resending code...");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatus("A new verification code has been dispatched to your email.");
      } else {
        setError(data.error || "Could not resend code. Please try again in a few moments.");
        setResendStatus(null);
      }
    } catch {
      setError("Network error while resending code.");
      setResendStatus(null);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#FFF9F3] text-accent border border-[#E6D8CF] shadow-xs mb-1">
          <EditorialStar size={11} className="text-accent" />
          <span>ENTERPRISE ACCESS</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-espresso">
          {needsVerification ? "Verify Email" : "Sign in to RICOZ"}
        </h1>
        <p className="text-xs text-muted max-w-xs mx-auto font-sans">
          {needsVerification
            ? `Enter the 6-digit code dispatched to ${email}`
            : "Access your design mandates, project pipeline, and specialist dossiers."}
        </p>
      </div>

      <div className="bg-[#FFF9F3] border border-[#E6D8CF] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono leading-relaxed">
            {error}
          </div>
        )}

        {needsVerification ? (
          /* VERIFICATION CODE FORM */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 rounded-2xl bg-white border border-[#E6D8CF] space-y-2 text-center">
              <ShieldCheck className="w-8 h-8 text-accent mx-auto" />
              <div className="text-xs font-serif font-bold text-espresso">Email Verification Required</div>
              <p className="text-xs text-muted font-sans leading-relaxed">
                Your account email has not been verified yet. Enter the 6-digit code sent to{" "}
                <span className="font-mono text-espresso font-semibold">{email}</span>.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ""))}
                placeholder="123456"
                className="w-full text-center text-xl tracking-widest px-4 py-3 bg-white border border-[#E6D8CF] rounded-xl text-espresso font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent shadow-2xs"
              />
            </div>

            {resendStatus && (
              <div className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center">
                {resendStatus}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={verifying}>
              {verifying ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-[#E6D8CF]">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-accent hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend code</span>
              </button>

              <button
                type="button"
                onClick={() => setNeedsVerification(false)}
                className="text-muted hover:text-espresso"
              >
                Back to credentials
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD SIGN-IN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                Work Email Address
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
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted font-medium">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent font-sans hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono shadow-2xs"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-espresso"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer font-sans">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E6D8CF] text-accent focus:ring-accent"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In to Workspace"}
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-[#E6D8CF]">
              <span className="text-xs text-muted font-sans">
                New to the RICOZ collective?{" "}
                <Link href="/signup" className="text-accent font-bold font-mono hover:underline">
                  Create an account &rarr;
                </Link>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
        <ContourFlourish className="absolute -top-16 -right-16 w-80 h-80 text-taupe/15 pointer-events-none" />
        <ContourFlourish className="absolute -bottom-16 -left-16 w-72 h-72 text-taupe/15 pointer-events-none rotate-180" />

        <Suspense fallback={<div className="text-center text-xs font-mono text-muted py-12">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
