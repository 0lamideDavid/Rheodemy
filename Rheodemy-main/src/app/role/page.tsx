"use client";

import { motion } from "framer-motion";
import { BookOpen, Video, ArrowRight, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function RoleSelection() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleSelectRole = (role: "learner" | "creator") => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rheodemy_role', role);
    }
    router.push("/auth?role=" + role);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full glass inline-flex">
              <UserCircle className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {t.howUse}
          </h1>
          <p className="text-lg text-foreground/70 max-w-xl mx-auto">
            {t.howUseDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Learner Card */}
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectRole("learner")}
            className="group relative flex flex-col items-start p-8 rounded-2xl transition-all duration-300 text-left w-full glass hover:bg-white/[0.04] cursor-pointer overflow-hidden border border-white/10 hover:border-primary/50"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen className="w-32 h-32 text-primary transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            
            <div className="p-4 rounded-xl bg-primary/10 text-primary mb-6 relative z-10 border border-primary/20">
              <BookOpen className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3 relative z-10">{t.learnTitle}</h2>
            <p className="text-foreground/70 mb-8 relative z-10 flex-1">
              {t.learnDesc}
            </p>
            
            <div className="flex items-center text-primary font-semibold relative z-10 group-hover:translate-x-2 transition-transform">
              {t.learnBtn} <ArrowRight className="ml-2 w-5 h-5 rtl:rotate-180" />
            </div>
          </motion.div>

          {/* Creator Card */}
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectRole("creator")}
            className="group relative flex flex-col items-start p-8 rounded-2xl transition-all duration-300 text-left w-full glass hover:bg-white/[0.04] cursor-pointer overflow-hidden border border-white/10 hover:border-warning/50"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Video className="w-32 h-32 text-warning transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            
            <div className="p-4 rounded-xl bg-warning/10 text-warning mb-6 relative z-10 border border-warning/20">
              <Video className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3 relative z-10">{t.teachTitle}</h2>
            <p className="text-foreground/70 mb-8 relative z-10 flex-1">
              {t.teachDesc}
            </p>
            
            <div className="flex items-center text-warning font-semibold relative z-10 group-hover:translate-x-2 transition-transform">
              {t.teachBtn} <ArrowRight className="ml-2 w-5 h-5 rtl:rotate-180" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
