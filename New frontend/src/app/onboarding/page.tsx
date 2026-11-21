"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Wallet,
  Play,
  Pause,
  ArrowRight,
  Check
} from "lucide-react";
import { useLanguage, LanguageCode } from "@/context/LanguageContext";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  region: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", region: "Global & Anglophone Africa" },
  { code: "fr", name: "French", nativeName: "Français", region: "West & Central Africa" },
  { code: "pt", name: "Portuguese", nativeName: "Português", region: "Angola, Mozambique, Cape Verde" },
  { code: "es", name: "Spanish", nativeName: "Español", region: "Latin America & Equatorial Guinea" },
  { code: "ar", name: "Arabic", nativeName: "العربية", region: "North Africa & Middle East" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", region: "East & Central Africa" },
];

const ONBOARDING_I18N: Record<
  LanguageCode,
  {
    step1Badge: string;
    step1Title: string;
    step1Desc: string;
    step2Badge: string;
    step2Title: string;
    step2Desc: string;
    g1Title: string;
    g1Desc: string;
    g2Title: string;
    g2Desc: string;
    g3Title: string;
    g3Desc: string;
    simTitle: string;
    simPlayback: string;
    simFree: string;
    simBilled: string;
    simSpend: string;
    step3Badge: string;
    step3Title: string;
    step3Desc: string;
    walletTitle: string;
    walletStatus: string;
    openingBalance: string;
    supportedRails: string;
    walletGuarantee: string;
    skipToRole: string;
    backHome: string;
    previous: string;
    nextStep: string;
    continueRole: string;
  }
