"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Loader2,
  RotateCcw
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

function VerifyOTPContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(45);
  const [targetDestination, setTargetDestination] = useState("+234 801 234 5678");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const urlRole = searchParams?.get("role");
  const localRole = typeof window !== "undefined" ? localStorage.getItem("rheodemy_role") : null;
  const role = urlRole || localRole || "learner";

  useEffect(() => {
    // Read user destination from storage asynchronously to avoid synchronous render cascade
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("rheodemy_auth_target");
      if (saved) {
        setTargetDestination(saved);
      }
    }, 0);

    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    return () => clearTimeout(timer);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      for (let i = 0; i < pastedDigits.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedDigits[i];
      }
      setOtp(newOtp);
      const nextEmpty = newOtp.findIndex((v) => v === "");
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const cleaned = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto focus next input
    if (cleaned !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length === 6) {
      setIsLoading(true);
      // Simulate verification & Interledger channel activation
      setTimeout(() => {
        router.push(role === "creator" ? "/dashboard/creator" : "/dashboard/learner");
      }, 1200);
    }
  };

  const handleResend = () => {
    if (resendCountdown === 0) {
      setResendCountdown(60);
      alert(`A new verification code was sent to ${targetDestination}.`);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-sun/30">
      
      {/* 🧭 NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-xs border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/auth?role=${role}`}
              className="w-8 h-8 rounded-full border border-rule flex items-center justify-center hover:bg-surface text-ink transition-colors"
              title="Back to Authentication"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-4 w-px bg-rule" />
            <BrandLogo size="md" />
          </div>

          <span className="badge-category bg-forest/10 border border-forest/20 text-forest font-mono text-xs font-semibold capitalize">
            {role === "creator" ? "Educator Verification" : "Learner Verification"}
          </span>
        </div>
      </header>

      {/* 🏛️ MAIN VERIFICATION CARD */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        <div className="ledger-card p-6 sm:p-10 bg-surface w-full space-y-8 text-center shadow-sm">
          
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold block">
              Identity Confirmation
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              Verify your credentials
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-sm mx-auto">
              We&apos;ve sent a 6-digit confirmation code to{" "}
              <strong className="text-ink font-mono">{targetDestination}</strong>.
            </p>
          </div>

          {/* 6-Digit OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  aria-label={`Digit ${index + 1}`}
                  className="w-11 h-14 sm:w-13 sm:h-16 text-center font-mono text-2xl font-bold bg-paper border border-rule focus:border-forest rounded text-ink transition-colors focus:outline-hidden"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={otp.join("").length !== 6 || isLoading}
              className="w-full btn-forest text-xs py-3.5 px-4 flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Interledger Wallet...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Activate Wallet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Link */}
          <div className="pt-2 border-t border-rule text-xs text-muted flex items-center justify-between">
            <span>Didn&apos;t receive the code?</span>
            {resendCountdown > 0 ? (
              <span className="font-mono text-muted">Resend in {resendCountdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-forest font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend Code</span>
              </button>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}

export default function VerifyOTP() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center text-muted font-mono text-xs">Loading verification...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
