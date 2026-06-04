"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyOTPContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Try to get role from URL first, then fallback to localStorage, default to learner
  const urlRole = searchParams?.get("role");
  const localRole = typeof window !== 'undefined' ? localStorage.getItem('rheodemy_role') : null;
  const role = urlRole || localRole || "learner";

  useEffect(() => {
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus the last filled input or the next empty one
      const nextEmptyIndex = newOtp.findIndex((v) => v === "");
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length === 6) {
      setIsLoading(true);
      // Mock API call
      setTimeout(() => {
        router.push(role === "creator" ? "/dashboard/creator" : "/dashboard/learner");
      }, 1500);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 sm:p-10 rounded-2xl border border-white/10 relative overflow-hidden text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-3">Verify your account</h1>
          <p className="text-foreground/60 mb-8">
            We've sent a 6-digit verification code. Enter it below to confirm your identity.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={otp.join("").length !== 6 || isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify Code
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-foreground/60">
            Didn't receive the code?{" "}
            <button onClick={() => {
              setOtp(["1", "2", "3", "4", "5", "6"]);
              setTimeout(() => {
                setIsLoading(true);
                setTimeout(() => {
                  router.push(role === "creator" ? "/dashboard/creator" : "/dashboard/learner");
                }, 800);
              }, 100);
            }} className="text-primary font-semibold hover:underline">
              Auto-fill for demo
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  );
}

export default function VerifyOTP() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted">Loading verification...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
