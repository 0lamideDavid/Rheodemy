"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, UploadCloud, Banknote, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function BecomeCreatorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock API call to register creator
    setTimeout(() => {
      // Successfully registered, navigate to their new dashboard
      router.push('/dashboard/creator');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      {/* Navbar (Minimal) */}
      <header className="h-20 border-b border-white/5 flex items-center px-6 md:px-12 relative z-10">
        <Link href="/dashboard/learner" className="flex-shrink-0 flex items-center">
          <img src="/logo.png" alt="Rheodemy Logo" className="h-14 sm:h-16 w-auto object-contain drop-shadow-md" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Value Prop */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
                <Sparkles className="w-4 h-4" /> Creator Program
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Turn your knowledge into streams of income.
              </h1>
              <p className="text-lg text-muted max-w-md leading-relaxed">
                Join the world's first Web Monetization learning platform. Upload your content once, and get paid in real-time for every second a student learns.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Real-time Streaming Payments</h3>
                  <p className="text-sm text-muted mt-1">Get paid instantly via Interledger Protocol. No 30-day payout waits.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <UploadCloud className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Omni-Content Support</h3>
                  <p className="text-sm text-muted mt-1">Monetize Videos, Ebooks, and Audio Podcasts all in one place.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Retain 80% of Revenue</h3>
                  <p className="text-sm text-muted mt-1">Take home the lion's share of your earnings with our transparent split.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="bg-[#0A0A0A] p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            
            <h2 className="text-2xl font-bold mb-2 relative z-10">Creator Application</h2>
            <p className="text-muted text-sm mb-8 relative z-10">Fill out your profile to open your creator account.</p>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Display Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Alex Chen" 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Short Bio / Expertise</label>
                <textarea 
                  required
                  placeholder="I am a Senior Software Engineer specializing in TypeScript..." 
                  rows={3}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex justify-between">
                  ILP Payment Pointer
                  <span className="text-[10px] text-primary uppercase tracking-wider">Required for Payouts</span>
                </label>
                <input 
                  required
                  type="text" 
                  defaultValue="$ilp.rheodemy.com/creator_8f92a1"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-mono text-primary/80"
                />
              </div>

              <div className="pt-4 mt-6 border-t border-white/5">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-black font-bold text-base py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse flex items-center gap-2">Registering Profile...</span>
                  ) : (
                    <>
                      Register as Creator
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-center text-muted mt-4">
                By registering, you agree to the Rheodemy Terms of Service and the 80/15/5 revenue split.
              </p>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