> = {
  en: {
    step1Badge: "Step 1 of 3 • Personalization",
    step1Title: "Choose your learning language",
    step1Desc: "Rheodemy translates lesson subtitles, reading transcripts, and navigation in real time. You can change this anytime.",
    step2Badge: "Step 2 of 3 • The Core Guarantee",
    step2Title: "Never buy an entire course upfront",
    step2Desc: "Traditional education locks you into ₦50,000 subscriptions. Rheodemy streams knowledge with 3 mathematically protected rules.",
    g1Title: "2-Minute Free Preview",
    g1Desc: "Every video, audio lesson, or book chapter gives you 120 seconds of free learning to check if the instructor is right for you.",
    g2Title: "Zero Charge on Pause",
    g2Desc: "The payment meter stops instantly when you pause, walk away, or reread. Buffering and reviewing watched parts is always ₦0.",
    g3Title: "Rent-to-Own Price Cap",
    g3Desc: "Once your streaming payments reach the creator's cap (e.g. ₦200), the course is permanently unlocked in your library forever.",
    simTitle: "Simulated Interledger Stream",
    simPlayback: "Active Playback",
    simFree: "In 2-minute free preview window • ₦0.00 charged",
    simBilled: "Active billing at ₦5 / min • Billed per second",
    simSpend: "Session Spend",
    step3Badge: "Step 3 of 3 • Ready to Learn",
    step3Title: "Start with a ₦1,200 starter credit",
    step3Desc: "Every new student receives starting learning credits to preview lessons. Top up easily via Mobile Money or Interledger.",
    walletTitle: "Interledger Learner Wallet",
    walletStatus: "Status: Ready to activate",
    openingBalance: "Opening Balance",
    supportedRails: "Supported Emerging Market Deposit Rails",
    walletGuarantee: "No credit card required. Funds remain in your self-custodied channel and only stream out while you are actively learning.",
    skipToRole: "Skip to role",
    backHome: "Back to Homepage",
    previous: "Previous",
    nextStep: "Next Step",
    continueRole: "Continue to Role Selection",
  },
  fr: {
    step1Badge: "Étape 1 sur 3 • Personnalisation",
    step1Title: "Choisissez votre langue d'apprentissage",
    step1Desc: "Rheodemy traduit les sous-titres des leçons, les transcriptions et l'interface en temps réel. Modifiable à tout moment.",
    step2Badge: "Étape 2 sur 3 • Les 3 Garanties",
    step2Title: "N'achetez plus jamais un cours complet à l'avance",
    step2Desc: "L'éducation traditionnelle impose des abonnements coûteux. Rheodemy diffuse le savoir avec 3 règles mathématiquement protégées.",
    g1Title: "Aperçu gratuit de 2 minutes",
    g1Desc: "Chaque vidéo, leçon audio ou chapitre de livre vous offre 120 secondes gratuites pour évaluer l'enseignant.",
    g2Title: "Zéro frais en pause",
    g2Desc: "Le compteur s'arrête instantanément en pause. La mise en mémoire tampon et la relecture sont toujours à 0 FCFA.",
    g3Title: "Plafond d'achat définitif",
    g3Desc: "Dès que vos micropaiements atteignent le plafond (ex. 200 FCFA), le cours est définitivement débloqué à vie.",
    simTitle: "Flux Interledger Simulé",
    simPlayback: "Lecture active",
    simFree: "Fenêtre d'aperçu gratuit de 2 min • 0 FCFA facturé",
    simBilled: "Facturation active à la seconde",
    simSpend: "Dépense de session",
    step3Badge: "Étape 3 sur 3 • Prêt à apprendre",
    step3Title: "Commencez avec 1 200 FCFA de crédit offert",
    step3Desc: "Chaque nouvel étudiant reçoit un crédit de bienvenue pour tester les leçons. Rechargez facilement via Mobile Money ou Interledger.",
    walletTitle: "Portefeuille Apprenant Interledger",
    walletStatus: "Statut : Prêt à être activé",
    openingBalance: "Solde d'ouverture",
    supportedRails: "Moyens de dépôt pris en charge en Afrique",
    walletGuarantee: "Aucune carte bancaire requise. Vos fonds restent sous votre contrôle et ne s'écoulent que lorsque vous apprenez activement.",
    skipToRole: "Passer au rôle",
    backHome: "Retour à l'accueil",
    previous: "Précédent",
    nextStep: "Étape suivante",
    continueRole: "Continuer vers le choix du rôle",
  },
  pt: {
    step1Badge: "Etapa 1 de 3 • Personalização",
    step1Title: "Escolha o seu idioma de aprendizagem",
    step1Desc: "Rheodemy traduz legendas de aulas, transcrições e navegação em tempo real. Pode alterar a qualquer momento.",
    step2Badge: "Etapa 2 de 3 • A Garantia Principal",
    step2Title: "Nunca pague um curso inteiro adiantado",
    step2Desc: "A educação tradicional prende-o a subscrições caras. O Rheodemy transmite conhecimento com 3 regras protegidas.",
    g1Title: "Pré-visualização gratuita de 2 minutos",
    g1Desc: "Cada vídeo, áudio ou capítulo oferece 120 segundos gratuitos para verificar se o instrutor é ideal para si.",
    g2Title: "Custo zero na pausa",
    g2Desc: "O medidor para instantaneamente quando faz uma pausa ou relê. O buffer e revisões são sempre 0 Kz.",
    g3Title: "Teto de compra definitiva",
    g3Desc: "Assim que os seus pagamentos atingirem o teto do criador, o curso fica desbloqueado na sua biblioteca para sempre.",
    simTitle: "Transmissão Interledger Simulada",
    simPlayback: "Reprodução ativa",
    simFree: "Na janela gratuita de 2 minutos • 0 Kz cobrado",
    simBilled: "Cobrança ativa por segundo",
    simSpend: "Gasto da sessão",
    step3Badge: "Etapa 3 de 3 • Pronto para aprender",
    step3Title: "Comece com 1.200 de crédito inicial",
    step3Desc: "Cada novo estudante recebe créditos de boas-vindas para pré-visualizar aulas. Carregue via Mobile Money ou Interledger.",
    walletTitle: "Carteira Interledger do Aluno",
    walletStatus: "Estado: Pronto para ativar",
    openingBalance: "Saldo Inicial",
    supportedRails: "Canais de Depósito Suportados",
    walletGuarantee: "Sem necessidade de cartão de crédito. Os fundos permanecem sob a sua custódia e só fluem durante o estudo ativo.",
    skipToRole: "Saltar para função",
    backHome: "Voltar ao início",
    previous: "Anterior",
    nextStep: "Próxima etapa",
    continueRole: "Continuar para escolha de função",
  },
  es: {
    step1Badge: "Paso 1 de 3 • Personalización",
    step1Title: "Elige tu idioma de aprendizaje",
    step1Desc: "Rheodemy traduce subtítulos, transcripciones y navegación en tiempo real. Puedes cambiarlo en cualquier momento.",
    step2Badge: "Paso 2 de 3 • La Garantía Principal",
    step2Title: "Nunca compres un curso completo por adelantado",
    step2Desc: "La educación tradicional te ata a suscripciones costosas. Rheodemy transmite conocimiento con 3 reglas matemáticas.",
    g1Title: "Vista previa gratuita de 2 minutos",
    g1Desc: "Cada lección en video, audio o libro ofrece 120 segundos gratis para comprobar si el profesor es el adecuado.",
    g2Title: "Cero cobro en pausa",
    g2Desc: "El medidor se detiene al instante si pausas o relees. Cargar y repasar partes vistas siempre es gratis.",
    g3Title: "Tope de compra definitiva",
    g3Desc: "Cuando tus micropagos alcanzan el tope del creador, el curso se desbloquea para siempre en tu biblioteca.",
    simTitle: "Transmisión Interledger Simulada",
    simPlayback: "Reproducción activa",
    simFree: "En periodo gratuito de 2 minutos • $0 cobrado",
    simBilled: "Facturación activa por segundo",
    simSpend: "Gasto de sesión",
    step3Badge: "Paso 3 de 3 • Listo para aprender",
    step3Title: "Empieza con 1.200 de crédito de bienvenida",
    step3Desc: "Cada nuevo estudiante recibe saldo para probar lecciones. Recarga fácilmente con dinero móvil o Interledger.",
    walletTitle: "Billetera Interledger del Estudiante",
    walletStatus: "Estado: Lista para activar",
    openingBalance: "Saldo Inicial",
    supportedRails: "Métodos de depósito en mercados emergentes",
    walletGuarantee: "No se requiere tarjeta de crédito. Los fondos están bajo tu custodia y solo fluyen mientras estudias activamente.",
    skipToRole: "Saltar a rol",
    backHome: "Volver al inicio",
    previous: "Anterior",
    nextStep: "Siguiente paso",
    continueRole: "Continuar a selección de rol",
  },
  ar: {
    step1Badge: "الخطوة 1 من 3 • التخصيص",
    step1Title: "اختر لغة التعلم المفضلة",
    step1Desc: "يقوم ريوديمي بترجمة نصوص الدروس والمحتوى وواجهة الاستخدام بشكل فوري. يمكنك تغييرها في أي وقت.",
    step2Badge: "الخطوة 2 من 3 • الضمانات الأساسية",
    step2Title: "لا تدفع أبداً ثمن دورة كاملة مقدماً",
    step2Desc: "التعليم التقليدي يفرض اشتراكات باهظة. ريوديمي يقدم المعرفة وفق 3 قواعد رياضية عادلة ومحمية.",
    g1Title: "معاينة مجانية لمدة دقيقتين",
    g1Desc: "كل درس فيديو أو صوتي أو فصل كتاب يمنحك 120 ثانية مجانية لتتأكد من ملاءمة المحتوى لك.",
    g2Title: "بدون أي رسوم عند التوقف",
    g2Desc: "يتوقف عداد الدفع فوراً عند الإيقاف المؤقت أو إعادة القراءة. مراجعة ما شاهدته مجانية دائماً.",
    g3Title: "سقف الشراء التملكي",
    g3Desc: "بمجرد أن تصل دفعاتك المتدفقة إلى سقف السعر المحدد، تصبح الدورة ملكاً لك في مكتبتك إلى الأبد.",
    simTitle: "محاكاة تدفق إنترلدجر المالي",
    simPlayback: "التشغيل النشط",
    simFree: "في نافذة المعاينة المجانية (دقيقتان) • 0 رسوم",
    simBilled: "دفع متدفق بالثانية",
    simSpend: "تكلفة الجلسة",
    step3Badge: "الخطوة 3 من 3 • جاهز للتعلم",
    step3Title: "ابدأ برصيد ترحيبي 1,200",
    step3Desc: "يحصل كل طالب جديد على رصيد تجريبي لمعاينة الدروس. يمكنك الشحن بسهولة عبر الهاتف المحمول أو إنترلدجر.",
    walletTitle: "محفظة الطالب عبر إنترلدجر",
    walletStatus: "الحالة: جاهزة للتفعيل",
    openingBalance: "الرصيد الافتتاحي",
    supportedRails: "طرق الدفع عبر الهاتف المحمول المدعومة",
    walletGuarantee: "لا حاجة لبطاقة ائتمان. تبقى أموالك في محفظتك الخاصة ولا تتدفق إلا أثناء وقت التعلم النشط.",
    skipToRole: "تخطي إلى الدور",
    backHome: "العودة للرئيسية",
    previous: "السابق",
    nextStep: "الخطوة التالية",
    continueRole: "متابعة لتحديد الدور",
  },
  sw: {
    step1Badge: "Hatua ya 1 ya 3 • Mapendeleo",
    step1Title: "Chagua lugha yako ya kujifunzia",
    step1Desc: "Rheodemy inatafsiri manukuu, maandishi na mwonekano kwa wakati halisi. Unaweza kubadilisha wakati wowote.",
    step2Badge: "Hatua ya 2 ya 3 • Dhamana Kuu",
    step2Title: "Usinunue kozi nzima kabla ya kujifunza",
    step2Desc: "Elimu ya zamani inakulazimisha usajili wa bei ghali. Rheodemy inaleta maarifa kwa sheria 3 zilizolindwa kihisabati.",
    g1Title: "Dakika 2 za Kutazama Bure",
    g1Desc: "Kila somo la video, sauti, au sura ya kitabu inakupa sekunde 120 za bure kuthibitisha ubora wa mwalimu.",
    g2Title: "Bila Malipo Ukisitisha",
    g2Desc: "Kipimo cha malipo kinasimama punde unaposimama au kurudia kusoma. Kurudia ni bure daima.",
    g3Title: "Kiwango cha Juu cha Umiliki",
    g3Desc: "Malipo yakifikia kiwango cha juu kilichowekwa na mwalimu, somo linakuwa lako milele.",
    simTitle: "Uigaji wa Mtiririko wa Interledger",
    simPlayback: "Muda wa Somo",
    simFree: "Ndani ya dakika 2 za bure • Malipo ni KSh 0",
    simBilled: "Ulipaji unaoendelea kwa kila sekunde",
    simSpend: "Gharama ya Kipindi",
    step3Badge: "Hatua ya 3 ya 3 • Tayari Kuanza",
    step3Title: "Anza na salio la bure la KSh 1,200",
    step3Desc: "Kila mwanafunzi mpya anapata salio la kuanzia kujaribu masomo. Weka pesa kwa urahisi kupitia M-Pesa au Interledger.",
    walletTitle: "Pochi ya Mwanafunzi ya Interledger",
    walletStatus: "Hali: Tayari kuanza",
    openingBalance: "Salio la Kuanzia",
    supportedRails: "Njia za Malipo za Simu Zinazotumika",
    walletGuarantee: "Hauhitaji kadi ya benki. Fedha zako zinabaki chini yako na zitatoka tu unaposoma kwa bidii.",
    skipToRole: "Ruka hadi kuchagua jukumu",
    backHome: "Rudi nyumbani",
    previous: "Nyuma",
    nextStep: "Hatua inayofuata",
    continueRole: "Endelea hadi kuchagua jukumu",
  },
};

