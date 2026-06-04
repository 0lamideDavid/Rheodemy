"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "en" | "fr" | "pt" | "es" | "ar" | "sw";

export interface TranslationDict {
  // Common
  continue: string;
  back: string;
  submit: string;
  role: string;
  learner: string;
  creator: string;
  logoText: string;
  logIn: string;
  becomeCreator: string;

  // Onboarding
  onboardingHeroTitle: string;
  onboardingHeroDesc: string;
  onboardingScrollPrompt: string;
  onboardingStep1Title: string;
  onboardingStep1Desc: string;
  onboardingStep2Title: string;
  onboardingStep2Desc: string;
  onboardingStep3Title: string;
  onboardingStep3Desc: string;
  onboardingStep4Title: string;
  onboardingStep4Desc: string;
  chooseLang: string;
  chooseLangDesc: string;

  // Role Selection
  howUse: string;
  howUseDesc: string;
  learnTitle: string;
  learnDesc: string;
  learnBtn: string;
  teachTitle: string;
  teachDesc: string;
  teachBtn: string;

  // Auth
  welcomeBack: string;
  createAccount: string;
  authDescLogin: string;
  authDescSignup: string;
  fullName: string;
  emailAddr: string;
  phoneNum: string;
  password: string;
  signIn: string;
  continueVerify: string;
  alreadyHaveAcc: string;
  dontHaveAcc: string;

  // Learner Dashboard
  discoverContent: string;
  dashboardDesc: string;
  searchPlaceholder: string;
  allContent: string;
  videoCourses: string;
  writtenPDFs: string;
  audioPodcasts: string;
  quizzes: string;
  noContent: string;
  comingSoon: string;
  preRelease: string;
  min: string;
  cap: string;

  // Feedback Section
  feedbackTitle: string;
  feedbackDesc: string;
  ratingLabel: string;
  categoryLabel: string;
  monetization: string;
  translations: string;
  uiux: string;
  other: string;
  feedbackPlaceholder: string;
  submitFeedback: string;
  feedbackSuccess: string;
  recentFeedback: string;

  // Ebook & Player
  startReading: string;
  pauseReading: string;
  rereadingFree: string;
  idlePaused: string;
  paymentCapped: string;
  liveEscrow: string;
  totalStreamed: string;
  creatorShare: string;
  platformShare: string;
  bursaryShare: string;
  aiTranslated: string;
  courseModules: string;

  // Creator Dashboard
  overview: string;
  overviewDesc: string;
  newCourse: string;
  totalRevenue: string;
  activeLearners: string;
  activeEngagement: string;
  engagementDesc: string;
  publishedContent: string;
  activityFeed: string;
  viewAll: string;
  minsEngaged: string;
  earned: string;

  // Pre-Release Hub
  preReleaseCourse: string;
  awaitingRelease: string;
  preReleaseDesc: string;
  requestCourse: string;
  courseRequested: string;
  pledgeFund: string;
  pledgedAmount: string;
  targetReached: string;

  // Landing Page Marketing
  landingTitle: string;
  landingTitleHighlight: string;
  landingSubtitle: string;
  landingCTA: string;
  landingWatchDemo: string;
  howItWorks: string;
  howItWorksDesc: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  creatorSectionTitle: string;
  creatorSectionDesc: string;
  creatorSectionBtn: string;
}

