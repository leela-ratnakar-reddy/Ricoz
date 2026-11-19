"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import {
  Building2,
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { EditorialStar, ContourFlourish } from "@/components/ui/EditorialDecorations";
import { AUTH_CHANGE_EVENT } from "@/lib/auth/AuthContext";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as "talent" | "company") || "company";

  // Form State
  const [accountType, setAccountType] = useState<"talent" | "company">(initialType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification Step State
  const [verificationPending, setVerificationPending] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (!acceptTerms) {
      setError("You must agree to the Terms of Service and Privacy Notice to proceed.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        accountType,
        email: email.trim().toLowerCase(),
        password,
        acceptTerms,
      };

      if (accountType === "talent") {
        payload.fullName = fullName.trim();
      } else {
        payload.companyName = companyName.trim();
        payload.contactName = contactName.trim();
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Registration failed. Please check your details.");
        setLoading(false);
        return;
      }

      // If email verification is required (default on InsForge)
      if (data.requireEmailVerification) {
        setRegisteredEmail(data.email || email.trim().toLowerCase());
        setVerificationPending(true);
      } else if (data.redirectUrl) {
        window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
        router.push(data.redirectUrl);
      }
    } catch (err: any) {
      console.error("Registration submit error:", err);
      setError("Network or connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setError("Please enter the verification code sent to your email.");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail,
          otp: cleanOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid verification code. Please check your inbox and try again.");
        setVerifying(false);
        return;
      }

      // Notify AuthContext and redirect to appropriate workspace
      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
      const targetUrl = data.redirectUrl || (accountType === "talent" ? "/dashboard/designer" : "/dashboard/company");
      router.push(targetUrl);
    } catch (err: any) {
      console.error("Verification submit error:", err);
      setError("Failed to verify code. Please check your internet connection.");
    } finally {
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
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatus("A fresh verification code has been dispatched to your email.");
      } else {
        setError(data.error || "Could not resend code. Please wait before retrying.");
        setResendStatus(null);
      }
    } catch {
      setError("Network error while resending code.");
      setResendStatus(null);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6 relative z-10">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#FFF9F3] text-accent border border-[#E6D8CF] shadow-xs mb-1">
          <EditorialStar size={11} className="text-accent" />
          <span>NETWORK REGISTRATION</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-espresso">
          {verificationPending ? "Verify Your Email" : "Create an Enterprise Account"}
        </h1>
        <p className="text-xs text-muted max-w-sm mx-auto font-sans">
          {verificationPending
            ? `Enter the 6-digit confirmation code dispatched to ${registeredEmail}`
            : "Select your role in the RICOZ ecosystem to establish your verified profile."}
        </p>
      </div>

      <div className="bg-[#FFF9F3] border border-[#E6D8CF] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* ERROR ALERT */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono leading-relaxed">
            {error}
          </div>
        )}

        {/* VERIFICATION STEP */}
        {verificationPending ? (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="p-4 rounded-2xl bg-white border border-[#E6D8CF] space-y-2 text-center">
              <ShieldCheck className="w-8 h-8 text-accent mx-auto" />
              <div className="text-xs font-serif font-bold text-espresso">Security Verification</div>
              <p className="text-xs text-muted font-sans leading-relaxed">
                We sent a 6-digit verification code to{" "}
                <span className="font-mono text-espresso font-semibold">{registeredEmail}</span>.
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
              {verifying ? "Verifying Credentials..." : "Complete Registration & Enter Workspace"}
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
                onClick={() => setVerificationPending(false)}
                className="text-muted hover:text-espresso"
              >
                Change email
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-5">
            {/* ACCOUNT TYPE SELECTION */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-2 font-medium">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("talent")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    accountType === "talent"
                      ? "border-2 border-accent bg-white shadow-xs"
                      : "border-[#E6D8CF] bg-white/70 hover:border-accent/40"
                  }`}
                >
                  <Sparkles
                    className={`w-5 h-5 mb-2 ${
                      accountType === "talent" ? "text-accent" : "text-taupe"
                    }`}
                  />
                  <div className="font-serif font-bold text-xs text-espresso">Join as Talent</div>
                  <div className="text-[11px] text-muted mt-0.5 font-sans leading-tight">
                    Creative Directors & Senior Brand Specialists
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("company")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    accountType === "company"
                      ? "border-2 border-accent bg-white shadow-xs"
                      : "border-[#E6D8CF] bg-white/70 hover:border-accent/40"
                  }`}
                >
                  <Building2
                    className={`w-5 h-5 mb-2 ${
                      accountType === "company" ? "text-accent" : "text-taupe"
                    }`}
                  />
                  <div className="font-serif font-bold text-xs text-espresso">Register as Company</div>
                  <div className="text-[11px] text-muted mt-0.5 font-sans leading-tight">
                    Enterprise Brands & Mandate Leaders
                  </div>
                </button>
              </div>
            </div>

            {/* DYNAMIC FIELDS */}
            {accountType === "talent" ? (
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-sans shadow-2xs"
                    placeholder="e.g. Elena Rostova"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                    Enterprise Organization / Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-sans shadow-2xs"
                      placeholder="e.g. Geneva Horology Group"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                    Primary Contact Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-sans shadow-2xs"
                      placeholder="e.g. Alex Vance"
                    />
                  </div>
                </div>
              </>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                {accountType === "company" ? "Corporate Work Email" : "Professional Email"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono shadow-2xs"
                  placeholder={accountType === "company" ? "lead@company.com" : "specialist@studio.com"}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                Password (min. 8 characters)
              </label>
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

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5 font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#E6D8CF] rounded-xl text-xs text-espresso placeholder-[#76665F]/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono shadow-2xs"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-espresso"
                  aria-label="Toggle password confirmation visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* TERMS & PRIVACY */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-muted font-sans cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#E6D8CF] text-accent focus:ring-accent"
                />
                <span className="leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-accent underline font-semibold hover:text-[#3E1012]">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-accent underline font-semibold hover:text-[#3E1012]">
                    Privacy Notice
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? "Establishing Profile..." : accountType === "talent" ? "Join as Talent" : "Register as Company"}
              </Button>
            </div>

            {/* SIGN IN LINK */}
            <div className="text-center pt-3 border-t border-[#E6D8CF]">
              <span className="text-xs text-muted font-sans">
                Already registered with RICOZ?{" "}
                <Link href="/login" className="text-accent font-bold font-mono hover:underline">
                  Sign in &rarr;
                </Link>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-[#FFF9F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
        <ContourFlourish className="absolute -top-16 -right-16 w-80 h-80 text-taupe/15 pointer-events-none" />
        <ContourFlourish className="absolute -bottom-16 -left-16 w-72 h-72 text-taupe/15 pointer-events-none rotate-180" />

        <Suspense fallback={<div className="text-center text-xs font-mono text-muted py-12">Loading registration...</div>}>
          <SignupForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