export default function OnboardingWalkthrough() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 2 interactive micropayment simulation
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSeconds, setSimSeconds] = useState(38); // 38 seconds into lesson
  const [simSpend, setSimSpend] = useState(0);

  const selectedLang: LanguageCode = language || "en";
  const currentI18n = ONBOARDING_I18N[selectedLang] || ONBOARDING_I18N.en;

  // Simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulating && currentStep === 2) {
      interval = setInterval(() => {
        setSimSeconds((prev) => {
          const next = prev + 1;
          // Beyond 120s preview, bill at ₦5/min (₦0.0833/s) up to ₦200 cap
          if (next > 120) {
            const billable = next - 120;
            const calculated = Math.min(200, billable * (5 / 60));
            setSimSpend(calculated);
          } else {
            setSimSpend(0);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, currentStep]);

  const selectLanguage = (code: LanguageCode) => {
    setLanguage(code);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/role");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  return (
    <div 
      className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-sun/30"
      dir={selectedLang === "ar" ? "rtl" : "ltr"}
    >
      
      {/* 🧭 NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-xs border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <BrandLogo size="md" />

          {/* Stepper Progress Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {[1, 2, 3].map((stepNum) => {
              const isPassed = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              return (
                <div key={stepNum} className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-forest text-white shadow-xs"
                        : isPassed
                        ? "bg-forest/20 text-forest border border-forest/30"
                        : "bg-surface border border-rule text-muted"
                    }`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : stepNum}
                  </span>
                  {stepNum < 3 && (
                    <div
                      className={`w-4 sm:w-8 h-0.5 transition-colors ${
                        isPassed ? "bg-forest" : "bg-rule"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <Link
            href="/role"
            className="text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            {currentI18n.skipToRole}
          </Link>
        </div>
      </header>

      {/* 📖 MAIN ONBOARDING CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        
        {/* ========================================================= */}
        {/* STEP 1: LANGUAGE & REGIONAL PREFERENCE */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
                {currentI18n.step1Badge}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                {currentI18n.step1Title}
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                {currentI18n.step1Desc}
              </p>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => selectLanguage(lang.code)}
                    className={`ledger-card p-5 text-left rtl:text-right flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-forest/10 border-forest shadow-xs ring-1 ring-forest"
                        : "bg-surface hover:bg-paper border-rule"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="space-y-0.5">
                        <span className="font-serif text-lg font-bold text-ink block">
                          {lang.nativeName}
                        </span>
                        <span className="text-xs font-mono text-muted block">
                          {lang.name}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-forest text-white"
                            : "border border-rule bg-paper"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-rule/50 mt-4">
                      <span className="text-[11px] text-muted line-clamp-1">
                        {lang.region}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: HOW MICROPAYMENTS WORK (THE 3 GUARANTEES) */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
                {currentI18n.step2Badge}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                {currentI18n.step2Title}
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                {currentI18n.step2Desc}
              </p>
            </div>

            {/* 3 Interactive Guarantee Ledger Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="ledger-card p-6 bg-surface space-y-3">
                <div className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center font-mono font-bold text-xs">
                  1
                </div>
                <h3 className="font-serif font-bold text-base text-ink">
                  {currentI18n.g1Title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {currentI18n.g1Desc}
                </p>
              </div>

              <div className="ledger-card p-6 bg-surface space-y-3">
                <div className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center font-mono font-bold text-xs">
                  2
                </div>
                <h3 className="font-serif font-bold text-base text-ink">
                  {currentI18n.g2Title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {currentI18n.g2Desc}
                </p>
              </div>

              <div className="ledger-card p-6 bg-surface space-y-3">
                <div className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center font-mono font-bold text-xs">
                  3
                </div>
                <h3 className="font-serif font-bold text-base text-ink">
                  {currentI18n.g3Title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {currentI18n.g3Desc}
                </p>
              </div>
            </div>

            {/* Interactive Simulator Box */}
            <div className="ledger-card p-6 bg-surface border border-rule flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                  <span className="text-xs font-mono uppercase text-forest font-bold">
                    {currentI18n.simTitle}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-lg text-ink">
                  {currentI18n.simPlayback}: {Math.floor(simSeconds / 60)}m {(simSeconds % 60).toString().padStart(2, "0")}s
                </h4>
                <p className="text-xs text-muted">
                  {simSeconds <= 120
                    ? currentI18n.simFree
                    : currentI18n.simBilled}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right rtl:text-left">
                  <span className="text-[10px] font-mono uppercase text-muted block">{currentI18n.simSpend}</span>
                  <span className="font-mono text-2xl font-bold text-ink">₦{simSpend.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isSimulating
                      ? "bg-forest text-white hover:bg-forest/90"
                      : "bg-paper border border-rule text-ink hover:bg-surface"
                  }`}
                  title={isSimulating ? "Pause Simulator" : "Play Simulator"}
                >
                  {isSimulating ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ms-0.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: WALLET & MOBILE MONEY RAILS */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
                {currentI18n.step3Badge}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                {currentI18n.step3Title}
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                {currentI18n.step3Desc}
              </p>
            </div>

            {/* Wallet Showcase Card */}
            <div className="ledger-card p-6 sm:p-8 bg-surface space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rule">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-ink">
                      {currentI18n.walletTitle}
                    </h4>
                    <span className="text-xs font-mono text-muted">
                      {currentI18n.walletStatus}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right rtl:sm:text-left">
                  <span className="text-[10px] font-mono uppercase text-muted block">{currentI18n.openingBalance}</span>
                  <span className="font-mono text-2xl font-bold text-forest">₦1,200.00</span>
                </div>
              </div>

              {/* Supported African Mobile Money Rails */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-muted font-semibold block">
                  {currentI18n.supportedRails}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-paper border border-rule rounded flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest" />
                    <span className="font-medium text-ink">MTN MoMo</span>
                  </div>
                  <div className="p-3 bg-paper border border-rule rounded flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest" />
                    <span className="font-medium text-ink">M-Pesa Kenya</span>
                  </div>
                  <div className="p-3 bg-paper border border-rule rounded flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest" />
                    <span className="font-medium text-ink">Airtel Money</span>
                  </div>
                  <div className="p-3 bg-paper border border-rule rounded flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest" />
                    <span className="font-medium text-ink">ILP Open Payments</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-forest/5 border border-forest/20 rounded text-xs text-ink/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <span>
                  {currentI18n.walletGuarantee}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM NAVIGATION ACTIONS */}
        {/* ========================================================= */}
        <div className="pt-10 mt-6 border-t border-rule flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[4px] text-xs font-semibold border border-rule hover:bg-surface text-ink transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{currentStep === 1 ? currentI18n.backHome : currentI18n.previous}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="btn-forest text-xs py-2.5 px-6 min-h-[40px] flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{currentStep === 3 ? currentI18n.continueRole : currentI18n.nextStep}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

      </main>

    </div>
  );
}