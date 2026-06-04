"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Globe, CheckCircle2, ChevronRight, Coins, HeartHandshake, BookOpen, Clock, Activity, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage, LanguageCode } from "@/context/LanguageContext";

const languages = [
  { code: "en", name: "English", region: "Global" },
  { code: "fr", name: "Français", region: "West & Central Africa" },
  { code: "pt", name: "Português", region: "Brazil, Angola, Cape Verde" },
  { code: "es", name: "Español", region: "Latin America" },
  { code: "ar", name: "العربية", region: "North Africa & Middle East" },
  { code: "sw", name: "Kiswahili", region: "East Africa" },
];

export default function OnboardingWalkthrough() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<LanguageCode | null>(null);

  // Micro-monetization ticker simulation
  const [demoBalance, setDemoBalance] = useState(0.0000);
  const [isTickActive, setIsTickActive] = useState(false);

  useEffect(() => {
    // Automatically pre-fill selected language if it matches context
    if (language) {
      setSelectedLang(language);
    }
  }, [language]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTickActive) {
      timer = setInterval(() => {
        setDemoBalance((prev) => prev + 0.0012);
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isTickActive]);

  const handleContinue = () => {
    if (selectedLang) {
      setLanguage(selectedLang);
      router.push("/role");
    }
  };

  const selectLanguageHandler = (code: string) => {
    const langCode = code as LanguageCode;
    setSelectedLang(langCode);
    setLanguage(langCode); // Change it instantly so all sections translate in real-time!
  };

  return (
    <main className="min-h-screen bg-transparent text-foreground flex flex-col relative selection:bg-primary/30">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section 1: Hero */}
        <section className="min-h-screen flex flex-col justify-center items-center py-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="Rheodemy Logo" 
                className="h-20 sm:h-28 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform" 
              />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              {t.onboardingHeroTitle}
            </h1>
            
            <p className="text-lg sm:text-xl text-muted max-w-xl mx-auto leading-relaxed">
              {t.onboardingHeroDesc}
            </p>

            <div className="pt-10 flex flex-col items-center gap-4 text-xs tracking-widest text-primary/70 font-bold uppercase">
              <span>{t.onboardingScrollPrompt}</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowDown className="w-5 h-5 text-primary" />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Section 2: Pay by the Second Ticker Demo */}
        <section className="min-h-screen flex flex-col justify-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            onViewportEnter={() => setIsTickActive(true)}
            onViewportLeave={() => setIsTickActive(false)}
          >
            <div className="space-y-6">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <Coins className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">{t.onboardingStep1Title}</h2>
              <p className="text-muted leading-relaxed text-base sm:text-lg">
                {t.onboardingStep1Desc}
              </p>
            </div>

            {/* Interactive Demo Ticker Box */}
            <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4">
              <div className="absolute top-4 right-4 bg-primary/15 text-primary text-[10px] font-mono px-2 py-0.5 rounded border border-primary/20">
                ACTIVE STREAM
              </div>
              <p className="text-xs text-muted/60 uppercase tracking-widest">Mock Wallet Balance Charged</p>
              <h3 className="text-5xl font-mono text-primary font-bold">${demoBalance.toFixed(4)}</h3>
              
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-6 border border-white/5">
                <motion.div 
                  className="bg-primary h-full rounded-full"
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                />
              </div>
              
              <p className="text-xs text-muted italic mt-2">Streaming payment: $0.12/minute ($0.002/sec)</p>
            </div>
          </motion.div>
        </section>

        {/* Section 3: Revenue Splits */}
        <section className="min-h-screen flex flex-col justify-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            {/* Visual split diagram */}
            <div className="space-y-4 order-2 md:order-1">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>{t.creatorShare}</span>
                  <span className="text-primary font-bold">80%</span>
                </div>
                <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="bg-primary h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "80%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>{t.platformShare}</span>
                  <span className="text-blue-400 font-bold">15%</span>
                </div>
                <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="bg-blue-400 h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "15%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>{t.bursaryShare}</span>
                  <span className="text-emerald-400 font-bold">5%</span>
                </div>
                <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="bg-emerald-400 h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "5%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 md:order-2 md:pl-6">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">{t.onboardingStep2Title}</h2>
              <p className="text-muted leading-relaxed text-base sm:text-lg">
                {t.onboardingStep2Desc}
              </p>
            </div>
          </motion.div>
        </section>

        {/* Section 4: Slow Readers Protections */}
        <section className="min-h-screen flex flex-col justify-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <div className="inline-flex p-3 rounded-2xl bg-warning/10 border border-warning/20 text-warning">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">{t.onboardingStep3Title}</h2>
              <p className="text-muted leading-relaxed text-base sm:text-lg">
                {t.onboardingStep3Desc}
              </p>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" /> Ebook Player
                </span>
                <span className="text-xs font-mono text-primary animate-pulse bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  Active
                </span>
              </div>
              
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <h4 className="font-bold text-sm">Chapter 1: The New Web Paradigm</h4>
                <p className="text-xs text-muted/80 leading-relaxed font-serif">
                  "Micro-transactions allow small streams of money to flow from readers directly to authors, bypassing centralized payment systems."
                </p>
              </div>

              {/* Status badges container */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 animate-spin" /> Inactive for 15s</span>
                  <span className="font-bold">Billing Paused (Idle)</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Max limit of 45s reached</span>
                  <span className="font-bold">Page Reading Capped</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 5: Language Selection & Setup */}
        <section className="min-h-screen flex flex-col justify-center py-20" id="language-selection">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold">{t.chooseLang}</h2>
              <p className="text-muted text-base max-w-xl mx-auto leading-relaxed">
                {t.chooseLangDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => selectLanguageHandler(lang.code)}
                  className={`relative flex flex-col items-start p-6 rounded-2xl transition-all duration-200 text-left w-full glass hover:bg-white/[0.04] cursor-pointer
                    ${
                      selectedLang === lang.code
                        ? "ring-2 ring-primary bg-primary/5 shadow-md shadow-primary/20"
                        : "border border-white/10"
                    }
                  `}
                >
                  <div className="flex justify-between w-full items-center mb-2">
                    <span className="text-xl font-semibold">{lang.name}</span>
                    {selectedLang === lang.code && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <span className="text-xs text-foreground/60">{lang.region}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <button
                onClick={handleContinue}
                disabled={!selectedLang}
                className="group relative flex items-center gap-2 px-10 py-4 bg-primary text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 cursor-pointer shadow-[0_0_30px_rgba(0,212,200,0.2)]"
              >
                <span className="relative z-10">{t.continue}</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </section>

      </div>
    </main>
  );
}