const translations: Record<LanguageCode, TranslationDict> = {
  en: {
    continue: "Continue",
    back: "Go Back",
    submit: "Submit",
    role: "Role",
    learner: "Learner",
    creator: "Creator",
    logoText: "Rheodemy",
    logIn: "Log In",
    becomeCreator: "Become a Creator",

    onboardingHeroTitle: "Your Learning Journey Begins",
    onboardingHeroDesc: "Scroll down to discover Rheodemy and customize your experience.",
    onboardingScrollPrompt: "Scroll to continue",
    onboardingStep1Title: "Pay by the Second",
    onboardingStep1Desc: "Funds flow from your Interledger wallet in real time. We only charge you for active consumption.",
    onboardingStep2Title: "Fair Escrow Splits",
    onboardingStep2Desc: "80% goes directly to the creator, 15% to support Rheodemy, and 5% to our Bursary fund.",
    onboardingStep3Title: "Protecting Slow Readers",
    onboardingStep3Desc: "Our smart reader pauses if you go idle, and caps costs per page so you never overpay.",
    onboardingStep4Title: "AI Translation Hub",
    onboardingStep4Desc: "Click a language below to translate the entire experience instantly, removing borders.",
    chooseLang: "Choose your language",
    chooseLangDesc: "Select your preferred language to get started with Rheodemy. You can always change this later in settings.",

    howUse: "How will you use Rheodemy?",
    howUseDesc: "Choose your primary role to customize your dashboard. Don't worry, you can always switch roles later.",
    learnTitle: "I want to Learn",
    learnDesc: "Access thousands of verified teachers, pay only for what you watch, and manage your learning budget easily.",
    learnBtn: "Join as a Learner",
    teachTitle: "I want to Teach",
    teachDesc: "Upload courses, set your price, and earn in real-time as students learn. Protected by our secure escrow system.",
    teachBtn: "Join as a Creator",

    welcomeBack: "Welcome back",
    createAccount: "Create an account",
    authDescLogin: "Enter your details to access your dashboard",
    authDescSignup: "Join Rheodemy and start your journey",
    fullName: "Full Name",
    emailAddr: "Email Address",
    phoneNum: "Phone Number",
    password: "Password",
    signIn: "Sign In",
    continueVerify: "Continue to Verification",
    alreadyHaveAcc: "Already have an account? Log in",
    dontHaveAcc: "Don't have an account? Sign up",

    discoverContent: "Discover Content",
    dashboardDesc: "Pay only for the minutes you actively learn. Once you hit the price cap, the content is yours forever.",
    searchPlaceholder: "Search topics, formats, creators...",
    allContent: "All Content",
    videoCourses: "Video Courses",
    writtenPDFs: "Written & PDFs",
    audioPodcasts: "Audio & Podcasts",
    quizzes: "Quizzes (Free)",
    noContent: "No content available for this format yet.",
    comingSoon: "Coming Soon",
    preRelease: "Pre-Release",
    min: "min",
    cap: "Cap",

    feedbackTitle: "Share Feedback & Help Us Improve",
    feedbackDesc: "We're in MVP phase. Let us know your thoughts on our streaming rate, system speed, or translations!",
    ratingLabel: "Overall Experience",
    categoryLabel: "Select Area",
    monetization: "Web Monetization",
    translations: "Translations",
    uiux: "UI/UX & Design",
    other: "Other",
    feedbackPlaceholder: "Write your suggestions or feedback here...",
    submitFeedback: "Submit Feedback",
    feedbackSuccess: "Thank you! Your feedback has been logged in the local system.",
    recentFeedback: "Recent Submitted Feedbacks",

    startReading: "Start Reading (Meter Starts)",
    pauseReading: "Pause Reading",
    rereadingFree: "Re-reading (Meter Paused)",
    idlePaused: "Idle (Streaming Paused)",
    paymentCapped: "Payment Capped (Enjoy reading!)",
    liveEscrow: "Live Payment Split",
    totalStreamed: "Total Streamed",
    creatorShare: "Creator (80%)",
    platformShare: "Rheodemy (15%)",
    bursaryShare: "Bursary Fund (5%)",
    aiTranslated: "AI Translated",
    courseModules: "Course Modules",

    overview: "Overview",
    overviewDesc: "Monitor your course performance, track earnings in real-time, and see how your students are engaging with your content today.",
    newCourse: "New Course",
    totalRevenue: "Total Revenue",
    activeLearners: "Active Learners",
    activeEngagement: "Active Engagement",
    engagementDesc: "Total minutes watched, read & listened",
    publishedContent: "Published Content",
    activityFeed: "Activity Feed",
    viewAll: "View all",
    minsEngaged: "mins engaged",
    earned: "earned",

    preReleaseCourse: "Pre-Release Course",
    awaitingRelease: "Awaiting Release & Funding",
    preReleaseDesc: "This course has not been released yet. The creator will publish it once it receives enough requests or pre-funding pledges.",
    requestCourse: "Request this Course",
    courseRequested: "Course Requested! Thank you.",
    pledgeFund: "Pledge Micro-monetization",
    pledgedAmount: "Escrow Pledge Meter",
    targetReached: "Goal Reached! Awaiting publishing.",

    landingTitle: "Learn without borders.",
    landingTitleHighlight: "Pay by the second.",
    landingSubtitle: "The world's first Web Monetization educational marketplace. No subscriptions. No ads. Just pure knowledge streamed directly to you, paying creators exactly what their content is worth.",
    landingCTA: "Start Learning Now",
    landingWatchDemo: "Watch Demo",
    howItWorks: "How Rheodemy Works",
    howItWorksDesc: "A paradigm shift in education economics. No upfront fees, no locked ecosystems.",
    feature1Title: "1. Connect ILP Wallet",
    feature1Desc: "Deposit funds into your secure Interledger wallet. It handles the micropayments so you never have to worry about credit card fees or currency conversions.",
    feature2Title: "2. Omni-Content Learning",
    feature2Desc: "Whether you prefer visually rich Videos, deep-dive Ebooks, or on-the-go Audio Podcasts, our unified player adapts to your learning style.",
    feature3Title: "3. Pay As You Go",
    feature3Desc: "Smart Contracts ensure the meter only runs when you are actively consuming *new* content. Rewatching or rereading is always 100% free.",
    creatorSectionTitle: "Earn exactly what your knowledge is worth.",
    creatorSectionDesc: "Stop waiting 30 days for payout minimums. Keep 80% of your revenue, streamed directly to your wallet every single second a student learns from you.",
    creatorSectionBtn: "Join the Creator Program",
  },
  fr: {
    continue: "Continuer",
    back: "Retourner",
    submit: "Soumettre",
    role: "Rôle",
    learner: "Apprenant",
    creator: "Créateur",
    logoText: "Rheodemy",
    logIn: "Se connecter",
    becomeCreator: "Devenir Créateur",

    onboardingHeroTitle: "Votre voyage d'apprentissage commence",
    onboardingHeroDesc: "Faites défiler vers le bas pour découvrir Rheodemy et personnaliser votre expérience.",
    onboardingScrollPrompt: "Faites défiler pour continuer",
    onboardingStep1Title: "Payez à la Seconde",
    onboardingStep1Desc: "Les fonds proviennent de votre portefeuille Interledger en temps réel. Nous ne facturons que la consommation active.",
    onboardingStep2Title: "Répartition Équitable des Escrow",
    onboardingStep2Desc: "80% vont directement au créateur, 15% pour soutenir Rheodemy et 5% à notre fonds de bourses.",
    onboardingStep3Title: "Protéger les Lecteurs Lents",
    onboardingStep3Desc: "Notre lecteur intelligent s'arrête si vous êtes inactif et plafonne les coûts par page pour que vous ne surpayiez jamais.",
    onboardingStep4Title: "Centre de Traduction IA",
    onboardingStep4Desc: "Cliquez sur une langue ci-dessous pour traduire instantanément toute l'expérience, en éliminant les frontières.",
    chooseLang: "Choisissez votre langue",
    chooseLangDesc: "Sélectionnez votre langue préférée pour commencer avec Rheodemy. Vous pouvez toujours modifier cela plus tard dans les paramètres.",

    howUse: "Comment utiliserez-vous Rheodemy ?",
    howUseDesc: "Choisissez votre rôle principal pour personnaliser votre tableau de bord. Ne vous inquiétez pas, vous pouvez changer plus tard.",
    learnTitle: "Je veux Apprendre",
    learnDesc: "Accédez à des milliers d'enseignants vérifiés, ne payez que ce que vous regardez et gérez facilement votre budget.",
    learnBtn: "Rejoindre en tant qu'apprenant",
    teachTitle: "Je veux Enseigner",
    teachDesc: "Téléchargez des cours, fixez vos prix et gagnez en temps réel. Protégé par notre système d'entiercement sécurisé.",
    teachBtn: "Rejoindre en tant que créateur",

    welcomeBack: "Bon retour",
    createAccount: "Créer un compte",
    authDescLogin: "Entrez vos coordonnées pour accéder à votre tableau de bord",
    authDescSignup: "Rejoignez Rheodemy et commencez votre voyage",
    fullName: "Nom complet",
    emailAddr: "Adresse e-mail",
    phoneNum: "Numéro de téléphone",
    password: "Mot de passe",
    signIn: "Se connecter",
    continueVerify: "Continuer vers la vérification",
    alreadyHaveAcc: "Vous avez déjà un compte ? Connexion",
    dontHaveAcc: "Vous n'avez pas de compte ? S'inscrire",

    discoverContent: "Découvrir le contenu",
    dashboardDesc: "Ne payez que pour les minutes que vous apprenez activement. Une fois le plafond atteint, le cours est à vous pour toujours.",
    searchPlaceholder: "Rechercher des sujets, formats, créateurs...",
    allContent: "Tout le contenu",
    videoCourses: "Cours vidéo",
    writtenPDFs: "Écrits & PDFs",
    audioPodcasts: "Audio & Podcasts",
    quizzes: "Quiz (Gratuit)",
    noContent: "Aucun contenu disponible pour ce format pour le moment.",
    comingSoon: "Bientôt disponible",
    preRelease: "Pré-lancement",
    min: "min",
    cap: "Plafond",

    feedbackTitle: "Partagez vos commentaires et aidez-nous à nous améliorer",
    feedbackDesc: "Nous sommes en phase MVP. Donnez-nous votre avis sur nos tarifs, la rapidité du système ou les traductions !",
    ratingLabel: "Expérience globale",
    categoryLabel: "Sélectionner la zone",
    monetization: "Monétisation Web",
    translations: "Traductions",
    uiux: "UI/UX & Design",
    other: "Autre",
    feedbackPlaceholder: "Écrivez vos suggestions ou commentaires ici...",
    submitFeedback: "Soumettre des commentaires",
    feedbackSuccess: "Merci ! Vos commentaires ont été enregistrés dans le système local.",
    recentFeedback: "Commentaires récemment soumis",

    startReading: "Commencer la lecture (Le compteur démarre)",
    pauseReading: "Pause de lecture",
    rereadingFree: "Relecture (Compteur en pause)",
    idlePaused: "Inactif (Monétisation en pause)",
    paymentCapped: "Paiement plafonné (Bonne lecture !)",
    liveEscrow: "Répartition en direct",
    totalStreamed: "Total diffusé",
    creatorShare: "Créateur (80%)",
    platformShare: "Rheodemy (15%)",
    bursaryShare: "Fonds de bourses (5%)",
    aiTranslated: "Traduit par l'IA",
    courseModules: "Modules de cours",

    overview: "Aperçu",
    overviewDesc: "Suivez les performances de vos cours, suivez vos gains en temps réel et analysez l'engagement des étudiants.",
    newCourse: "Nouveau cours",
    totalRevenue: "Revenu total",
    activeLearners: "Apprenants actifs",
    activeEngagement: "Engagement actif",
    engagementDesc: "Minutes totales regardées, lues et écoutées",
    publishedContent: "Contenu publié",
    activityFeed: "Flux d'activité",
    viewAll: "Voir tout",
    minsEngaged: "min engagées",
    earned: "gagné",

    preReleaseCourse: "Cours en pré-lancement",
    awaitingRelease: "En attente de sortie et financement",
    preReleaseDesc: "Ce cours n'est pas encore sorti. Le créateur le publiera dès qu'il recevra suffisamment de demandes ou de promesses de financement.",
    requestCourse: "Demander ce cours",
    courseRequested: "Cours demandé ! Merci.",
    pledgeFund: "Promettre une micro-monétisation",
    pledgedAmount: "Compteur de promesses Escrow",
    targetReached: "Objectif atteint ! En attente de publication.",

    landingTitle: "Apprendre sans frontières.",
    landingTitleHighlight: "Payez à la seconde.",
    landingSubtitle: "La première plateforme éducative monétisée du Web. Sans abonnement. Sans publicité. Des connaissances pures diffusées en direct, rémunérant équitablement les créateurs.",
    landingCTA: "Commencer à apprendre",
    landingWatchDemo: "Voir la démo",
    howItWorks: "Comment fonctionne Rheodemy",
    howItWorksDesc: "Un changement de paradigme dans l'économie de l'éducation. Pas de frais initiaux.",
    feature1Title: "1. Connecter le portefeuille ILP",
    feature1Desc: "Déposez des fonds dans votre portefeuille sécurisé Interledger. Il gère les micropaiements sans frais de carte.",
    feature2Title: "2. Apprentissage omni-contenu",
    feature2Desc: "Que vous préfériez les vidéos, les livres électroniques ou les podcasts audio, notre lecteur s'adapte à votre style.",
    feature3Title: "3. Payer à l'utilisation",
    feature3Desc: "Les contrats intelligents garantissent que le compteur ne tourne que lorsque vous consommez de nouveaux contenus.",
    creatorSectionTitle: "Gagnez exactement ce que vaut votre savoir.",
    creatorSectionDesc: "Conservez 80% de vos revenus, versés directement sur votre portefeuille à chaque seconde d'apprentissage d'un étudiant.",
    creatorSectionBtn: "Rejoindre le programme Créateur",
  },
  pt: {
    continue: "Continuar",
    back: "Voltar",
    submit: "Enviar",
    role: "Função",
    learner: "Aluno",
    creator: "Criador",
    logoText: "Rheodemy",
    logIn: "Entrar",
    becomeCreator: "Tornar-se Criador",

    onboardingHeroTitle: "Sua Jornada de Aprendizado Começa",
    onboardingHeroDesc: "Role para baixo para descobrir a Rheodemy e personalizar seu perfil.",
    onboardingScrollPrompt: "Role para continuar",
    onboardingStep1Title: "Pague por Segundo",
    onboardingStep1Desc: "Os fundos fluem da sua carteira Interledger em tempo real. Cobramos apenas pelo consumo ativo.",
    onboardingStep2Title: "Divisão Justa de Escrow",
    onboardingStep2Desc: "80% vai direto para o criador, 15% para a Rheodemy e 5% para o nosso fundo de bolsas de estudo.",
    onboardingStep3Title: "Protegendo Leitores Lentos",
    onboardingStep3Desc: "Nosso leitor inteligente pausa se você ficar inativo e limita os custos por página para que você nunca pague a mais.",
    onboardingStep4Title: "Central de Tradução IA",
    onboardingStep4Desc: "Clique em um idioma abaixo para traduzir toda a experiência instantaneamente, eliminando fronteiras.",
    chooseLang: "Escolha seu idioma",
    chooseLangDesc: "Selecione seu idioma preferido para começar com a Rheodemy. Você sempre pode mudar isso depois nas configurações.",

    howUse: "Como você usará a Rheodemy?",
    howUseDesc: "Escolha sua função principal para personalizar seu painel. Não se preocupe, você pode mudar de ideia depois.",
    learnTitle: "Quero Aprender",
    learnDesc: "Acesse milhares de professores certificados, pague apenas pelo que assistir e gerencie seu orçamento facilmente.",
    learnBtn: "Entrar como Aluno",
    teachTitle: "Quero Ensinar",
    teachDesc: "Envie cursos, defina seu preço e ganhe em tempo real. Protegido por nosso sistema de custódia seguro.",
    teachBtn: "Entrar como Criador",

    welcomeBack: "Bem-vindo de volta",
    createAccount: "Criar uma conta",
    authDescLogin: "Insira seus dados para acessar seu painel",
    authDescSignup: "Junte-se à Rheodemy e comece sua jornada",
    fullName: "Nome Completo",
    emailAddr: "Endereço de E-mail",
    phoneNum: "Número de Telefone",
    password: "Senha",
    signIn: "Entrar",
    continueVerify: "Continuar para a Verificação",
    alreadyHaveAcc: "Já tem uma conta? Entrar",
    dontHaveAcc: "Não tem uma conta? Cadastre-se",

    discoverContent: "Descobrir Conteúdo",
    dashboardDesc: "Pague apenas pelos minutos que você realmente estuda. Ao atingir o limite de preço, o conteúdo é seu para sempre.",
    searchPlaceholder: "Pesquise tópicos, formatos, criadores...",
    allContent: "Todo o Conteúdo",
    videoCourses: "Cursos de Vídeo",
    writtenPDFs: "Escritos e PDFs",
    audioPodcasts: "Áudio e Podcasts",
    quizzes: "Quizes (Grátis)",
    noContent: "Nenhum conteúdo disponível para este formato ainda.",
    comingSoon: "Em breve",
    preRelease: "Pré-lançamento",
    min: "min",
    cap: "Limite",

    feedbackTitle: "Compartilhe seu Feedback e Ajude-nos a Melhorar",
    feedbackDesc: "Estamos na fase MVP. Diga-nos o que achou das tarifas, velocidade do sistema ou das traduções!",
    ratingLabel: "Experiência Geral",
    categoryLabel: "Selecionar Área",
    monetization: "Monetização Web",
    translations: "Traduções",
    uiux: "UI/UX & Design",
    other: "Outro",
    feedbackPlaceholder: "Escreva suas sugestões ou feedback aqui...",
    submitFeedback: "Enviar Feedback",
    feedbackSuccess: "Obrigado! Seu feedback foi registrado no sistema local.",
    recentFeedback: "Feedbacks Enviados Recentemente",

    startReading: "Iniciar Leitura (Inicia o medidor)",
    pauseReading: "Pausar Leitura",
    rereadingFree: "Releitura (Medidor pausado)",
    idlePaused: "Inativo (Monetização pausada)",
    paymentCapped: "Pagamento Limitado (Aproveite a leitura!)",
    liveEscrow: "Divisão de Pagamento ao Vivo",
    totalStreamed: "Total Transmitido",
    creatorShare: "Criador (80%)",
    platformShare: "Rheodemy (15%)",
    bursaryShare: "Fundo de Bolsas (5%)",
    aiTranslated: "Traduzido por IA",
    courseModules: "Módulos do Curso",

    overview: "Visão Geral",
    overviewDesc: "Monitore o desempenho dos seus cursos, acompanhe seus ganhos em tempo real e veja o engajamento dos alunos.",
    newCourse: "Novo Curso",
    totalRevenue: "Receita Total",
    activeLearners: "Alunos Ativos",
    activeEngagement: "Engajamento Ativo",
    engagementDesc: "Total de minutos assistidos, lidos e ouvidos",
    publishedContent: "Conteúdo Publicado",
    activityFeed: "Feed de Atividades",
    viewAll: "Ver tudo",
    minsEngaged: "min engajados",
    earned: "ganho",

    preReleaseCourse: "Curso em Pré-lançamento",
    awaitingRelease: "Aguardando Lançamento e Financiamento",
    preReleaseDesc: "Este curso ainda não foi lançado. O criador irá publicá-lo assim que receber pedidos ou promessas de financiamento suficientes.",
    requestCourse: "Solicitar este Curso",
    courseRequested: "Curso solicitado! Obrigado.",
    pledgeFund: "Prometer Micro-monetização",
    pledgedAmount: "Medidor de Promessas Escrow",
    targetReached: "Meta Atingida! Aguardando publicação.",

    landingTitle: "Aprenda sem fronteiras.",
    landingTitleHighlight: "Pague por segundo.",
    landingSubtitle: "O primeiro mercado educacional com monetização Web do mundo. Sem assinaturas. Sem anúncios. Apenas conhecimento puro transmitido diretamente a você, pagando aos criadores de forma justa.",
    landingCTA: "Começar a Aprender Agora",
    landingWatchDemo: "Ver Demonstração",
    howItWorks: "Como a Rheodemy Funciona",
    howItWorksDesc: "Uma mudança de paradigma na economia da educação. Sem taxas iniciais.",
    feature1Title: "1. Conectar Carteira ILP",
    feature1Desc: "Deposite fundos em sua carteira segura Interledger. Ela lida com micropagamentos para que você nunca se preocupe com taxas.",
    feature2Title: "2. Aprendizagem Omni-Conteúdo",
    feature2Desc: "Quer prefira vídeos interativos, e-books detalhados ou podcasts de áudio, nosso player unificado se adapta.",
    feature3Title: "3. Pague pelo que usar",
    feature3Desc: "Os contratos inteligentes garantem que o medidor só funcione quando você consome conteúdo novo. Reler é grátis.",
    creatorSectionTitle: "Ganhe exatamente o que seu conhecimento vale.",
    creatorSectionDesc: "Mantenha 80% de sua receita, transmitida diretamente para sua carteira a cada segundo que um aluno aprende com você.",
    creatorSectionBtn: "Juntar-se ao Programa de Criadores",
  },
  es: {
    continue: "Continuar",
    back: "Volver",
    submit: "Enviar",
    role: "Rol",
    learner: "Estudiante",
    creator: "Creador",
    logoText: "Rheodemy",
    logIn: "Iniciar sesión",
    becomeCreator: "Convertirse en Creador",

    onboardingHeroTitle: "Tu viaje de aprendizaje comienza",
    onboardingHeroDesc: "Desplázate hacia abajo para descubrir Rheodemy y personalizar tu perfil.",
    onboardingScrollPrompt: "Desplázate para continuar",
    onboardingStep1Title: "Paga por segundo",
    onboardingStep1Desc: "Los fondos fluyen desde tu billetera Interledger en tiempo real. Solo cobramos por el consumo activo.",
    onboardingStep2Title: "Distribución justa de Escrow",
    onboardingStep2Desc: "El 80% va directamente al creador, el 15% apoya a Rheodemy y el 5% se destina a nuestro fondo de becas.",
    onboardingStep3Title: "Protección de lectores lentos",
    onboardingStep3Desc: "Nuestro lector inteligente se pausa si estás inactivo y limita los costos por página para que nunca pagues de más.",
    onboardingStep4Title: "Centro de traducción de IA",
    onboardingStep4Desc: "Haz clic en un idioma a continuación para traducir toda la experiencia al instante, eliminando fronteras.",
    chooseLang: "Elige tu idioma",
    chooseLangDesc: "Selecciona tu idioma preferido para comenzar con Rheodemy. Siempre puedes cambiarlo más tarde en la configuración.",

    howUse: "¿Cómo usarás Rheodemy?",
    howUseDesc: "Elige tu rol principal para personalizar tu panel. No te preocupes, siempre puedes cambiar de rol más tarde.",
    learnTitle: "Quiero aprender",
    learnDesc: "Accede a miles de profesores certificados, paga solo por lo que ves y administra tu presupuesto fácilmente.",
    learnBtn: "Unirse como Estudiante",
    teachTitle: "Quiero enseñar",
    teachDesc: "Sube cursos, establece tu precio y gana dinero en tiempo real mientras los estudiantes aprenden. Protegido por custodia segura.",
    teachBtn: "Unirse como Creador",

    welcomeBack: "Bienvenido de nuevo",
    createAccount: "Crear una cuenta",
    authDescLogin: "Ingresa tus datos para acceder a tu panel",
    authDescSignup: "Únete a Rheodemy y comienza tu viaje",
    fullName: "Nombre completo",
    emailAddr: "Dirección de correo",
    phoneNum: "Número de teléfono",
    password: "Contraseña",
    signIn: "Iniciar sesión",
    continueVerify: "Continuar a la verificación",
    alreadyHaveAcc: "¿Ya tienes cuenta? Iniciar sesión",
    dontHaveAcc: "¿No tienes cuenta? Registrarse",

    discoverContent: "Descubrir contenido",
    dashboardDesc: "Paga solo por los minutos que estudias activamente. Una vez que alcanzas el límite de precio, el contenido es tuyo para siempre.",
    searchPlaceholder: "Buscar temas, formatos, creadores...",
    allContent: "Todo el contenido",
    videoCourses: "Cursos de video",
    writtenPDFs: "Escritos y PDFs",
    audioPodcasts: "Audio y Podcasts",
    quizzes: "Exámenes (Gratis)",
    noContent: "Aún no hay contenido disponible para este formato.",
    comingSoon: "Próximamente",
    preRelease: "Próximo lanzamiento",
    min: "min",
    cap: "Límite",

    feedbackTitle: "Comparte tus comentarios y ayúdanos a mejorar",
    feedbackDesc: "Estamos en fase MVP. ¡Cuéntanos tu opinión sobre nuestras tarifas, velocidad del sistema o traducciones!",
    ratingLabel: "Experiencia general",
    categoryLabel: "Seleccionar área",
    monetization: "Monetización Web",
    translations: "Traducciones",
    uiux: "UI/UX y Diseño",
    other: "Otro",
    feedbackPlaceholder: "Escribe tus sugerencias o comentarios aquí...",
    submitFeedback: "Enviar comentarios",
    feedbackSuccess: "¡Gracias! Tus comentarios se han registrado en el sistema local.",
    recentFeedback: "Comentarios enviados recientemente",

    startReading: "Comenzar a leer (El medidor inicia)",
    pauseReading: "Pausar lectura",
    rereadingFree: "Relectura (Medidor pausado)",
    idlePaused: "Inactivo (Monetización pausada)",
    paymentCapped: "Pago limitado (¡Disfruta la lectura!)",
    liveEscrow: "División de pago en vivo",
    totalStreamed: "Total transmitido",
    creatorShare: "Creador (80%)",
    platformShare: "Rheodemy (15%)",
    bursaryShare: "Fondo de becas (5%)",
    aiTranslated: "Traducido por IA",
    courseModules: "Módulos del curso",

    overview: "Resumen",
    overviewDesc: "Monitorea el rendimiento de tus cursos, realiza un seguimiento de tus ganancias en tiempo real y analiza el compromiso.",
    newCourse: "Nuevo curso",
    totalRevenue: "Ingresos totales",
    activeLearners: "Estudiantes activos",
    activeEngagement: "Compromiso activo",
    engagementDesc: "Minutos totales reproducidos, leídos y escuchados",
    publishedContent: "Contenido publicado",
    activityFeed: "Flujo de actividad",
    viewAll: "Ver todo",
    minsEngaged: "min comprometidos",
    earned: "ganado",

    preReleaseCourse: "Curso próximo a lanzarse",
    awaitingRelease: "A la espera de lanzamiento y financiación",
    preReleaseDesc: "Este curso aún no se ha lanzado. El creador lo publicará una vez que reciba suficientes solicitudes o promesas de fondos.",
    requestCourse: "Solicitar este curso",
    courseRequested: "¡Curso solicitado! Gracias.",
    pledgeFund: "Prometer micro-monetización",
    pledgedAmount: "Medidor de promesas Escrow",
    targetReached: "¡Meta alcanzada! A la espera de publicación.",

    landingTitle: "Aprende sin fronteras.",
    landingTitleHighlight: "Paga por segundo.",
    landingSubtitle: "El primer mercado educativo de monetización Web del mundo. Sin suscripciones. Sin anuncios. Solo conocimiento puro transmitido directamente, pagando a los creadores de forma justa.",
    landingCTA: "Comenzar a Aprender Ahora",
    landingWatchDemo: "Ver Demostración",
    howItWorks: "Cómo Funciona Rheodemy",
    howItWorksDesc: "Un cambio de paradigma en la economía de la educación. Sin tarifas iniciales.",
    feature1Title: "1. Conectar Billetera ILP",
    feature1Desc: "Deposita fondos en tu billetera Interledger segura. Maneja los micropagos para que nunca te preocupes por comisiones de tarjeta.",
    feature2Title: "2. Aprendizaje de Omni-Contenido",
    feature2Desc: "Ya sea que prefieras videos enriquecidos, libros electrónicos detallados o podcasts de audio, nuestro reproductor se adapta.",
    feature3Title: "3. Paga al consumir",
    feature3Desc: "Los contratos inteligentes garantizan que el medidor solo funcione cuando consumes contenido *nuevo*. Releer es 100% gratis.",
    creatorSectionTitle: "Gana exactamente lo que vale tu conocimiento.",
    creatorSectionDesc: "Conserva el 80% de tus ingresos, transmitidos directamente a tu billetera cada segundo que un estudiante aprende de ti.",
    creatorSectionBtn: "Unirse al Programa de Creadores",
  },
  ar: {
    continue: "استمرار",
    back: "العودة للخلف",
    submit: "إرسال",
    role: "الدور",
    learner: "طالب علم",
    creator: "منشئ محتوى",
    logoText: "ريوديمي",
    logIn: "تسجيل الدخول",
    becomeCreator: "كن منشئ محتوى",

    onboardingHeroTitle: "تبدأ رحلة التعلم الخاصة بك",
    onboardingHeroDesc: "قم بالتمرير لأسفل لاكتشاف ريوديمي وتخصيص تجربتك.",
    onboardingScrollPrompt: "قم بالتمرير للاستمرار",
    onboardingStep1Title: "الدفع بالثانية",
    onboardingStep1Desc: "تتدفق الأموال من محفظة إنترليجر الخاصة بك في الوقت الفعلي. نحن نفرض رسومًا فقط مقابل الاستهلاك النشط.",
    onboardingStep2Title: "تقسيم عادل للضمان",
    onboardingStep2Desc: "يذهب 80% مباشرة إلى منشئ المحتوى، و 15% لدعم ريوديمي، و 5% إلى صندوق المنح الدراسية لدينا.",
    onboardingStep3Title: "حماية القراء البطيئين",
    onboardingStep3Desc: "يتوقف القارئ الذكي مؤقتًا إذا أصبحت خاملًا، ويضع حدًا أقصى للتكاليف لكل صفحة حتى لا تدفع مبالغ زائدة.",
    onboardingStep4Title: "مركز الترجمة بالذكاء الاصطناعي",
    onboardingStep4Desc: "انقر فوق اللغة أدناه لترجمة التجربة بأكملها على الفور، وإزالة الحدود.",
    chooseLang: "اختر لغتك",
    chooseLangDesc: "حدد لغتك المفضلة للبدء مع ريوديمي. يمكنك دائمًا تغيير ذلك لاحقًا في الإعدادات.",

    howUse: "كيف ستستخدم ريوديمي؟",
    howUseDesc: "اختر دورك الرئيسي لتخصيص لوحة التحكم الخاصة بك. لا تقلق، يمكنك دائمًا تبديل الأدوار لاحقًا.",
    learnTitle: "أريد أن أتعلم",
    learnDesc: "الوصول إلى آلاف المعلمين المعتمدين، والدفع فقط مقابل ما تشاهده، وإدارة ميزانية التعلم الخاصة بك بسهولة.",
    learnBtn: "انضم كطالب علم",
    teachTitle: "أريد أن أعلّم",
    teachDesc: "قم بتحميل الدورات، وحدد سعرك، واكسب في الوقت الفعلي أثناء تعلم الطلاب. محمي بنظام الضمان الآمن لدينا.",
    teachBtn: "انضم كمنشئ محتوى",

    welcomeBack: "مرحبًا بعودتك",
    createAccount: "إنشاء حساب",
    authDescLogin: "أدخل بياناتك للوصول إلى لوحة التحكم الخاصة بك",
    authDescSignup: "انضم إلى ريوديمي وابدأ رحلتك",
    fullName: "الاسم الكامل",
    emailAddr: "عنوان البريد الإلكتروني",
    phoneNum: "رقم الهاتف",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    continueVerify: "الاستمرار في التحقق",
    alreadyHaveAcc: "هل لديك حساب بالفعل؟ تسجيل الدخول",
    dontHaveAcc: "ليس لديك حساب؟ تسجيل جديد",

    discoverContent: "اكتشف المحتوى",
    dashboardDesc: "ادفع فقط مقابل الدقائق التي تتعلم فيها بنشاط. بمجرد وصولك إلى الحد الأقصى للسعر، يصبح المحتوى ملكك للأبد.",
    searchPlaceholder: "ابحث في المواضيع والتنسيقات ومنشئي المحتوى...",
    allContent: "كل المحتوى",
    videoCourses: "دورات الفيديو",
    writtenPDFs: "المكتوبة وملفات PDF",
    audioPodcasts: "الصوت والبودكاست",
    quizzes: "الاختبارات (مجانية)",
    noContent: "لا يوجد محتوى متاح لهذا التنسيق بعد.",
    comingSoon: "قريبًا",
    preRelease: "قبل الإطلاق",
    min: "دقيقة",
    cap: "الحد الأقصى",

    feedbackTitle: "شارك برأيك وساعدنا على التحسن",
    feedbackDesc: "نحن في مرحلة المشروع الأولي. أخبرنا بأفكارك حول معدل التدفق، أو سرعة النظام، أو الترجمات!",
    ratingLabel: "التجربة العامة",
    categoryLabel: "حدد المنطقة",
    monetization: "تحقيق الدخل من الويب",
    translations: "الترجمات",
    uiux: "واجهة المستخدم والتصميم",
    other: "أخرى",
    feedbackPlaceholder: "اكتب اقتراحاتك أو ملاحظاتك هنا...",
    submitFeedback: "إرسال التعليقات",
    feedbackSuccess: "شكرًا لك! تم تسجيل ملاحظاتك في النظام المحلي بنجاح.",
    recentFeedback: "التعليقات المرسلة مؤخرًا",

    startReading: "بدء القراءة (يبدأ العداد)",
    pauseReading: "إيقاف القراءة مؤقتًا",
    rereadingFree: "إعادة القراءة (العداد متوقف مؤقتًا)",
    idlePaused: "خامل (تم إيقاف تدفع الدفع مؤقتًا)",
    paymentCapped: "تم تحديد سقف الدفع (استمتع بالقراءة!)",
    liveEscrow: "تقسيم الدفع المباشر",
    totalStreamed: "إجمالي تدفق الدفع",
    creatorShare: "منشئ المحتوى (80%)",
    platformShare: "ريوديمي (15%)",
    bursaryShare: "صندوق المنح الدراسية (5%)",
    aiTranslated: "مترجم بالذكاء الاصطناعي",
    courseModules: "وحدات الدورة",

    overview: "نظرة عامة",
    overviewDesc: "راقب أداء دورتك التدريبية، وتتبع الأرباح في الوقت الفعلي، وشاهد مدى تفاعل طلابك اليوم.",
    newCourse: "دورة جديدة",
    totalRevenue: "إجمالي الإيرادات",
    activeLearners: "الطلاب النشطون",
    activeEngagement: "التفاعل النشط",
    engagementDesc: "إجمالي دقائق المشاهدة والقراءة والاستماع",
    publishedContent: "المحتوى المنشور",
    activityFeed: "آخر الأنشطة",
    viewAll: "عرض الكل",
    minsEngaged: "دقائق التفاعل",
    earned: "مكتسب",

    preReleaseCourse: "دورة ما قبل الإطلاق",
    awaitingRelease: "في انتظار الإطلاق والتمويل",
    preReleaseDesc: "هذه الدورة لم يتم إطلاقها بعد. سينشرها منشئ المحتوى بمجرد تلقيه طلبات كافية أو تعهدات تمويل مسبق.",
    requestCourse: "طلب هذه الدورة",
    courseRequested: "تم طلب الدورة! شكرًا لك.",
    pledgeFund: "تعهد بالدفع المصغر",
    pledgedAmount: "مقياس تعهدات الضمان",
    targetReached: "تم الوصول إلى الهدف! في انتظار النشر.",

    landingTitle: "تعلم بدون حدود.",
    landingTitleHighlight: "ادفع بالثانية.",
    landingSubtitle: "أول سوق تعليمي لتحقيق الدخل من الويب في العالم. بدون اشتراكات. بدون إعلانات. معرفة نقية تتدفق إليك مباشرة، مع دفع مستحقات منشئي المحتوى بالعدل.",
    landingCTA: "ابدأ التعلم الآن",
    landingWatchDemo: "شاهد العرض التجريبي",
    howItWorks: "كيف تعمل ريوديمي",
    howItWorksDesc: "نقلة نوعية في اقتصاديات التعليم. بدون رسوم مسبقة.",
    feature1Title: "1. ربط محفظة ILP",
    feature1Desc: "أودع الأموال في محفظة إنترليجر الآمنة الخاصة بك. تتعامل مع المدفوعات الصغيرة لتجنب رسوم البطاقات.",
    feature2Title: "2. تعلم متعدد التنسيقات",
    feature2Desc: "سواء كنت تفضل الفيديوهات الغنية، أو الكتب الإلكترونية التفصيلية، أو البودكاست الصوتي، فإن مشغلنا الموحد يتكيف معك.",
    feature3Title: "3. الدفع أولاً بأول",
    feature3Desc: "تضمن العقود الذكية تشغيل العداد فقط عند استهلاك محتوى *جديد*. إعادة المشاهدة أو القراءة مجانية تمامًا.",
    creatorSectionTitle: "اكسب ما تستحقه معرفتك تمامًا.",
    creatorSectionDesc: "احتفظ بنسبة 80% من أرباحك، التي تتدفق مباشرة إلى محفظتك في كل ثانية يتعلم فيها الطالب منك.",
    creatorSectionBtn: "الانضمام إلى برنامج منشئي المحتوى",
  },
  sw: {
    continue: "Endelea",
    back: "Rudi Nyuma",
    submit: "Wasilisha",
    role: "Jukumu",
    learner: "Mwanafunzi",
    creator: "Muundaji",
    logoText: "Rheodemy",
    logIn: "Ingia",
    becomeCreator: "Kuwa Muundaji",

    onboardingHeroTitle: "Safari yako ya Kujifunza Inaanza",
    onboardingHeroDesc: "Nenda chini ili ugundue Rheodemy na usanidi wasifu wako.",
    onboardingScrollPrompt: "Nenda chini ili uendelee",
    onboardingStep1Title: "Lipa kwa Sekunde",
    onboardingStep1Desc: "Pesa zinatoka kwenye pochi yako ya Interledger kwa muda halisi. Tunatoza tu unaposoma au kusikiliza.",
    onboardingStep2Title: "Mgawanyo wa Haki wa Escrow",
    onboardingStep2Desc: "80% inaenda moja kwa moja kwa muundaji, 15% kusaidia Rheodemy, na 5% kwa mfuko wetu wa ufadhili wa masomo.",
    onboardingStep3Title: "Kuwakinga Wasomaji wa Polepole",
    onboardingStep3Desc: "Msomaji wetu mahiri anasimama usipojishughulisha, na kuweka kikomo cha gharama kwa kila ukurasa ili usilipe zaidi.",
    onboardingStep4Title: "Kituo cha Tafsiri cha AI",
    onboardingStep4Desc: "Bofya lugha hapa chini ili kutafsiri mfumo mzima mara moja, kuondoa mipaka.",
    chooseLang: "Chagua lugha yako",
    chooseLangDesc: "Chagua lugha unayopendelea ili kuanza na Rheodemy. Unaweza kubadilisha hii baadaye kwenye mipangilio.",

    howUse: "Je, utatumia vipi Rheodemy?",
    howUseDesc: "Chagua jukumu lako kuu ili kubinafsisha dashibodi yako. Usijali, unaweza kubadilisha jukumu lako baadaye.",
    learnTitle: "Nataka Kujifunza",
    learnDesc: "Pata walimu wengi waliothibitishwa, lipa tu kwa kile unachotazama, na udhibiti bajeti yako ya kujifunza kwa urahisi.",
    learnBtn: "Jiunge kama Mwanafunzi",
    teachTitle: "Nataka Kufundisha",
    teachDesc: "Pakia kozi, weka bei yako, na upate mapato kwa muda halisi wanafunzi wanapojifunza. Inalindwa na mfumo wetu salama wa escrow.",
    teachBtn: "Jiunge kama Muundaji",

    welcomeBack: "Karibu tena",
    createAccount: "Fungua akaunti",
    authDescLogin: "Ingiza maelezo yako ili kufikia dashibodi yako",
    authDescSignup: "Jiunge na Rheodemy na uanze safari yako",
    fullName: "Majina Kamili",
    emailAddr: "Barua Pepe",
    phoneNum: "Nambari ya Simu",
    password: "Nywila",
    signIn: "Ingia",
    continueVerify: "Endelea kwenye Uhakiki",
    alreadyHaveAcc: "Tayari una akaunti? Ingia",
    dontHaveAcc: "Huna akaunti? Jisajili",

    discoverContent: "Gundua Maudhui",
    dashboardDesc: "Lipa tu kwa dakika unazojifunza kikamilifu. Mara tu unapofikisha kikomo cha bei, maudhui ni yako milele.",
    searchPlaceholder: "Tafuta mada, miundo, waandishi...",
    allContent: "Maudhui Yote",
    videoCourses: "Kozi za Video",
    writtenPDFs: "Maandishi & PDF",
    audioPodcasts: "Sauti & Podikasti",
    quizzes: "Chemsha Bongo (Bure)",
    noContent: "Hakuna maudhui yanayopatikana kwa muundo huu bado.",
    comingSoon: "Inakuja Hivi Karibuni",
    preRelease: "Kabla ya Toleo",
    min: "dak",
    cap: "Kikomo",

    feedbackTitle: "Wasilisha Maoni na Utusaidie Kuboresha",
    feedbackDesc: "Tuko katika awamu ya MVP. Tujulishe maoni yako kuhusu viwango vya malipo, kasi ya mfumo, au tafsiri!",
    ratingLabel: "Uzoefu wa Jumla",
    categoryLabel: "Chagua Eneo",
    monetization: "Malipo ya Mtandao (Web Monetization)",
    translations: "Tafsiri",
    uiux: "Muundo & UI/UX",
    other: "Mengineyo",
    feedbackPlaceholder: "Andika mapendekezo au maoni yako hapa...",
    submitFeedback: "Wasilisha Maoni",
    feedbackSuccess: "Asante! Maoni yako yamerekodiwa kwenye mfumo wa ndani.",
    recentFeedback: "Maoni Yaliyowasilishwa Hivi Karibuni",

    startReading: "Anza Kusoma (Mita inaanza)",
    pauseReading: "Simamisha Kusoma",
    rereadingFree: "Kusoma Tena (Mita imesimama)",
    idlePaused: "Hautumii (Mita imesimama)",
    paymentCapped: "Malipo Yamefika Kikomo (Furahia kusoma bure!)",
    liveEscrow: "Mgawanyo wa Malipo Papo Hapo",
    totalStreamed: "Jumla ya Malipo",
    creatorShare: "Muundaji (80%)",
    platformShare: "Rheodemy (15%)",
    bursaryShare: "Mfuko wa Bursary (5%)",
    aiTranslated: "Imetafsiriwa na AI",
    courseModules: "Moduli za Kozi",

    overview: "Muhtasari",
    overviewDesc: "Fuatilia utendaji wa kozi zako, fuatilia mapato kwa muda halisi, na uone jinsi wanafunzi wanavyojifunza leo.",
    newCourse: "Kozi Mpya",
    totalRevenue: "Jumla ya Mapato",
    activeLearners: "Wanafunzi Wanaojifunza",
    activeEngagement: "Muda Uliotumika",
    engagementDesc: "Jumla ya dakika zilizotazamwa, kusomwa & kusikilizwa",
    publishedContent: "Maudhui Yaliyochapishwa",
    activityFeed: "Mlisho wa Shughuli",
    viewAll: "Tazama zote",
    minsEngaged: "dak zilizotumika",
    earned: "zilizopatikana",

    preReleaseCourse: "Kozi ya Kabla ya Toleo",
    awaitingRelease: "Inasubiri Kutolewa & Kufadhiliwa",
    preReleaseDesc: "Kozi hii haijatolewa bado. Muundaji ataichapisha punde tu atakapopokea maombi ya kutosha au ahadi za ufadhili.",
    requestCourse: "Omba Kozi Hii",
    courseRequested: "Ombi la Kozi Limepokelewa! Asante.",
    pledgeFund: "Ahadi ya Micro-monetization",
    pledgedAmount: "Mita ya Ahadi za Escrow",
    targetReached: "Lengo Limefikiwa! Inasubiri kuchapishwa.",

    landingTitle: "Jifunze bila mipaka.",
    landingTitleHighlight: "Lipa kwa sekunde.",
    landingSubtitle: "Soko la kwanza ulimwenguni la elimu la Web Monetization. Hakuna usajili. Hakuna matangazo. Maarifa halisi yanayotumwa kwako moja kwa moja, huku waalimu wakilipwa kwa haki.",
    landingCTA: "Anza Kujifunza Sasa",
    landingWatchDemo: "Tazama Onyesho",
    howItWorks: "Jinsi Rheodemy Inavyofanya Kazi",
    howItWorksDesc: "Mabadiliko makubwa katika uchumi wa elimu. Hakuna ada za mapema.",
    feature1Title: "1. Unganisha Pochi ya ILP",
    feature1Desc: "Weka pesa kwenye pochi yako salama ya Interledger. Inashughulikia malipo madogo ili usiwaze ada za kadi.",
    feature2Title: "2. Mafunzo ya Maudhui Mseto",
    feature2Desc: "Iwe unapendelea Video za kuvutia, Vitabu pepe vya kina, au Podikasti za sauti, kichezaji chetu kinakubali yote.",
    feature3Title: "3. Lipa Unapotumia",
    feature3Desc: "Mikataba ya busara inahakikisha mita inahesabu tu unaposoma au kutazama maudhui *mpya*. Kusoma tena ni bure 100%.",
    creatorSectionTitle: "Pata thamani halisi ya maarifa yako.",
    creatorSectionDesc: "Baki na 80% ya mapato yako, yanayotumwa moja kwa moja kwenye pochi yako kila sekunde mwanafunzi anapojifunza kutoka kwako.",
    creatorSectionBtn: "Jiunge na Programu ya Waalimu",
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDict;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("rheodemy_lang") as LanguageCode;
    if (saved && translations[saved]) {
      setLanguageState(saved);
      document.body.dir = saved === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("rheodemy_lang", lang);
      document.body.dir = lang === "ar" ? "rtl" : "ltr";
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
