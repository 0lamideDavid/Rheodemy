"use client";

import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, Lock, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams?.get("role") || "learner";
  const { t } = useLanguage();
  
  const [isLogin, setIsLogin] = useState(true);
  const [useEmail, setUseEmail] = useState(true);

  useEffect(() => {
    if (searchParams?.get("login") === "true") {
      setIsLogin(true);
    }
  }, [searchParams]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login: loginContext } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      
      let payload;
      if (isLogin) {
        payload = { email, password };
      } else {
        const backendRole = role === "creator" ? "INSTRUCTOR" : "STUDENT";
        payload = { firstName: firstName || "Unknown", lastName: lastName || "Unknown", email, password, role: backendRole };
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Authentication failed");
      }

      // The backend returns the user object inside 'data.data' per the standard response format
      const user = data.data?.user || data.user;
      const token = data.data?.token || data.token;

      loginContext(token, user);

      if (!isLogin) {
        router.push("/auth/verify?role=" + role);
      } else {
        if (!user.role) {
          router.push("/role");
        } else {
          // Map backend roles (STUDENT/INSTRUCTOR) to frontend routes (learner/creator)
          const route = user.role === "INSTRUCTOR" ? "creator" : "learner";
          router.push(`/dashboard/${route}`);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {isLogin ? t.welcomeBack : t.createAccount}
              </h1>
              <p className="text-foreground/60">
                {isLogin ? t.authDescLogin : t.authDescSignup}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="flex gap-3">
                  <div className="space-y-1 flex-1">
                    <label className="text-sm font-medium text-foreground/80 pl-1">{t.firstName || "First Name"}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-foreground/40" />
                      </div>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-foreground/40"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <label className="text-sm font-medium text-foreground/80 pl-1">{t.lastName || "Last Name"}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-foreground/40" />
                      </div>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-foreground/40"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-sm font-medium text-foreground/80">
                    {useEmail ? t.emailAddr : t.phoneNum}
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseEmail(!useEmail)}
                    className="text-xs text-primary hover:underline"
                  >
                    Use {useEmail ? "Phone" : "Email"} instead
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {useEmail ? (
                      <Mail className="w-5 h-5 text-foreground/40" />
                    ) : (
                      <Phone className="w-5 h-5 text-foreground/40" />
                    )}
                  </div>
                  <input
                    type={useEmail ? "email" : "tel"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-foreground/40"
                    placeholder={useEmail ? "you@example.com" : "+1 234 567 890"}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80 pl-1">{t.password}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-foreground/40" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background/50 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-foreground/40"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? t.signIn : t.continueVerify}
                      <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-foreground/60 text-sm">
                {isLogin ? (
                  <>
                    {t.dontHaveAcc.split("?")[0]}?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/role")}
                      className="text-primary font-semibold hover:underline focus:outline-none"
                    >
                      {t.dontHaveAcc.split("?")[1] || "Sign up"}
                    </button>
                  </>
                ) : (
                  <>
                    {t.alreadyHaveAcc.split("?")[0]}?{" "}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-primary font-semibold hover:underline focus:outline-none"
                    >
                      {t.alreadyHaveAcc.split("?")[1] || "Log in"}
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted">Loading authentication...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
