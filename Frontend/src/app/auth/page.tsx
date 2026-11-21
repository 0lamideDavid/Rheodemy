"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { BrandLogo } from "@/components/ui/BrandLogo";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams?.get("role") || "learner";
  const initialMode = searchParams?.get("login") === "true";
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(initialMode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCreatorSignup = role === "creator";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const account = isLogin
        ? await login(email.trim(), password)
        : await register({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            role: isCreatorSignup ? "INSTRUCTOR" : "STUDENT",
          });

      router.push(
        account.role === "INSTRUCTOR" || account.role === "ADMIN"
          ? "/dashboard/creator"
          : "/dashboard/learner"
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-sun/30">
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-xs border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/role"
              className="w-8 h-8 rounded-full border border-rule flex items-center justify-center hover:bg-surface text-ink transition-colors"
              title="Back to Role Selection"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-4 w-px bg-rule" />
            <BrandLogo size="md" />
          </div>

          <span className="badge-category bg-forest/10 border border-forest/20 text-forest font-mono text-xs font-semibold capitalize">
            {isCreatorSignup ? "Educator Account" : "Learner Account"}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <div className="ledger-card p-6 sm:p-10 bg-surface w-full space-y-6 shadow-sm">
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
                Interledger Identity
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                {isLogin
                  ? "Welcome back"
                  : isCreatorSignup
                  ? "Create educator account"
                  : "Create learner account"}
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                {isLogin
                  ? "Sign in with the email and password tied to your Rheodemy wallet."
                  : isCreatorSignup
                  ? "Publish courses and stream earnings directly into your wallet."
                  : "Your account is created with a real Rheodemy wallet and USD balance."}
              </p>
            </div>

            <div className="grid grid-cols-2 p-1 bg-paper rounded-lg border border-rule text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className={`py-2 rounded-[5px] transition-all cursor-pointer ${
                  !isLogin
                    ? "bg-surface text-ink shadow-xs border border-rule"
                    : "text-muted hover:text-ink"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={`py-2 rounded-[5px] transition-all cursor-pointer ${
                  isLogin
                    ? "bg-surface text-ink shadow-xs border border-rule"
                    : "text-muted hover:text-ink"
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink font-mono uppercase">
                    First name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Amara"
                      className="w-full ps-9 pe-3 py-2.5 bg-paper border border-rule focus:border-forest rounded text-xs sm:text-sm text-ink placeholder:text-muted transition-colors focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink font-mono uppercase">
                    Last name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Okafor"
                      className="w-full ps-9 pe-3 py-2.5 bg-paper border border-rule focus:border-forest rounded text-xs sm:text-sm text-ink placeholder:text-muted transition-colors focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink font-mono uppercase">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amara@example.com"
                  className="w-full ps-9 pe-3 py-2.5 bg-paper border border-rule focus:border-forest rounded text-xs sm:text-sm text-ink placeholder:text-muted transition-colors focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink font-mono uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full ps-9 pe-3 py-2.5 bg-paper border border-rule focus:border-forest rounded text-xs sm:text-sm text-ink placeholder:text-muted transition-colors focus:outline-hidden"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded border border-clay/30 bg-clay/5 text-[11px] text-clay"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-forest text-xs py-3 px-4 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>
                  {isSubmitting
                    ? "Connecting to Rheodemy…"
                    : isLogin
                    ? "Sign In"
                    : "Create Account"}
                </span>
                {!isSubmitting && <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              </button>
            </div>
          </form>

          <div className="p-3 bg-paper rounded border border-rule flex items-center gap-2.5 text-[11px] text-muted">
            <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
            <span>
              Your password is hashed on the Rheodemy server. Wallet balances and
              payment sessions are stored in the platform database.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center text-muted font-mono text-xs">
          Loading authentication...
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
