"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Wallet, PlayCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function BecomeLearnerPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, role: "STUDENT" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Registration failed");
      }

      const user = data.data?.user || data.user;
      const token = data.data?.token || data.token;

      login(token, user);
      router.push('/dashboard/learner');
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      {/* Navbar (Minimal) */}
      <header className="h-20 border-b border-white/5 flex items-center px-6 md:px-12 relative z-10">
        <Link href="/" className="flex-shrink-0 flex items-center">
          <img src="/logo.png" alt="Rheodemy Logo" className="h-14 sm:h-16 w-auto object-contain drop-shadow-md" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Value Prop */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
                <BookOpen className="w-4 h-4" /> Learner Program
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Learn dynamically. Pay by the second.
              </h1>
              <p className="text-lg text-muted max-w-md leading-relaxed">
                Join Rheodemy to experience courses without the upfront costs. Stream payments only when you're actively learning.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Pay-As-You-Go</h3>
                  <p className="text-sm text-muted mt-1">Connect your Interledger wallet and pay precisely for the time you learn.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Explore Freely</h3>
                  <p className="text-sm text-muted mt-1">Browse and sample thousands of courses without committing to hefty subscription fees.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Secure Learning</h3>
                  <p className="text-sm text-muted mt-1">Your payments are paused the moment you stop watching or reading.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="bg-[#0A0A0A] p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            
            <h2 className="text-2xl font-bold mb-2 relative z-10">Learner Account</h2>
            <p className="text-muted text-sm mb-8 relative z-10">Create your account to start learning today.</p>

            {error && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center relative z-10">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="flex gap-3">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <input 
                    required
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex" 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <input 
                    required
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Chen" 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com" 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50"
                />
              </div>

              <div className="pt-4 mt-6 border-t border-white/5">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-black font-bold text-base py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse flex items-center gap-2">Creating Account...</span>
                  ) : (
                    <>
                      Register as Learner
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-center text-muted mt-4">
                By registering, you agree to the Rheodemy Terms of Service.
              </p>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
