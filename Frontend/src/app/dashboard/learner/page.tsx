"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Play, 
  BookOpen, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Check, 
  ShieldCheck, 
  Receipt,
  Bookmark,
  Compass,
  Home,
  CheckCheck
} from "lucide-react";
import { VerifiedStamp } from "@/components/ui/VerifiedStamp";
import { LaurieAdvisor } from "@/components/ui/LaurieAdvisor";
import { useAuth } from "@/context/AuthContext";
import { api, type Course as BackendCourse } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { formatUSD, toNumber } from "@/lib/currency";

// ============================================================================
// DATA MODELS & MASTER DATA (Following Pages 18-27 of the UX Redesign Plan)
// ============================================================================

export interface LearnerCourse {
  id: string;
  title: string;
  instructor: {
    name: string;
    verified: boolean;
    role: string;
  };
  medium: "video" | "ebook" | "audio";
  category: "Tech" | "Business" | "Languages" | "Exams" | "Creative";
  tier: "Primer" | "Core" | "Masterclass";
  durationOrPages: string;
  totalMinutes: number;
  ratePerMin: string;
  rateNumeric: number;
  unlockPrice: string;
  unlockCapNumeric: number;
  coverImage: string;
  // Progress & Ownership metrics (Page 18: Time + Money)
  minutesLearned: number;
  amountPaid: number;
  lastPosition: string;
  unlocked: boolean;
  saved: boolean;
  completed: boolean;
  completedDate?: string;
  description: string;
}

const INITIAL_COURSES: LearnerCourse[] = [
  {
    id: "ts-arch",
    title: "TypeScript Systems Architecture & Microservices",
    instructor: {
      name: "Alex Chen",
      verified: true,
      role: "Staff Infrastructure Engineer"
    },
    medium: "video",
    category: "Tech",
    tier: "Core",
    durationOrPages: "45 min",
    totalMinutes: 45,
    ratePerMin: "₦6.50 / min",
    rateNumeric: 6.5,
    unlockPrice: "₦500 cap",
    unlockCapNumeric: 500,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    minutesLearned: 32,
    amountPaid: 350.0,
    lastPosition: "Module 2: Runtime Validation (14:20)",
    unlocked: false,
    saved: true,
    completed: false,
    description: "Architect production TypeScript services with zero-downtime schemas, type-safe RPC boundaries, and automated Interledger payment channel settlements."
  },
  {
    id: "product-design",
    title: "Human-Centered Design for Emerging Markets",
    instructor: {
      name: "Amara Okafor",
      verified: true,
      role: "Lead Product Strategist"
    },
    medium: "ebook",
    category: "Creative",
    tier: "Primer",
    durationOrPages: "120 pages",
    totalMinutes: 40,
    ratePerMin: "₦5.00 / min",
    rateNumeric: 5.0,
    unlockPrice: "₦200 cap",
    unlockCapNumeric: 200,
    coverImage: "https://images.unsplash.com/photo-1544716278-e513176f20b5?q=80&w=800&auto=format&fit=crop",
    minutesLearned: 18,
    amountPaid: 90.0,
    lastPosition: "Chapter 4: Low-Bandwidth Heuristics (p. 42)",
    unlocked: false,
    saved: false,
    completed: false,
    description: "Design intuitive interfaces tailored for intermittent connectivity, local mental models, and cash-to-digital transition behaviors."
  },
  {
    id: "fintech-africa",
    title: "African Fintech Infrastructure & Mobile Money Rails",
    instructor: {
      name: "Babatunde Adeleke",
      verified: true,
      role: "Payments Architect"
    },
    medium: "audio",
    category: "Business",
    tier: "Core",
    durationOrPages: "60 min",
    totalMinutes: 60,
    ratePerMin: "₦6.50 / min",
    rateNumeric: 6.5,
    unlockPrice: "₦500 cap",
    unlockCapNumeric: 500,
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop",
    minutesLearned: 60,
    amountPaid: 500.0,
    lastPosition: "Full Audio Completed",
    unlocked: true,
    saved: true,
    completed: true,
    completedDate: "Nov 17, 2026",
    description: "Deep dive into MTN MoMo APIs, M-Pesa Daraja, switch settlements, and how Open Payments unites cross-border African corridors."
  },
  {
    id: "cloud-finops",
    title: "Cloud FinOps: Cost-Optimized Serverless on AWS",
    instructor: {
      name: "David Osei",
      verified: true,
      role: "Cloud Economics Lead"
    },
    medium: "ebook",
    category: "Tech",
    tier: "Core",
    durationOrPages: "85 pages",
    totalMinutes: 30,
    ratePerMin: "₦6.50 / min",
    rateNumeric: 6.5,
    unlockPrice: "₦500 cap",
    unlockCapNumeric: 500,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    minutesLearned: 6,
    amountPaid: 40.0,
    lastPosition: "Chapter 2: Lambda Concurrency Pricing (p. 14)",
    unlocked: false,
    saved: false,
    completed: false,
    description: "Cut cloud overhead by 60% with event-driven execution, spot architectures, and granular consumption metering."
  },
  {
    id: "flutter-offline",
    title: "Offline-First Mobile Architecture with Flutter",
    instructor: {
      name: "Kwame Mensah",
      verified: true,
      role: "Senior Mobile Engineer"
    },
    medium: "video",
    category: "Tech",
    tier: "Masterclass",
    durationOrPages: "90 min",
    totalMinutes: 90,
    ratePerMin: "₦8.00 / min",
    rateNumeric: 8.0,
    unlockPrice: "₦1,000 cap",
    unlockCapNumeric: 1000,
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
    minutesLearned: 0,
    amountPaid: 0,
    lastPosition: "Not started",
    unlocked: false,
    saved: true,
    completed: false,
    description: "Architect robust Flutter applications that cache local state seamlessly and sync in background over 2G connections."
  },
  {
    id: "swahili-business",
    title: "Conversational Kiswahili for East African Trade",
    instructor: {
      name: "Zawadi Mwangi",
      verified: true,
      role: "Linguistics & Regional Trade Faculty"
    },
    medium: "audio",
    category: "Languages",
    tier: "Primer",
    durationOrPages: "35 min",
    totalMinutes: 35,
    ratePerMin: "₦5.00 / min",
    rateNumeric: 5.0,
    unlockPrice: "₦200 cap",
    unlockCapNumeric: 200,
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    minutesLearned: 0,
    amountPaid: 0,
    lastPosition: "Not started",
    unlocked: false,
    saved: false,
    completed: false,
    description: "Essential business idioms, negotiations, and cross-border commercial communication across Kenya, Tanzania, and Rwanda."
  },
  {
    id: "jamb-maths",
    title: "High-Yield JAMB & WAEC Advanced Mathematics",
    instructor: {
      name: "Dr. Chioma Eze",
      verified: true,
      role: "National STEM Examiner"
    },
    medium: "video",
    category: "Exams",
    tier: "Core",
    durationOrPages: "50 min",
    totalMinutes: 50,
    ratePerMin: "₦6.50 / min",
    rateNumeric: 6.5,
    unlockPrice: "₦500 cap",
    unlockCapNumeric: 500,
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
    minutesLearned: 0,
    amountPaid: 0,
    lastPosition: "Not started",
    unlocked: false,
    saved: false,
    completed: false,
    description: "Master calculus shortcuts, matrices, probability, and high-frequency examination questions with step-by-step problem solving."
  }
];

