"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle, Wallet, Layers, ShieldCheck, Sparkles, ChevronRight, BookOpen, Headphones } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MarketingLandingPage() {
  const { t } = useLanguage();
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col relative overflow-hidden font-sans selection:bg-primary/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="absolute top-0 inset-x-0 h-24 z-50 flex items-center justify-between px-6 md:px-12 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center group">
          <img src="/logo.png" alt="Rheodemy Logo" className="h-10 sm:h-14 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform" />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/auth" className="text-sm font-semibold text-muted hover:text-foreground transition-colors hidden sm:block">
            {t.logIn}
          </Link>
          <Link href="/become-creator" className="text-sm font-bold text-foreground bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full transition-all flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> {t.becomeCreator}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-32 sm:pt-48 pb-20 relative z-10 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live on Interledger Testnet
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
            {t.landingTitle} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{t.landingTitleHighlight}</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            {t.landingSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link href="/onboarding" className="w-full sm:w-auto px-8 py-4 bg-primary text-black font-bold text-lg rounded-full hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,212,200,0.3)]">
              {t.landingCTA} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
            <button 
              onClick={() => setShowDemoVideo(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 text-foreground font-bold text-lg rounded-full hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 text-primary" /> {t.landingWatchDemo}
            </button>
          </div>
        </div>

        {/* Product Visual Mockup */}
        <div className="w-full max-w-5xl mx-auto mt-24 relative animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          <div className="absolute -inset-1 bg-gradient-to-b from-primary/30 to-transparent rounded-[2.5rem] blur-xl opacity-50" />
          <div className="relative rounded-[2rem] bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl shadow-black aspect-[16/9] md:aspect-[21/9] flex items-center justify-center">
            {/* Abstract dashboard representation */}
            <div className="absolute top-0 inset-x-0 h-12 border-b border-white/5 bg-black/50 flex items-center px-6 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="p-8 text-center mt-12">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
                <Wallet className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Streaming $0.0012 / sec</h3>
              <p className="text-muted mt-2">To: $ilp.rheodemy.com/creator_8f92a1</p>
              
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-sm">
                  <PlayCircle className="w-4 h-4 text-blue-400" /> Video
                </div>
                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Ebook
                </div>
                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-sm">
                  <Headphones className="w-4 h-4 text-purple-400" /> Audio
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How it Works / Value Proposition */}
      <section className="py-24 sm:py-32 relative z-10 px-6 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">{t.howItWorks}</h2>
            <p className="text-lg text-muted">{t.howItWorksDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feature1Title}</h3>
              <p className="text-muted leading-relaxed">
                {t.feature1Desc}
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feature2Title}</h3>
              <p className="text-muted leading-relaxed">
                {t.feature2Desc}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feature3Title}</h3>
              <p className="text-muted leading-relaxed">
                {t.feature3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Upsell CTA */}
      <section className="py-24 relative z-10 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] p-10 sm:p-16 text-center border border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">{t.creatorSectionTitle}</h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-10">
              {t.creatorSectionDesc}
            </p>
            <Link href="/become-creator" className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background font-bold text-lg rounded-full hover:opacity-90 hover:scale-105 transition-all shadow-xl">
              {t.creatorSectionBtn} <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Rheodemy Logo" className="h-8 w-auto opacity-70" />
            <span className="text-muted text-sm font-medium">© 2026 Rheodemy. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Cinematic Walkthrough Video Modal */}
      {showDemoVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                Rheodemy MVP Product Walkthrough
              </h3>
              <button 
                onClick={() => setShowDemoVideo(false)}
                className="text-muted hover:text-foreground text-sm font-semibold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Video Content */}
            <div className="aspect-video bg-black flex items-center justify-center p-2">
              <video 
                className="w-full h-full rounded-2xl object-cover" 
                src="https://www.w3schools.com/html/mov_bbb.mp4" 
                controls 
                autoPlay
                playsInline
              />
            </div>

            {/* Modal Footer Info */}
            <div className="p-6 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted">
              <p>Demonstrating: Pay-by-the-second Ebook reading, active scroll detection, and 80/15/5 smart escrow splits.</p>
              <Link 
                href="/onboarding" 
                className="px-6 py-2.5 bg-primary text-black font-bold rounded-full hover:bg-primary/90 hover:scale-105 transition-all text-center"
                onClick={() => setShowDemoVideo(false)}
              >
                {t.landingCTA}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
