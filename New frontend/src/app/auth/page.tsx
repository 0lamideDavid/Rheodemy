"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Mail, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  User, 
  ShieldCheck
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BrandLogo } from "@/components/ui/BrandLogo";

const COUNTRY_CODES = [
  { code: "+234", flag: "🇳🇬", country: "Nigeria" },
  { code: "+254", flag: "🇰🇪", country: "Kenya" },
  { code: "+233", flag: "🇬🇭", country: "Ghana" },
  { code: "+27", flag: "🇿🇦", country: "South Africa" },
  { code: "+250", flag: "🇷🇼", country: "Rwanda" },
  { code: "+256", flag: "🇺🇬", country: "Uganda" },
  { code: "+1", flag: "🇺🇸", country: "International" },
  { code: "+44", flag: "🇬🇧", country: "United Kingdom" },
];

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams?.get("role") || "learner";
  const initialMode = searchParams?.get("login") === "true";
  const { t } = useLanguage();
  
  const [isLogin, setIsLogin] = useState(initialMode);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [countryCode, setCountryCode] = useState("+234");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const destination = authMethod === "phone" ? `${countryCode} ${phoneOrEmail}` : phoneOrEmail;
      localStorage.setItem("rheodemy_auth_target", destination);
      localStorage.setItem("rheodemy_auth_mode", isLogin ? "login" : "signup");
      if (fullName) {
        localStorage.setItem("rheodemy_user_name", fullName.trim());
      }
    }
    router.push(`/auth/verify?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-sun/30">
      
      {/* 🧭 NAVIGATION HEADER */}
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
            {role === "creator" ? "Educator Account" : "Learner Account"}
          </span>
        </div>
      </header>

      {/* 🏛️ MAIN AUTH CARD CONTAINER */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <div className="ledger-card p-6 sm:p-10 bg-surface w-full space-y-6 shadow-sm">
          
          {/* Header & Mode Switcher */}
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
                Interledger Identity
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                {isLogin
                  ? (t.welcomeBack || "Welcome back")
                  : role === "creator"
                  ? "Create educator account"
                  : (t.createAccount || "Create learner account")}
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                {isLogin
                  ? (t.authDescLogin || "Enter your phone or email to sign in to your wallet.")
                  : role === "creator"
                  ? "Publish courses and monetize per second directly into your wallet."
                  : (t.authDescSignup || "Verify your credentials to activate your ₦1,200 starter credits.")}
              </p>
            </div>

            {/* Mode Switch Tabs (Sign Up / Sign In) */}
            <div className="grid grid-cols-2 p-1 bg-paper rounded-lg border border-rule text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsLogin(false)}
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
                onClick={() => setIsLogin(true)}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (Sign Up only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink font-mono uppercase">
                  {t.fullName || "Full Name"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Amara Okafor"
                    className="w-full ps-9 pe-3 py-2.5 bg-paper border border-rule focus:border-forest rounded text-xs sm:text-sm text-ink placeholder:text-muted transition-colors focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Delivery Method Selector (Phone SMS/WhatsApp vs Email) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink font-mono uppercase">
                  {authMethod === "phone" ? "Mobile Phone (SMS / WhatsApp)" : "Email Address"}
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMethod(authMethod === "phone" ? "email" : "phone")}
                  className="text-[11px] text-forest hover:underline font-mono cursor-pointer"
                >
                  Use {authMethod === "phone" ? "Email" : "Phone"} instead
                </button>
              </div>

              {authMethod === "phone" ? (
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-full py-2.5 px-3 bg-paper border border-rule focus:border-forest rounded text-xs font-mono text-ink appearance-none cursor-pointer focus:outline-hidden"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phoneOrEmail}
                      onChange={(e) => setPhoneOrEmail(e.target.value)}
                      placeholder="801 234 5678"
                      className="w-full ps-9 pe-3 py-2.5 bg-paper border border-rule focus:border-forest rounded text-xs sm:text-sm text-ink font-mono placeholder:text-muted transition-colors focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="amara@example.com"
                    className="w-full ps-9 pe-3 py-2.5 bg-paper border border-rule focus:border-forest rounded text-xs sm:text-sm text-ink placeholder:text-muted transition-colors focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink font-mono uppercase">
                {t.password || "Password"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full ps-9 pe-3 py-2.5 bg-paper border border-rule focus:border-forest rounded text-xs sm:text-sm text-ink placeholder:text-muted transition-colors focus:outline-hidden"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full btn-forest text-xs py-3 px-4 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{isLogin ? (t.signIn || "Sign In") : "Send 6-Digit Verification Code"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </form>

          {/* Trust Banner */}
          <div className="p-3 bg-paper rounded border border-rule flex items-center gap-2.5 text-[11px] text-muted">
            <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
            <span>
              Interledger self-custodied wallet connection. No card details or hidden subscriptions.
            </span>
          </div>

        </div>
      </main>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center text-muted font-mono text-xs">Loading authentication...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
