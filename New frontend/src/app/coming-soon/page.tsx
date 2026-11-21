"use client";

import { Hammer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden items-center justify-center p-6 text-center">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full glass p-12 rounded-3xl border border-white/10 space-y-8 shadow-2xl shadow-black/50"
      >
        <div className="flex justify-center">
          <div className="relative">
            {/* Pulsing ring */}
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative bg-[#0A0A0A] border border-primary/30 p-6 rounded-full shadow-[0_0_30px_rgba(0,212,200,0.2)]">
              <Hammer className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Coming Soon</h1>
          <p className="text-muted text-sm leading-relaxed">
            You've caught us building! This feature is actively under development and will be released in the upcoming Phase 2 update.
          </p>
        </div>

        <div className="pt-4">
          <button 
            onClick={() => router.back()}
            className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </motion.div>
      
    </main>
  );
}