interface SessionReceiptRecord {
  id: string;
  courseTitle: string;
  medium: string;
  dateGroup: string;
  timestamp: string;
  seconds: number;
  spent: number;
  creatorShare: number;
  platformShare: number;
  bursaryShare: number;
  status: "Completed" | "Pending" | "Refunded";
}

const SESSION_RECEIPTS: SessionReceiptRecord[] = [
  {
    id: "rcpt-8821",
    courseTitle: "Human-Centered Design for Emerging Markets",
    medium: "ebook",
    dateGroup: "Today",
    timestamp: "14:22",
    seconds: 1080, // 18 min
    spent: 90.0,
    creatorShare: 72.0,
    platformShare: 13.5,
    bursaryShare: 4.5,
    status: "Completed",
  },
  {
    id: "rcpt-8794",
    courseTitle: "TypeScript Systems Architecture & Microservices",
    medium: "video",
    dateGroup: "Yesterday",
    timestamp: "19:10",
    seconds: 1920, // 32 min
    spent: 208.0,
    creatorShare: 166.4,
    platformShare: 31.2,
    bursaryShare: 10.4,
    status: "Completed",
  },
  {
    id: "rcpt-8750",
    courseTitle: "African Fintech Infrastructure & Mobile Money Rails",
    medium: "audio",
    dateGroup: "Nov 17, 2026",
    timestamp: "11:05",
    seconds: 3600, // 60 min
    spent: 500.0,
    creatorShare: 400.0,
    platformShare: 75.0,
    bursaryShare: 25.0,
    status: "Completed",
  },
];

const SUBJECT_TILES = [
  {
    id: "Tech",
    name: "Tech & Systems",
    icon: "💻",
    desc: "Architecture, Mobile, Cloud FinOps",
    color: "bg-[#3B5B7E]/10 border-[#3B5B7E]/30 text-[#3B5B7E]"
  },
  {
    id: "Business",
    name: "Business & Fintech",
    icon: "💼",
    desc: "Mobile Money, Strategy, Trade",
    color: "bg-[#8A5A14]/10 border-[#8A5A14]/30 text-[#8A5A14]"
  },
  {
    id: "Languages",
    name: "Languages",
    icon: "🌍",
    desc: "Kiswahili, French, Portuguese",
    color: "bg-[#7A4A6D]/10 border-[#7A4A6D]/30 text-[#7A4A6D]"
  },
  {
    id: "Exams",
    name: "Exams & Certs",
    icon: "📝",
    desc: "JAMB, WAEC, Professional Prep",
    color: "bg-[#5F6B2D]/10 border-[#5F6B2D]/30 text-[#5F6B2D]"
  },
  {
    id: "Creative",
    name: "Creative & Design",
    icon: "🎨",
    desc: "Human-Centered Design, UX",
    color: "bg-[#A04A2E]/10 border-[#A04A2E]/30 text-[#A04A2E]"
  }
];

// ============================================================================
// MAIN COMPONENT: LEARNER DASHBOARD (4 COHESIVE SPEC VIEWS)
// ============================================================================

