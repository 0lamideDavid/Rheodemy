"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Video, 
  ArrowRight, 
  ArrowLeft, 
  Check
} from "lucide-react";
import { useLanguage, LanguageCode } from "@/context/LanguageContext";
import { BrandLogo } from "@/components/ui/BrandLogo";

const ROLE_I18N: Record<
  LanguageCode,
  {
    stepBadge: string;
    chooseDest: string;
    learnerBadge: string;
    educatorBadge: string;
    lBullets: string[];
    eBullets: string[];
  }
> = {
  en: {
    stepBadge: "Step 2 • Role Intent",
    chooseDest: "Choose Your Destination",
    learnerBadge: "Learner Path",
    educatorBadge: "Educator Path",
    lBullets: [
      "Pay strictly per second streamed with zero upfront lock-in",
      "Rewatching and pausing are 100% free ($0 charged)",
      "Creator-defined rent-to-own price caps (e.g. $200)",
      "Opening learner grant: $50 starting credits"
    ],
    eBullets: [
      "Receive 50% direct creator share on every streamed second",
      "Zero 30-day withholding periods — withdraw anytime",
      "5-layer verified educator reputation badge",
      "Full support for Video, Audio Podcasts, and Ebooks"
    ]
  },
  fr: {
    stepBadge: "Étape 2 • Choix du rôle",
    chooseDest: "Choisissez votre destination",
    learnerBadge: "Parcours Apprenant",
    educatorBadge: "Parcours Enseignant",
    lBullets: [
      "Paiement strict à la seconde sans engagement préalable",
      "Relecture et pause 100% gratuites (0 $ facturé)",
      "Plafond d'achat fixé par le créateur (ex. 200 $)",
      "Crédit de bienvenue : 50 $ offerts"
    ],
    eBullets: [
      "Recevez 50% de part créateur directe par seconde diffusée",
      "Zéro délai de rétention de 30 jours — retrait immédiat",
      "Badge d'enseignant vérifié en 5 étapes",
      "Prise en charge intégrale : Vidéo, Audio et E-books"
    ]
  },
  pt: {
    stepBadge: "Etapa 2 • Intenção de Função",
    chooseDest: "Escolha o seu destino",
    learnerBadge: "Percurso do Aluno",
    educatorBadge: "Percurso do Educador",
    lBullets: [
      "Pagamento estrito por segundo sem fidelização",
      "Rever e pausar são 100% gratuitos (0 $ cobrado)",
      "Teto de compra definido pelo criador (ex. 200 $)",
      "Bolsa inicial de estudante: $50 créditos"
    ],
    eBullets: [
      "Receba 50% da partilha de criador por segundo transmitido",
      "Sem períodos de retenção de 30 dias — levante quando quiser",
      "Crachá de educador verificado em 5 níveis",
      "Suporte para Vídeo, Podcasts e E-books"
    ]
  },
  es: {
    stepBadge: "Paso 2 • Selección de rol",
    chooseDest: "Elige tu destino",
    learnerBadge: "Ruta del Estudiante",
    educatorBadge: "Ruta del Educador",
    lBullets: [
      "Pago estricto por segundo sin suscripciones obligatorias",
      "Repasar y pausar es 100% gratis ($0 cobrado)",
      "Tope de desbloqueo fijado por el creador (ej. $200)",
      "Crédito inicial para aprender: $50 de saldo"
    ],
    eBullets: [
      "Recibe el 50% de ingresos directos por segundo transmitido",
      "Sin retenciones de 30 días — retiros en cualquier momento",
      "Insignia de reputación docente verificada en 5 niveles",
      "Soporte completo para Video, Podcasts y Libros electrónicos"
    ]
  },
  ar: {
    stepBadge: "الخطوة 2 • تحديد الدور",
    chooseDest: "اختر وجهتك التعليمية",
    learnerBadge: "مسار الطالب",
    educatorBadge: "مسار المعلم",
    lBullets: [
      "دفع متدفق بالثانية بدقة دون أي التزام مسبق",
      "إعادة المشاهدة والإيقاف المؤقت مجانية 100% (0 رسوم)",
      "سقف شراء تملكي يحدده منشئ المحتوى (مثال: 200$)",
      "منحة الطالب الترحيبية: 50$ رصيد بدء"
    ],
    eBullets: [
      "احصل على 50% حصة منشئ المحتوى المباشرة عن كل ثانية تدفق",
      "بدون فترات حجز 30 يوماً — سحب فوري في أي وقت",
      "شارة معلم موثق من 5 طبقات فحص",
      "دعم شامل لدروس الفيديو والبودكاست والكتب الإلكترونية"
    ]
  },
  sw: {
    stepBadge: "Hatua ya 2 • Chaguo la Jukumu",
    chooseDest: "Chagua Njia Yako",
    learnerBadge: "Njia ya Mwanafunzi",
    educatorBadge: "Njia ya Mwalimu",
    lBullets: [
      "Lipa kwa kila sekunde halisi bila kuanza na usajili",
      "Kusikiliza tena au kusitisha ni bure 100% ($0)",
      "Kiwango cha juu cha bei kinachowekwa na mwalimu (k.m. $200)",
      "Ruzuku ya mwanafunzi: salio la kuanzia la $50"
    ],
    eBullets: [
      "Pata asilimia 50% ya mapato moja kwa moja kwa kila sekunde",
      "Hakuna kuzuiliwa kwa siku 30 — toa pesa wakati wowote",
      "Beji ya uthibitisho wa mwalimu ya ngazi 5",
      "Msaada kamili kwa Video, Sauti na Vitabu vya Kielektroniki"
    ]
  }
};