export default function LearnerDashboard() {
  // Navigation View: "home" | "library" | "browse" | "receipts"
  const [activeView, setActiveView] = useState<"home" | "library" | "browse" | "receipts">("home");

  // Library Sub-Tab: "inprogress" | "unlocked" | "saved" | "completed"
  const [librarySubTab, setLibrarySubTab] = useState<"inprogress" | "unlocked" | "saved" | "completed">("inprogress");

  // User Identity & First-Time Status
  const [userName, setUserName] = useState<string>("Amara Okafor");
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);

  const { user, token, displayName } = useAuth();

  // Wallet Balance (Self-Custody Interledger)
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [allCourses, setAllCourses] = useState<LearnerCourse[]>(INITIAL_COURSES);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (displayName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserName(displayName);
    } else {
      const saved = localStorage.getItem("rheodemy_user_name");
      if (saved && saved.trim()) setUserName(saved.trim());
    }
    setIsFirstTime(localStorage.getItem("rheodemy_auth_mode") === "signup");
  }, [displayName]);

  const mapBackendCourse = (course: BackendCourse): LearnerCourse => {
    const lessons = course.lessons ?? [];
    const type = lessons[0]?.contentType;
    const medium: LearnerCourse["medium"] =
      type === "AUDIO" ? "audio" : type === "EBOOK" ? "ebook" : "video";
    const totalMinutes =
      lessons.reduce((acc, l) => acc + Math.round((l.durationSec ?? 0) / 60), 0) || 45;
    const unlockCapNumeric = toNumber(course.unlockPrice ?? 10);
    const rateNumeric = toNumber(course.pricePerMinute);
    const instructorName = course.instructor
      ? `${course.instructor.firstName} ${course.instructor.lastName}`.trim()
      : "Rheodemy Instructor";
    return {
      id: course.id,
      title: course.title,
      instructor: { name: instructorName, verified: true, role: "Verified Educator" },
      medium,
      category: "Tech",
      tier: (course.tier as LearnerCourse["tier"]) || "Core",
      durationOrPages: medium === "ebook" ? `${lessons.length || 1} chapters` : `${totalMinutes} min`,
      totalMinutes,
      ratePerMin: `${formatUSD(rateNumeric)}/min`,
      rateNumeric,
      unlockPrice: `${formatUSD(unlockCapNumeric)} cap`,
      unlockCapNumeric,
      coverImage:
        course.thumbnailUrl ||
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
      minutesLearned: 0,
      amountPaid: 0,
      lastPosition: lessons[0] ? `Lesson 1: ${lessons[0].title}` : "Ready to start",
      unlocked: false,
      saved: false,
      completed: false,
      description: course.description,
    };
  };

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const [balance, list, progress] = await Promise.all([
          api.wallet.balance().catch(() => null),
          api.courses.list().catch(() => [] as BackendCourse[]),
          api.courses.inProgress().catch(() => null),
        ]);
        if (cancelled) return;
        if (balance) setWalletBalance(balance.learnerBalance);

        const progressMap = new Map<string, LearnerCourse>();
        for (const c of (progress?.allProgress ?? []) as LearnerCourse[]) {
          progressMap.set(c.id, c);
        }
        const merged = new Map<string, LearnerCourse>();
        for (const c of list) {
          const base = mapBackendCourse(c);
          const p = progressMap.get(c.id);
          merged.set(c.id, p ? { ...base, ...p, instructor: base.instructor, coverImage: p.coverImage || base.coverImage } : base);
        }
        for (const [id, p] of progressMap) {
          if (!merged.has(id)) merged.set(id, p);
        }
        if (merged.size > 0) setAllCourses(Array.from(merged.values()));
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    if (!socket) return;
    const onWallet = (p: { learnerBalance?: number }) => {
      if (typeof p.learnerBalance === "number") setWalletBalance(p.learnerBalance);
    };
    socket.on("wallet:updated", onWallet);
    socket.on("payment:tick", onWallet);
    return () => { socket.off("wallet:updated", onWallet); socket.off("payment:tick", onWallet); };
  }, [token]);

  // Top Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Laurie AI Course Advisor Drawer
  const [isLaurieOpen, setIsLaurieOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(10);
  const [topUpProvider, setTopUpProvider] = useState<"momo" | "mpesa" | "airtel" | "ilp">("momo");
  const [topUpSuccess, setTopUpSuccess] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);

  // Browse View States
  const [browseSubject, setBrowseSubject] = useState<string>("All");
  const [browseFormat, setBrowseFormat] = useState<string>("All");
  const [browseTier, setBrowseTier] = useState<string>("All");
  const [browseSort, setBrowseSort] = useState<"recommended" | "newest" | "lowestRate">("recommended");
  const [searchQuery, setSearchQuery] = useState("");

  const handleExecuteTopUp = async () => {
    if (isToppingUp) return;
    setIsToppingUp(true);
    try {
      const topUp = await api.wallet.topUp(topUpAmount, "simulated");
      let status = topUp.status;
      for (let i = 0; i < 20 && status === "PENDING"; i += 1) {
        await new Promise((r) => setTimeout(r, 500));
        status = (await api.wallet.topUpStatus(topUp.reference)).status;
      }
      if (status === "COMPLETED") {
        const b = await api.wallet.balance();
        setWalletBalance(b.learnerBalance);
        setTopUpSuccess(true);
        setTimeout(() => { setTopUpSuccess(false); setIsTopUpOpen(false); }, 1500);
      }
    } finally {
      setIsToppingUp(false);
    }
  };

  // 1. Primary "Continue" Hero Course (most recently active)
  const continueCourse = allCourses.find((c) => c.minutesLearned > 0 && !c.completed) || allCourses[0];

  // 2. In Progress Courses (Page 18 rule: STRICTLY > 0 min learned, not yet unlocked)
  const inProgressCourses = allCourses.filter((c) => c.minutesLearned > 0 && !c.unlocked);

  // 3. Unlocked Courses (Price cap reached, free lifetime rewatch)
  const unlockedCourses = allCourses.filter((c) => c.unlocked);

  // 4. Saved Courses (Wishlist)
  const savedCourses = allCourses.filter((c) => c.saved);

  // 5. Completed Courses
  const completedCourses = allCourses.filter((c) => c.completed);

  // 6. Recommended Courses for Home Block 4 (Page 20)
  const recommendedCourses = allCourses.filter((c) => c.id !== continueCourse?.id).slice(0, 3);

  // 7. Browse Catalog Filtering (Subject first, then secondary filters)
  const filteredCatalog = allCourses.filter((course) => {
    const matchesSubject = browseSubject === "All" || course.category === browseSubject;
    const matchesFormat = browseFormat === "All" || course.medium === browseFormat.toLowerCase();
    const matchesTier = browseTier === "All" || course.tier === browseTier;
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesFormat && matchesTier && matchesSearch;
  }).sort((a, b) => {
    if (browseSort === "lowestRate") return a.rateNumeric - b.rateNumeric;
    if (browseSort === "newest") return b.totalMinutes - a.totalMinutes;
    return 0;
  });

  return (
    <div className="space-y-8 pb-20 sm:pb-12">
      
      {/* ================================================================= */}
      {/* 🧭 DESKTOP VIEW SELECTOR (HOME • LIBRARY • BROWSE • RECEIPTS) */}
      {/* ================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rule">
        <div className="flex items-center gap-1.5 p-1 bg-surface border border-rule rounded-lg">
          <button
            type="button"
            onClick={() => setActiveView("home")}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === "home"
                ? "bg-forest text-white shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("library")}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === "library"
                ? "bg-forest text-white shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Library ({inProgressCourses.length + unlockedCourses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("browse")}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === "browse"
                ? "bg-forest text-white shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Browse Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("receipts")}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === "receipts"
                ? "bg-forest text-white shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Receipts</span>
          </button>
        </div>

        {/* Available Balance Chip on Desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-muted block leading-none">Wallet Balance</span>
            <span className="font-mono text-sm font-bold text-ink">
                {formatUSD(walletBalance)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsTopUpOpen(true)}
            className="btn-forest text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Top Up</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 🏛️ VIEW 1: HOME (THE 5 RIGOROUS BLOCKS FROM PAGE 20) */}
      {/* ================================================================= */}
      {activeView === "home" && (
        <div className="space-y-10 animate-in fade-in duration-200">
          
          {/* BLOCK 1: STATUS STRIP (Page 20: Balance, Minutes, Spend, No Leaderboards) */}
          <section className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
                Self-Custody Learning Ledger
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink" suppressHydrationWarning>
                {isFirstTime ? `Welcome, ${userName}` : `Welcome back, ${userName}`}
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                Here is your active learning progress. Funds only stream while actively engaged.
              </p>
            </div>

            {/* 3 Metric Status Ledger Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Balance + One-tap Top-Up */}
              <div className="ledger-card p-6 bg-surface space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Available Wallet Balance
                  </span>
                  <Wallet className="w-4 h-4 text-forest" />
                </div>
                <div>
                  <div className="font-mono text-3xl font-bold text-ink" suppressHydrationWarning>
              {formatUSD(walletBalance)}
                  </div>
                  <span className="text-xs text-muted block mt-1">
                    About {Math.floor(walletBalance / 6.5)} minutes of learning at ₦6.50/min
                  </span>
                </div>
                <div className="pt-2 border-t border-rule flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                    MoMo & Interledger connected
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTopUpOpen(true)}
                    className="text-xs font-semibold text-forest hover:underline cursor-pointer"
                  >
                    + Top Up
                  </button>
                </div>
              </div>

              {/* Card 2: Minutes Learned This Week */}
              <div className="ledger-card p-6 bg-surface space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Active Time This Week
                  </span>
                  <Clock className="w-4 h-4 text-ink" />
                </div>
                <div>
                  <div className="font-mono text-3xl font-bold text-ink">
                    1h 48m
                  </div>
                  <span className="text-xs text-muted block mt-1">
                    Focused study time strictly logged per second
                  </span>
                </div>
                <div className="pt-2 border-t border-rule">
                  <span className="text-[11px] text-muted">
                    ₦0.00 charged during 3h 12m paused or buffering
                  </span>
                </div>
              </div>

              {/* Card 3: Amount Spent This Week */}
              <div className="ledger-card p-6 bg-surface space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Amount Spent This Week
                  </span>
                  <Receipt className="w-4 h-4 text-forest" />
                </div>
                <div>
                  <div className="font-mono text-3xl font-bold text-ink">
                    ₦440.00
                  </div>
                  <span className="text-xs text-muted block mt-1">
                    Applied toward permanent course ownership caps
                  </span>
                </div>
                <div className="pt-2 border-t border-rule flex items-center justify-between">
                  <span className="text-[11px] text-forest font-medium">
                    1 Course permanently unlocked
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveView("receipts")}
                    className="text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                  >
                    View Receipts &rarr;
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* BLOCK 2: THE "CONTINUE" CARD (Hero Element from Page 20) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider font-bold text-ink">
                Continue Where You Left Off
              </span>
              <span className="text-xs font-mono text-muted">
                Last opened: Yesterday, 19:10
              </span>
            </div>

            <div className="ledger-card p-6 sm:p-8 bg-surface border-2 border-forest/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-full sm:w-48 aspect-video sm:aspect-square lg:w-44 lg:aspect-video rounded-[6px] overflow-hidden bg-paper shrink-0 relative">
                  <img
                    src={continueCourse.coverImage}
                    alt={continueCourse.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 start-2 px-2 py-0.5 rounded-[4px] bg-black/85 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                    {continueCourse.medium}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#3B5B7E]/10 border border-[#3B5B7E]/20 text-[#3B5B7E] text-[10px] font-bold uppercase">
                      {continueCourse.category}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      Tier: {continueCourse.tier}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                    {continueCourse.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>With {continueCourse.instructor.name}</span>
                    <VerifiedStamp />
                    <span>•</span>
                    <span className="text-ink font-mono font-medium">{continueCourse.lastPosition}</span>
                  </div>

                  {/* Dual Progress: Time + Money (Page 18) */}
                  <div className="space-y-1.5 pt-2 max-w-md">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted">
                        {continueCourse.minutesLearned} min learned ({continueCourse.totalMinutes - continueCourse.minutesLearned} min left)
                      </span>
                      <span className="font-bold text-forest">
                        {formatUSD(continueCourse.amountPaid)} paid of {continueCourse.unlockPrice}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-paper rounded-full overflow-hidden border border-rule">
                      <div 
                        className="h-full bg-forest transition-all duration-500"
                        style={{ width: "70%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* High-Priority Action */}
              <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center gap-3">
                <Link
                  href={`/dashboard/learner/course/${continueCourse.id}`}
                  className="btn-forest min-h-[48px] px-8 text-sm font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Lesson</span>
                </Link>
                <span className="text-[11px] font-mono text-muted text-center">
                  Streaming rate: {continueCourse.ratePerMin}
                </span>
              </div>
            </div>
          </section>

          {/* BLOCK 3: IN PROGRESS SHELF (Page 20: Max 4, newest first, strictly >0% progress) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-ink">
                  In Progress Courses
                </h3>
                <p className="text-xs text-muted">
                  Courses you are actively streaming toward permanent ownership caps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveView("library");
                  setLibrarySubTab("inprogress");
                }}
                className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>See all in Library</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {inProgressCourses.map((course) => {
                const percent = Math.min(100, Math.round((course.amountPaid / course.unlockCapNumeric) * 100));
                return (
                  <div key={course.id} className="ledger-card p-5 bg-surface space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-[4px] bg-forest/10 border border-forest/20 text-forest font-mono text-[10px] font-bold uppercase">
                          In Progress • {percent}% Owned
                        </span>
                        <span className="text-xs font-mono text-muted uppercase">
                          {course.medium}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-lg text-ink line-clamp-1">
                        {course.title}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>By {course.instructor.name}</span>
                        {course.instructor.verified && <VerifiedStamp />}
                      </div>

                      {/* Dual Progress Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-muted">{course.minutesLearned} min learned</span>
                          <span className="font-bold text-ink">{formatUSD(course.amountPaid)} paid of {course.unlockPrice}</span>
                        </div>
                        <div className="w-full h-1.5 bg-paper rounded-full overflow-hidden border border-rule">
                          <div 
                            className="h-full bg-forest transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-rule flex items-center justify-between">
                      <span className="text-xs font-mono text-muted">
                        Rate: {course.ratePerMin}
                      </span>
                      <Link
                        href={`/dashboard/learner/course/${course.id}`}
                        className="btn-forest text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <span>Resume</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BLOCK 4: RECOMMENDED SHELF (Page 20: Where Laurie will live) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-ink">
                  Recommended For Your Career Path
                </h3>
                <p className="text-xs text-muted">
                  Curated based on your active systems architecture & emerging markets coursework.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView("browse")}
                className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse all catalog</span>
                <span>&rarr;</span>
              </button>
            </div>

            {/* Laurie Course Advisor Teaser Box */}
            <div className="p-4 bg-forest/5 border border-forest/20 rounded-[6px] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-serif font-bold text-sm">
                  L
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-ink flex items-center gap-1.5">
                    <span>Laurie AI Course Advisor</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-forest/10 text-forest rounded font-normal">
                      Verified AI
                    </span>
                  </h4>
                  <p className="text-xs text-muted">
                    Need guidance on which skill track fits your schedule and budget? Laurie can help you plan your curriculum.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLaurieOpen(true)}
                className="btn-forest text-xs py-2 px-3 shrink-0 cursor-pointer"
              >
                Ask Laurie
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="ledger-card overflow-hidden bg-surface flex flex-col justify-between group">
                  <div>
                    <div className="aspect-[16/10] overflow-hidden bg-paper relative">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-[4px] bg-black/85 text-white font-mono text-[10px] font-bold uppercase">
                          {course.medium}
                        </span>
                        <span className="px-2 py-0.5 rounded-[4px] bg-surface border border-rule text-[10px] font-bold text-ink">
                          {course.durationOrPages}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 end-2.5">
                        <span className="px-2 py-0.5 rounded-[4px] bg-surface text-ink text-[10px] font-semibold border border-rule shadow-xs">
                          2m free preview
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h4 className="font-serif font-bold text-base text-ink line-clamp-1 group-hover:text-forest transition-colors">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>{course.instructor.name}</span>
                        {course.instructor.verified && <VerifiedStamp />}
                      </div>
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-rule mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-muted uppercase block">Rate / Cap</span>
                      <span className="font-mono text-xs font-bold text-ink">
                        {course.ratePerMin} • {course.unlockPrice}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/learner/course/${course.id}`}
                      className="btn-forest text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BLOCK 5: RECENT RECEIPTS (Page 20: Last 3 sessions linking to receipts) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-ink">
                  Recent Streaming Receipts
                </h3>
                <p className="text-xs text-muted">
                  Auditable micropayments settled in real time over Open Payments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView("receipts")}
                className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View full receipt ledger</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="ledger-card bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-rule bg-paper/60 text-muted font-mono uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Receipt ID</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Active Duration</th>
                      <th className="py-3 px-4">Amount Deducted</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule font-sans">
                    {SESSION_RECEIPTS.slice(0, 3).map((rcpt) => (
                      <tr key={rcpt.id} className="hover:bg-paper/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-forest">
                          {rcpt.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-ink max-w-xs truncate">
                          {rcpt.courseTitle}
                          <span className="block text-[10px] font-mono text-muted uppercase">
                            {rcpt.medium}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-ink">
                          {Math.floor(rcpt.seconds / 60)} min {rcpt.seconds % 60}s
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-ink">
                          ₦{rcpt.spent.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-forest/10 text-forest">
                            <CheckCheck className="w-3 h-3" />
                            {rcpt.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-muted text-right">
                          {rcpt.dateGroup}, {rcpt.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* ================================================================= */}
      {/* 📚 VIEW 2: LIBRARY (THE 4 CLEAN TABS FROM PAGE 26) */}
      {/* ================================================================= */}
      {activeView === "library" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-bold text-ink">
              Your Personal Library
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Organized by your direct learning relationship: in-progress streams, fully owned unlocks, and saved courses.
            </p>
          </div>

          {/* 4 Library Tabs (Page 26) */}
          <div className="flex items-center gap-2 border-b border-rule pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setLibrarySubTab("inprogress")}
              className={`px-4 py-2 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                librarySubTab === "inprogress"
                  ? "bg-forest text-white shadow-xs"
                  : "bg-surface border border-rule text-muted hover:text-ink"
              }`}
            >
              In Progress ({inProgressCourses.length})
            </button>

            <button
              type="button"
              onClick={() => setLibrarySubTab("unlocked")}
              className={`px-4 py-2 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                librarySubTab === "unlocked"
                  ? "bg-forest text-white shadow-xs"
                  : "bg-surface border border-rule text-muted hover:text-ink"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
              <span>Unlocked & Owned ({unlockedCourses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setLibrarySubTab("saved")}
              className={`px-4 py-2 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                librarySubTab === "saved"
                  ? "bg-forest text-white shadow-xs"
                  : "bg-surface border border-rule text-muted hover:text-ink"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedCourses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setLibrarySubTab("completed")}
              className={`px-4 py-2 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                librarySubTab === "completed"
                  ? "bg-forest text-white shadow-xs"
                  : "bg-surface border border-rule text-muted hover:text-ink"
              }`}
            >
              Completed ({completedCourses.length})
            </button>
          </div>

          {/* TAB 1: IN PROGRESS */}
          {librarySubTab === "inprogress" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {inProgressCourses.map((course) => {
                  const percent = Math.min(100, Math.round((course.amountPaid / course.unlockCapNumeric) * 100));
                  return (
                    <div key={course.id} className="ledger-card p-5 bg-surface space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-[4px] bg-forest/10 border border-forest/20 text-forest font-mono text-[10px] font-bold uppercase">
                            {percent}% Toward Full Ownership
                          </span>
                          <span className="text-xs font-mono text-muted uppercase">
                            {course.medium}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-lg text-ink">
                          {course.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span>With {course.instructor.name}</span>
                          {course.instructor.verified && <VerifiedStamp />}
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-muted">{course.minutesLearned} min learned ({course.totalMinutes - course.minutesLearned} min left)</span>
                            <span className="font-bold text-forest">{formatUSD(course.amountPaid)} paid of {course.unlockPrice}</span>
                          </div>
                          <div className="w-full h-2 bg-paper rounded-full overflow-hidden border border-rule">
                            <div className="h-full bg-forest transition-all" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-rule flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Last: {course.lastPosition}</span>
                        <Link
                          href={`/dashboard/learner/course/${course.id}`}
                          className="btn-forest text-xs py-1.5 px-4 flex items-center gap-1.5"
                        >
                          <span>Resume</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UNLOCKED & FULLY OWNED (Page 26: says "Free to rewatch", hides rate) */}
          {librarySubTab === "unlocked" && (
            <div className="space-y-4">
              <div className="p-4 bg-forest/5 border border-forest/20 rounded-[4px] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <span className="text-xs text-ink/85">
                  Rent-to-Own Guarantee fulfilled: Once your streaming payments hit the creator cap, you own the course for life. Rewatching is always ₦0.00.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {unlockedCourses.map((course) => (
                  <div key={course.id} className="ledger-card p-5 bg-surface space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-[4px] bg-forest text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                          ✓ Permanently Unlocked
                        </span>
                        <span className="text-xs font-mono text-muted uppercase">
                          {course.medium}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-ink">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>By {course.instructor.name}</span>
                        <VerifiedStamp />
                        <span>•</span>
                        <span>Completed {course.completedDate}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-rule flex items-center justify-between">
                      <span className="text-xs font-semibold text-forest font-mono">
                        Free to rewatch (₦0 / min)
                      </span>
                      <Link
                        href={`/dashboard/learner/course/${course.id}`}
                        className="btn-forest text-xs py-1.5 px-4 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Open Course</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SAVED (Wishlist) */}
          {librarySubTab === "saved" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {savedCourses.map((course) => (
                  <div key={course.id} className="ledger-card p-5 bg-surface space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted font-mono mb-2">
                        <span>{course.category} • {course.medium}</span>
                        <span className="text-forest font-bold">{course.ratePerMin} • {course.unlockPrice}</span>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-ink">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted mt-1">
                        <span>{course.instructor.name}</span>
                        {course.instructor.verified && <VerifiedStamp />}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-rule flex items-center justify-between">
                      <span className="text-xs text-muted">2-minute free preview ready</span>
                      <Link
                        href={`/dashboard/learner/course/${course.id}`}
                        className="btn-forest text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <span>Preview Free</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COMPLETED */}
          {librarySubTab === "completed" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {completedCourses.map((course) => (
                  <div key={course.id} className="ledger-card p-5 bg-surface space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-[4px] bg-forest/10 text-forest text-[10px] font-mono font-bold uppercase">
                        Graduated • {course.completedDate}
                      </span>
                      <h4 className="font-serif font-bold text-lg text-ink mt-2">
                        {course.title}
                      </h4>
                      <p className="text-xs text-muted mt-1">
                        All modules completed. Verified on Interledger Open Payments ledger.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-rule flex items-center justify-between">
                      <span className="text-xs text-forest font-mono">100% Retained Access</span>
                      <Link
                        href={`/dashboard/learner/course/${course.id}`}
                        className="btn-forest text-xs py-1.5 px-3"
                      >
                        Rewatch
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================================================================= */}
      {/* 🧭 VIEW 3: BROWSE (SUBJECT-FIRST AS PER PAGES 21-22) */}
      {/* ================================================================= */}
      {activeView === "browse" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-bold text-ink">
              Explore Course Catalog
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Choose a discipline to start. Preview any lesson for 2 minutes free with zero financial commitment.
            </p>
          </div>

          {/* 5 SUBJECT TILES (Page 21: Lead with the 5 Subject Tags) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SUBJECT_TILES.map((subject) => {
              const isSelected = browseSubject === subject.id;
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setBrowseSubject(isSelected ? "All" : subject.id)}
                  className={`ledger-card p-4 text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-forest/10 border-forest shadow-xs ring-1 ring-forest"
                      : "bg-surface hover:bg-paper border-rule"
                  }`}
                >
                  <div className="text-2xl mb-2">{subject.icon}</div>
                  <div className="space-y-1">
                    <span className="font-serif font-bold text-sm text-ink block leading-tight">
                      {subject.name}
                    </span>
                    <span className="text-[11px] text-muted block line-clamp-1">
                      {subject.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SECONDARY FILTER & SEARCH BAR */}
          <div className="p-4 bg-surface border border-rule rounded-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3 text-xs">
              
              {/* Reset to All Subjects */}
              {browseSubject !== "All" && (
                <button
                  type="button"
                  onClick={() => setBrowseSubject("All")}
                  className="px-2.5 py-1 rounded bg-forest/10 text-forest font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Subject: {browseSubject}</span>
                  <span>✕</span>
                </button>
              )}

              {/* Format Filter */}
              <div className="flex items-center gap-1 bg-paper p-1 rounded border border-rule">
                {["All", "Video", "Ebook", "Audio"].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setBrowseFormat(fmt)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      browseFormat === fmt ? "bg-forest text-white font-bold" : "text-muted hover:text-ink"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {/* Pricing Tier Filter */}
              <div className="flex items-center gap-1 bg-paper p-1 rounded border border-rule">
                {["All", "Primer", "Core", "Masterclass"].map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => setBrowseTier(tr)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      browseTier === tr ? "bg-forest text-white font-bold" : "text-muted hover:text-ink"
                    }`}
                  >
                    {tr === "All" ? "All Tiers" : tr}
                  </button>
                ))}
              </div>

            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-64">
              <Search className="w-3.5 h-3.5 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses or teachers..."
                className="w-full ps-8 pe-3 py-1.5 bg-paper border border-rule focus:border-forest rounded text-xs text-ink placeholder:text-muted focus:outline-hidden"
              />
            </div>

          </div>

          {/* COURSE GRID (Page 22 Specifications) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted font-mono">
              <span>Showing {filteredCatalog.length} courses</span>
              <div className="flex items-center gap-1.5">
                <span className="text-muted">Sort:</span>
                <select
                  value={browseSort}
                  onChange={(e) => setBrowseSort(e.target.value as "recommended" | "newest" | "lowestRate")}
                  className="bg-paper border border-rule rounded px-2 py-0.5 text-xs text-ink focus:outline-hidden focus:border-forest cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="lowestRate">Lowest Rate</option>
                  <option value="newest">Duration</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalog.map((course) => (
                <div key={course.id} className="ledger-card overflow-hidden bg-surface flex flex-col justify-between group">
                  <div>
                    <div className="aspect-[16/10] overflow-hidden bg-paper relative">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-[4px] bg-black/85 text-white font-mono text-[10px] font-bold uppercase">
                          {course.medium}
                        </span>
                        <span className="px-2 py-0.5 rounded-[4px] bg-surface border border-rule text-[10px] font-bold text-ink">
                          {course.durationOrPages}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 end-2.5">
                        <span className="px-2 py-0.5 rounded-[4px] bg-surface text-ink text-[10px] font-semibold border border-rule shadow-xs">
                          2m free preview
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-forest/10 text-forest rounded font-bold uppercase">
                          {course.category}
                        </span>
                        <span className="text-xs font-mono text-muted">Tier: {course.tier}</span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-ink line-clamp-1 group-hover:text-forest transition-colors">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>{course.instructor.name}</span>
                        {course.instructor.verified && <VerifiedStamp />}
                      </div>
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-rule mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-muted uppercase block">Rate / Cap</span>
                      <span className="font-mono text-xs font-bold text-ink">
                        {course.ratePerMin} • {course.unlockPrice}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/learner/course/${course.id}`}
                      className="btn-forest text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <span>Preview Free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================================================================= */}
      {/* 🧾 VIEW 4: RECEIPTS (STREAMING LEDGER TRANSPARENCY - PAGE 26) */}
      {/* ================================================================= */}
      {activeView === "receipts" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-bold text-ink">
              Streaming Micropayment Receipts
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Permanent financial audit trail. Every second streamed settles instantly across Interledger Open Payments.
            </p>
          </div>

          {/* Spend Overview Totals (Page 26: plain text, no charts) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="ledger-card p-5 bg-surface space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted font-semibold block">Spent This Week</span>
              <p className="font-mono text-2xl font-bold text-ink">₦440.00</p>
              <span className="text-xs text-muted">Across 2 courses (1h 48m streamed)</span>
            </div>

            <div className="ledger-card p-5 bg-surface space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted font-semibold block">Spent This Month</span>
              <p className="font-mono text-2xl font-bold text-ink">₦940.00</p>
              <span className="text-xs text-muted">Applied directly toward ownership caps</span>
            </div>

            <div className="ledger-card p-5 bg-surface space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted font-semibold block">Current Balance</span>
              <p className="font-mono text-2xl font-bold text-forest">
                    {formatUSD(walletBalance)}
              </p>
              <span className="text-xs text-muted">Self-custodied Open Payments channel</span>
            </div>
          </div>

          {/* Grouped Day-by-Day Micro-Settlement Ledger */}
          <div className="ledger-card bg-surface overflow-hidden">
            <div className="p-4 border-b border-rule flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-ink">
                Auditable Session Entries
              </span>
              <span className="text-xs font-mono text-muted">Network: Open Payments Live</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-rule bg-paper/60 text-muted font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Receipt ID</th>
                    <th className="py-3 px-4">Course Title & Format</th>
                    <th className="py-3 px-4">Active Time</th>
                    <th className="py-3 px-4">Total Deducted</th>
                    <th className="py-3 px-4">80% Creator</th>
                    <th className="py-3 px-4">15% Platform</th>
                    <th className="py-3 px-4">5% Bursary</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule font-sans">
                  {SESSION_RECEIPTS.map((rcpt) => (
                    <tr key={rcpt.id} className="hover:bg-paper/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-forest">
                        {rcpt.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-ink max-w-xs truncate">
                        {rcpt.courseTitle}
                        <span className="block text-[10px] text-muted font-mono uppercase">
                          {rcpt.medium}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-ink">
                        {Math.floor(rcpt.seconds / 60)}m {rcpt.seconds % 60}s
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-ink">
                        ₦{rcpt.spent.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-forest">
                        ₦{rcpt.creatorShare.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted">
                        ₦{rcpt.platformShare.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-sun font-semibold">
                        ₦{rcpt.bursaryShare.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted text-right">
                        {rcpt.dateGroup}, {rcpt.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-paper/40 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
              <span>All charges were verified against client-side heartbeat validation.</span>
              <a href="#refund-policy" className="text-forest hover:underline font-medium">
                Refund & Dispute Settlement Policy &rarr;
              </a>
            </div>
          </div>

        </div>
      )}

      {/* ================================================================= */}
      {/* 📱 MOBILE BOTTOM NAVIGATION BAR (PAGE 23 SPEC: 56PX HIGH) */}
      {/* ================================================================= */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-paper/95 backdrop-blur-md border-t border-rule px-4 flex items-center justify-around text-[11px] font-medium text-muted">
        <button
          type="button"
          onClick={() => setActiveView("home")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeView === "home" ? "text-forest font-bold" : "hover:text-ink"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("library")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeView === "library" ? "text-forest font-bold" : "hover:text-ink"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Library</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("browse")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeView === "browse" ? "text-forest font-bold" : "hover:text-ink"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Browse</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("receipts")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeView === "receipts" ? "text-forest font-bold" : "hover:text-ink"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Receipts</span>
        </button>
      </nav>

      {/* ================================================================= */}
      {/* 💳 TOP UP MODAL (AFRICAN MOBILE MONEY & INTERLEDGER) */}
      {/* ================================================================= */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="ledger-card p-6 sm:p-8 bg-surface max-w-md w-full space-y-6 shadow-xl border border-rule animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between border-b border-rule pb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-forest" />
                <h3 className="font-serif font-bold text-xl text-ink">
                  Top Up Learner Wallet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTopUpOpen(false)}
                className="w-7 h-7 rounded-full border border-rule flex items-center justify-center text-muted hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Amount Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-muted font-semibold block">
                Select Deposit Amount (USD)
              </span>
              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`p-3 rounded-[4px] font-mono text-sm font-bold border transition-all cursor-pointer ${
                      topUpAmount === amt
                        ? "bg-forest/10 border-forest text-forest"
                        : "bg-paper border-rule text-ink hover:bg-surface"
                    }`}
                  >
                    +${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Payment Rails */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-muted font-semibold block">
                Choose Payment Rail
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTopUpProvider("momo")}
                  className={`p-3 rounded-[4px] border text-left flex items-center justify-between cursor-pointer ${
                    topUpProvider === "momo" ? "border-forest bg-forest/5 font-bold" : "border-rule bg-paper"
                  }`}
                >
                  <span>MTN MoMo</span>
                  {topUpProvider === "momo" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
                <button
                  type="button"
                  onClick={() => setTopUpProvider("mpesa")}
                  className={`p-3 rounded-[4px] border text-left flex items-center justify-between cursor-pointer ${
                    topUpProvider === "mpesa" ? "border-forest bg-forest/5 font-bold" : "border-rule bg-paper"
                  }`}
                >
                  <span>M-Pesa Kenya</span>
                  {topUpProvider === "mpesa" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
                <button
                  type="button"
                  onClick={() => setTopUpProvider("airtel")}
                  className={`p-3 rounded-[4px] border text-left flex items-center justify-between cursor-pointer ${
                    topUpProvider === "airtel" ? "border-forest bg-forest/5 font-bold" : "border-rule bg-paper"
                  }`}
                >
                  <span>Airtel Money</span>
                  {topUpProvider === "airtel" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
                <button
                  type="button"
                  onClick={() => setTopUpProvider("ilp")}
                  className={`p-3 rounded-[4px] border text-left flex items-center justify-between cursor-pointer ${
                    topUpProvider === "ilp" ? "border-forest bg-forest/5 font-bold" : "border-rule bg-paper"
                  }`}
                >
                  <span>ILP Open Payments</span>
                  {topUpProvider === "ilp" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="p-3 bg-paper border border-rule rounded text-xs text-muted flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
              <span>Funds are self-custodied. Unspent balances remain in your wallet and only stream while actively learning.</span>
            </div>

            {/* CTA Execution */}
            <button
              type="button"
              onClick={handleExecuteTopUp}
              disabled={topUpSuccess}
              className="w-full btn-forest text-xs py-3 rounded-[4px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {topUpSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Deposit Credited Successfully!</span>
                </>
              ) : (
                <>
                  <span>Confirm Deposit of {formatUSD(topUpAmount)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        </div>
      )}

      {/* Laurie Floating Advisor Pill (Quick Access) */}
      <button
        type="button"
        onClick={() => setIsLaurieOpen(true)}
        className="fixed bottom-20 sm:bottom-6 end-6 z-40 bg-surface border border-forest/30 text-ink shadow-md hover:shadow-lg rounded-full px-3.5 py-2 flex items-center gap-2.5 transition-all hover:border-forest cursor-pointer group"
        aria-label="Open Laurie AI Course Advisor"
      >
        <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center font-serif font-bold text-xs">
          L
        </div>
        <div className="text-start leading-tight hidden sm:block">
          <div className="text-xs font-serif font-bold text-ink flex items-center gap-1.5">
            <span>Ask Laurie</span>
            <span className="w-1.5 h-1.5 rounded-full bg-forest inline-block animate-pulse" />
          </div>
          <div className="text-[10px] text-muted">AI Course Advisor</div>
        </div>
      </button>

      {/* Laurie AI Course Advisor Panel */}
      <LaurieAdvisor
        isOpen={isLaurieOpen}
        onClose={() => setIsLaurieOpen(false)}
        learnerName={userName}
      />

    </div>
  );
}