export default function RoleSelection() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const selectedLang: LanguageCode = language || "en";
  const currentI18n = ROLE_I18N[selectedLang] || ROLE_I18N.en;

  const handleSelectRole = (role: "learner" | "creator") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rheodemy_role", role);
    }
    router.push(`/auth?role=${role}`);
  };

  return (
    <div 
      className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-sun/30"
      dir={selectedLang === "ar" ? "rtl" : "ltr"}
    >
      
      {/* 🧭 NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-xs border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="w-8 h-8 rounded-full border border-rule flex items-center justify-center hover:bg-surface text-ink transition-colors"
              title="Back to Onboarding"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <div className="h-4 w-px bg-rule" />
            <BrandLogo size="md" />
          </div>

          <span className="text-xs font-mono text-muted uppercase tracking-wider">
            {currentI18n.stepBadge}
          </span>
        </div>
      </header>

      {/* 🏛️ MAIN ROLE SELECTION CONTAINER */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full space-y-10">
        
        {/* Editorial Heading */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
            {currentI18n.chooseDest}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ink">
            {t.howUse || "How will you use Rheodemy?"}
          </h1>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            {t.howUseDesc || "Select your primary purpose. You can switch or connect teacher capabilities at any time."}
          </p>
        </div>

        {/* 2 Editorial Ledger Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: Learner */}
          <div
            onClick={() => handleSelectRole("learner")}
            className="ledger-card p-6 sm:p-8 bg-surface border-rule hover:border-forest transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-md"
          >
            <div className="space-y-6">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-forest/10 border border-forest/20 text-forest font-mono text-xs font-bold uppercase tracking-wider">
                  {currentI18n.learnerBadge}
                </span>
                <div className="w-12 h-12 rounded-lg bg-forest/10 text-forest flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-ink group-hover:text-forest transition-colors">
                  {t.learnTitle || "I want to learn"}
                </h2>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {t.learnDesc || "Stream verified video, audio, and text lessons by the second. Pay only for active learning."}
                </p>
              </div>

              {/* Bullet Guarantees */}
              <div className="space-y-2.5 pt-4 border-t border-rule text-xs text-ink/85">
                {currentI18n.lBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Action */}
            <div className="pt-8">
              <button
                type="button"
                className="w-full btn-forest text-xs py-3 px-4 flex items-center justify-center gap-2 group-hover:opacity-95 transition-all shadow-xs cursor-pointer"
              >
                <span>{t.learnBtn || "Continue as Learner"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Card 2: Educator / Creator */}
          <div
            onClick={() => handleSelectRole("creator")}
            className="ledger-card p-6 sm:p-8 bg-surface border-rule hover:border-sun transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-md"
          >
            <div className="space-y-6">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-sun/15 border border-sun/30 text-ink font-mono text-xs font-bold uppercase tracking-wider">
                  {currentI18n.educatorBadge}
                </span>
                <div className="w-12 h-12 rounded-lg bg-sun/15 text-ink flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-ink group-hover:text-forest transition-colors">
                  {t.teachTitle || "I want to teach"}
                </h2>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {t.teachDesc || "Publish curriculum, monetize per second with Interledger, and withdraw to Mobile Money."}
                </p>
              </div>

              {/* Bullet Guarantees */}
              <div className="space-y-2.5 pt-4 border-t border-rule text-xs text-ink/85">
                {currentI18n.eBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Action */}
            <div className="pt-8">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-[6px] border border-rule hover:border-ink hover:bg-paper text-xs font-semibold text-ink flex items-center justify-center gap-2 group-hover:bg-paper transition-all cursor-pointer"
              >
                <span>{t.teachBtn || "Continue as Educator"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}