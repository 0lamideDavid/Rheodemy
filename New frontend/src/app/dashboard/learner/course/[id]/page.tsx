"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  AlertCircle,
  Headphones,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ThumbsUp,
  Wallet,
  Coins,
  Activity,
  FastForward,
  Rewind,
  Check
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { StatusDot, PaymentState } from "@/components/ui/StatusDot";
import { WalletPill } from "@/components/ui/WalletPill";
import { VerifiedStamp } from "@/components/ui/VerifiedStamp";
import { LaurieAdvisor } from "@/components/ui/LaurieAdvisor";

interface ModuleData {
  id: number;
  title: string;
  duration: string;
  summary?: string;
}

interface CourseRecord {
  id: string;
  title: string;
  instructor: {
    name: string;
    verified: boolean;
    role: string;
  };
  type: "video" | "audio" | "ebook";
  category: "Tech" | "Business" | "Languages" | "Exams" | "Creative";
  ratePerMin: number; // in Naira e.g. 5
  unlockCap: number; // in Naira e.g. 200
  rateDisplay: string;
  unlockDisplay: string;
  available: boolean;
  coverImage: string;
  description: string;
  modules: ModuleData[];
  // Pre-release fields
  expectedRelease?: string;
  initialRequests?: number;
  targetRequests?: number;
  escrowTarget?: number;
}

const COURSES_DATABASE: Record<string, CourseRecord> = {
  // Video 1
  "ts-arch": {
    id: "ts-arch",
    title: "TypeScript Systems Architecture & Microservices",
    instructor: {
      name: "Alex Chen",
      verified: true,
      role: "Staff Infrastructure Engineer"
    },
    type: "video",
    category: "Tech",
    ratePerMin: 5,
    unlockCap: 200,
    rateDisplay: "₦5 / min",
    unlockDisplay: "₦200 unlock",
    available: true,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    description: "Architect production TypeScript services with zero-downtime schemas, type-safe RPC boundaries, and automated Interledger payment channel settlements.",
    modules: [
      { id: 1, title: "Introduction to Advanced Types & Generics", duration: "12:14", summary: "Conditional types, template literals, and distributed inference." },
      { id: 2, title: "Utility Types & Runtime Validation", duration: "18:45", summary: "Zod, Valibot, and type-safe RPC boundary validation." },
      { id: 3, title: "Microservice Interface Boundary Design", duration: "24:10", summary: "Building resilient distributed contracts across service meshes." }
    ]
  },
  "1": {
    id: "1",
    title: "TypeScript Systems Architecture & Microservices",
    instructor: {
      name: "Alex Chen",
      verified: true,
      role: "Staff Infrastructure Engineer"
    },
    type: "video",
    category: "Tech",
    ratePerMin: 5,
    unlockCap: 200,
    rateDisplay: "₦5 / min",
    unlockDisplay: "₦200 unlock",
    available: true,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    description: "Architect production TypeScript services with zero-downtime schemas, type-safe RPC boundaries, and automated Interledger payment channel settlements.",
    modules: [
      { id: 1, title: "Introduction to Advanced Types & Generics", duration: "12:14", summary: "Conditional types, template literals, and distributed inference." },
      { id: 2, title: "Utility Types & Runtime Validation", duration: "18:45", summary: "Zod, Valibot, and type-safe RPC boundary validation." },
      { id: 3, title: "Microservice Interface Boundary Design", duration: "24:10", summary: "Building resilient distributed contracts across service meshes." }
    ]
  },

  // Ebook 1
  "product-design": {
    id: "product-design",
    title: "Human-Centered Design for Emerging Markets",
    instructor: {
      name: "Amara Okafor",
      verified: true,
      role: "Principal Product Designer"
    },
    type: "ebook",
    category: "Creative",
    ratePerMin: 3,
    unlockCap: 150,
    rateDisplay: "₦3 / min",
    unlockDisplay: "₦150 unlock",
    available: true,
    coverImage: "https://images.unsplash.com/photo-1544716278-e513176f20b5?q=80&w=1200&auto=format&fit=crop",
    description: "Design offline-first interfaces, low-bandwidth data visualization, and trust-oriented cash-on-delivery flows for high-growth developing economies.",
    modules: [
      { id: 1, title: "Offline-First User Journey Mapping", duration: "12 pages", summary: "Designing for intermittent 2G/3G connectivity and state recovery." },
      { id: 2, title: "Low-Bandwidth Interface Density", duration: "18 pages", summary: "Visual hierarchy and font budgeting under heavy memory constraints." },
      { id: 3, title: "Trust Affordances & Cash-on-Delivery", duration: "25 pages", summary: "Payment psychology and verification patterns for first-time digital buyers." }
    ]
  },
  "2": {
    id: "2",
    title: "Human-Centered Design for Emerging Markets",
    instructor: {
      name: "Amara Okafor",
      verified: true,
      role: "Principal Product Designer"
    },
    type: "ebook",
    category: "Creative",
    ratePerMin: 3,
    unlockCap: 150,
    rateDisplay: "₦3 / min",
    unlockDisplay: "₦150 unlock",
    available: true,
    coverImage: "https://images.unsplash.com/photo-1544716278-e513176f20b5?q=80&w=1200&auto=format&fit=crop",
    description: "Design offline-first interfaces, low-bandwidth data visualization, and trust-oriented cash-on-delivery flows for high-growth developing economies.",
    modules: [
      { id: 1, title: "Offline-First User Journey Mapping", duration: "12 pages", summary: "Designing for intermittent 2G/3G connectivity and state recovery." },
      { id: 2, title: "Low-Bandwidth Interface Density", duration: "18 pages", summary: "Visual hierarchy and font budgeting under heavy memory constraints." },
      { id: 3, title: "Trust Affordances & Cash-on-Delivery", duration: "25 pages", summary: "Payment psychology and verification patterns for first-time digital buyers." }
    ]
  },

  // Audio 1
  "startup-growth": {
    id: "startup-growth",
    title: "Zero to Product-Market Fit in Sub-Saharan Africa",
    instructor: {
      name: "Kofi Mensah",
      verified: true,
      role: "Founder & Ecosystem Partner"
    },
    type: "audio",
    category: "Business",
    ratePerMin: 4,
    unlockCap: 180,
    rateDisplay: "₦4 / min",
    unlockDisplay: "₦180 unlock",
    available: true,
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
    description: "In-depth audio masterclass on navigating currency volatility, leveraging WhatsApp commerce as an acquisition moat, and scaling informal logistics.",
    modules: [
      { id: 1, title: "The Informal Economy Distribution Engine", duration: "18:20", summary: "Why modern software must plug into existing market stall channels." },
      { id: 2, title: "WhatsApp Commerce as an Unfair Moat", duration: "22:45", summary: "Building conversational funnels that convert at 4x web rates." },
      { id: 3, title: "Unit Economics Under Currency Volatility", duration: "25:10", summary: "Hedging operational costs and dynamic micropayment pricing." }
    ]
  },
  "3": {
    id: "3",
    title: "Zero to Product-Market Fit in Sub-Saharan Africa",
    instructor: {
      name: "Kofi Mensah",
      verified: true,
      role: "Founder & Ecosystem Partner"
    },
    type: "audio",
    category: "Business",
    ratePerMin: 4,
    unlockCap: 180,
    rateDisplay: "₦4 / min",
    unlockDisplay: "₦180 unlock",
    available: true,
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
    description: "In-depth audio masterclass on navigating currency volatility, leveraging WhatsApp commerce as an acquisition moat, and scaling informal logistics.",
    modules: [
      { id: 1, title: "The Informal Economy Distribution Engine", duration: "18:20", summary: "Why modern software must plug into existing market stall channels." },
      { id: 2, title: "WhatsApp Commerce as an Unfair Moat", duration: "22:45", summary: "Building conversational funnels that convert at 4x web rates." },
      { id: 3, title: "Unit Economics Under Currency Volatility", duration: "25:10", summary: "Hedging operational costs and dynamic micropayment pricing." }
    ]
  },

  // Video 2
  "french-basics": {
    id: "french-basics",
    title: "Professional Business French for Trade & Commerce",
    instructor: {
      name: "Claire Dubois",
      verified: true,
      role: "International Trade Consultant"
    },
    type: "video",
    category: "Languages",
    ratePerMin: 4,
    unlockCap: 160,
    rateDisplay: "₦4 / min",
    unlockDisplay: "₦160 unlock",
    available: true,
    coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop",
    description: "Master cross-border negotiations, bilingual trade contracts, and customs documentation tailored for ECOWAS and international trade zones.",
    modules: [
      { id: 1, title: "Formal Negotiations & Protocol", duration: "14:30", summary: "Opening remarks, diplomatic bargaining, and conditional offers." },
      { id: 2, title: "Banking & Contractual Terminology", duration: "16:15", summary: "Letters of credit, incoterms, and currency hedging contracts." },
      { id: 3, title: "Cross-Border Customs & Port Logistics", duration: "18:00", summary: "Clearing procedures and freight forwarding agreements in French." }
    ]
  },

  // Video 3
  "data-analytics": {
    id: "data-analytics",
    title: "Applied Data Analytics with Python & SQL",
    instructor: {
      name: "David Adeleke",
      verified: true,
      role: "Lead Analytics Architect"
    },
    type: "video",
    category: "Tech",
    ratePerMin: 5,
    unlockCap: 200,
    rateDisplay: "₦5 / min",
    unlockDisplay: "₦200 unlock",
    available: true,
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    description: "Turn raw transaction logs into executive intelligence with PostgreSQL window functions, Pandas pipeline transforms, and real-time retention models.",
    modules: [
      { id: 1, title: "Query Optimization & Indexing", duration: "15:40", summary: "EXPLAIN ANALYZE deep dive, composite indexes, and partitioning." },
      { id: 2, title: "Customer Churn Prediction Models", duration: "22:10", summary: "Feature engineering, cohort matrix analysis, and logistic models." },
      { id: 3, title: "Executive Dashboard Storytelling", duration: "18:30", summary: "Building high-impact dashboards that drive strategic capital allocation." }
    ]
  },

  // Ebook 2
  "accounting-exams": {
    id: "accounting-exams",
    title: "Financial Accounting & IFRS Preparation",
    instructor: {
      name: "Zainab Bello",
      verified: true,
      role: "FCA, Senior Audit Partner"
    },
    type: "ebook",
    category: "Exams",
    ratePerMin: 3,
    unlockCap: 140,
    rateDisplay: "₦3 / min",
    unlockDisplay: "₦140 unlock",
    available: true,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop",
    description: "Concise exam-focused guide covering IFRS 15 revenue recognition, complex group consolidation balance sheets, and cash flow auditing.",
    modules: [
      { id: 1, title: "IFRS 15 Revenue from Contracts", duration: "20 pages", summary: "The 5-step recognition model and performance obligations." },
      { id: 2, title: "Consolidated Statement of Cash Flows", duration: "24 pages", summary: "Eliminating inter-company balances and foreign sub translations." },
      { id: 3, title: "Ratio Analysis & Solvency Auditing", duration: "18 pages", summary: "Altman Z-score stress testing and working capital cycle metrics." }
    ]
  },

  // Pre-release 4
  "4": {
    id: "4",
    title: "Advanced Rust Web Services",
    instructor: {
      name: "Dr. Evelyn Foster",
      verified: true,
      role: "Systems Research Scientist"
    },
    type: "video",
    category: "Tech",
    ratePerMin: 6,
    unlockCap: 240,
    rateDisplay: "₦6 / min",
    unlockDisplay: "₦240 unlock",
    available: false,
    expectedRelease: "October 2026",
    initialRequests: 42,
    targetRequests: 100,
    escrowTarget: 50000,
    coverImage: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=1200&auto=format&fit=crop",
    description: "Build ultra-fast, memory-safe APIs and microservices using Actix-Web, Axum, Tokio, and Sqlx with native Interledger streaming payment integration.",
    modules: [
      { id: 1, title: "Tokio Async Runtime & Channels", duration: "25:00" },
      { id: 2, title: "Axum Routing & Zero-Cost Extractors", duration: "32:00" },
      { id: 3, title: "High-Throughput ILP Payment Sinks", duration: "28:00" }
    ]
  },

  // Pre-release 5
  "5": {
    id: "5",
    title: "Zero to One: African Enterprise Strategy",
    instructor: {
      name: "Guest Venture Partner",
      verified: true,
      role: "Venture Builder"
    },
    type: "ebook",
    category: "Business",
    ratePerMin: 4,
    unlockCap: 160,
    rateDisplay: "₦4 / min",
    unlockDisplay: "₦160 unlock",
    available: false,
    expectedRelease: "November 2026",
    initialRequests: 18,
    targetRequests: 50,
    escrowTarget: 35000,
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop",
    description: "Learn how to build sustainable companies that create entirely new distribution categories across developing markets.",
    modules: [
      { id: 1, title: "The Monopoly of Distribution", duration: "15 pages" },
      { id: 2, title: "The Last Mover Advantage", duration: "22 pages" },
      { id: 3, title: "Cash Flow vs Hype in Frontier Tech", duration: "30 pages" }
    ]
  }
};

const INITIAL_WALLET_BALANCE = 1200.0;
const FREE_PREVIEW_SECONDS = 120; // 2 minutes free preview
const EBOOK_IDLE_TIMEOUT_SECONDS = 60; // 60s idle triggers meter pause
const EBOOK_PAGE_MAX_BILLED_SECONDS = 45; // Max 45s charge per page

export default function CoursePlayerPage() {
  const params = useParams();
  const { t } = useLanguage();
  const id = (params?.id as string) || "ts-arch";

  const course: CourseRecord =
    COURSES_DATABASE[id] || COURSES_DATABASE["ts-arch"];

  // Active module selection
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const activeModule = course.modules[activeModuleIndex] || course.modules[0];

  // Media playback & player states
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRef = course.type === "audio" ? audioRef : videoRef;

  const [isPlaying, setIsPlaying] = useState(course.type === "ebook");
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1800); // 30 minutes default duration

  // High-water mark for rewatch protection (new seconds only)
  const [maxWatchedTime, setMaxWatchedTime] = useState<number>(0);

  // Metering & Wallet states
  const [spend, setSpend] = useState<number>(0);
  const [playerState, setPlayerState] = useState<PaymentState>("free_preview");
  const [showLiveMeter, setShowLiveMeter] = useState(true);

  // Audio waveform animation state
  const [audioBarHeights, setAudioBarHeights] = useState<number[]>(
    Array.from({ length: 28 }, () => 14)
  );

  // Ebook-specific state
  const [currentPage, setCurrentPage] = useState(0);
  const [visitedPages, setVisitedPages] = useState<number[]>([]);
  const [isReaderIdle, setIsReaderIdle] = useState(false);
  const [pageBilledSeconds, setPageBilledSeconds] = useState<Record<number, number>>({ 0: 0 });
  const [readerFontSize, setReaderFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-release crowdfunding / voting
  const [votes, setVotes] = useState<number>(course.initialRequests || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isPledging, setIsPledging] = useState(false);
  const [pledgedAmount, setPledgedAmount] = useState<number>(14500.0);
  const [isLaurieOpen, setIsLaurieOpen] = useState(false);

  // -------------------------------------------------------------
  // Dynamic Micropayment & Rent-to-Own Calculation
  // -------------------------------------------------------------
  const calculateStateAndSpend = (
    timeInSeconds: number,
    highWaterMark: number,
    playing: boolean
  ): { nextState: PaymentState; nextSpend: number } => {
    // Paid content starts strictly AFTER 120s free preview
    const billableSeconds = Math.max(0, highWaterMark - FREE_PREVIEW_SECONDS);
    const rawSpend = billableSeconds * (course.ratePerMin / 60);
    const boundedSpend = Math.min(course.unlockCap, rawSpend);

    // 1. Cap reached -> Full permanent ownership
    if (boundedSpend >= course.unlockCap) {
      return { nextState: "unlocked", nextSpend: course.unlockCap };
    }

    // 2. Playback paused
    if (!playing) {
      return { nextState: "paused", nextSpend: boundedSpend };
    }

    // 3. 2-minute free preview window
    if (timeInSeconds < FREE_PREVIEW_SECONDS) {
      return { nextState: "free_preview", nextSpend: boundedSpend };
    }

    // 4. Rewatch protection: Rewound before highest watched time
    if (timeInSeconds < highWaterMark) {
      return { nextState: "rewatching", nextSpend: boundedSpend };
    }

    // 5. Actively streaming brand-new billable content
    return { nextState: "paying", nextSpend: boundedSpend };
  };

  // Helper label for the StatusDot
  const getRateLabel = () => {
    switch (playerState) {
      case "unlocked":
        return "₦0 / min (Unlocked)";
      case "free_preview":
        return "₦0 / min (2m Preview)";
      case "rewatching":
        return "₦0 / min (Free Rewatch)";
      case "paused":
        return "₦0 / min (Paused)";
      case "paying":
      default:
        return `${course.rateDisplay}`;
    }
  };

  const currentWalletBalance = Math.max(0, INITIAL_WALLET_BALANCE - spend);

  const formatMinutesUsed = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const formatTimeHMS = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // -------------------------------------------------------------
  // Video & Audio Playback Handlers
  // -------------------------------------------------------------
  const togglePlay = () => {
    if (course.type === "ebook") {
      const nextPlay = !isPlaying;
      setIsPlaying(nextPlay);
      const { nextState, nextSpend } = calculateStateAndSpend(
        currentTime,
        maxWatchedTime,
        nextPlay
      );
      setPlayerState(nextPlay ? nextState : "paused");
      setSpend(nextSpend);
      if (nextPlay) resetEbookActivity();
      return;
    }

    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
        setIsPlaying(false);
        const { nextState, nextSpend } = calculateStateAndSpend(
          mediaRef.current.currentTime,
          maxWatchedTime,
          false
        );
        setPlayerState(nextState === "unlocked" ? "unlocked" : "paused");
        setSpend(nextSpend);
      } else {
        const playPromise = mediaRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              const { nextState, nextSpend } = calculateStateAndSpend(
                mediaRef.current?.currentTime || 0,
                maxWatchedTime,
                true
              );
              setPlayerState(nextState);
              setSpend(nextSpend);
            })
            .catch((err) => {
              console.warn("Playback error, retrying muted:", err);
              if (mediaRef.current) {
                mediaRef.current.muted = true;
                setIsMuted(true);
                mediaRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
              }
            });
        }
      }
    }
  };

  const handleMediaTimeUpdate = () => {
    if (!mediaRef.current) return;
    const curr = mediaRef.current.currentTime;
    setCurrentTime(curr);

    if (mediaRef.current.duration && !isNaN(mediaRef.current.duration)) {
      setDuration(mediaRef.current.duration);
    }

    setMaxWatchedTime((prevMax) => {
      const nextMax = Math.max(prevMax, curr);
      const { nextState, nextSpend } = calculateStateAndSpend(curr, nextMax, true);
      setPlayerState(nextState);
      setSpend(nextSpend);
      return nextMax;
    });
  };

  const seekTo = (seconds: number) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    if (mediaRef.current) {
      mediaRef.current.currentTime = clamped;
      setCurrentTime(clamped);
      const { nextState, nextSpend } = calculateStateAndSpend(
        clamped,
        maxWatchedTime,
        isPlaying
      );
      setPlayerState(nextState);
      setSpend(nextSpend);
    }
  };

  const skipSeconds = (offset: number) => {
    if (course.type === "ebook") {
      if (offset > 0) handleNextPage();
      else handlePrevPage();
      return;
    }
    const target = (mediaRef.current?.currentTime || currentTime) + offset;
    seekTo(target);
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      const nextMute = !isMuted;
      mediaRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (mediaRef.current) {
      mediaRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Audio visualizer wave animation
  useEffect(() => {
    if (course.type !== "audio" || !isPlaying) return;
    const interval = setInterval(() => {
      setAudioBarHeights(
        Array.from({ length: 28 }, () => Math.floor(Math.random() * 26) + 8)
      );
    }, 120);
    return () => clearInterval(interval);
  }, [course.type, isPlaying]);

  // -------------------------------------------------------------
  // Ebook Slow Reader & Inactivity Metering Protection
  // -------------------------------------------------------------
  const resetEbookActivity = () => {
    setIsReaderIdle(false);
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    activityTimerRef.current = setTimeout(() => {
      setIsReaderIdle(true);
      setPlayerState("paused");
    }, EBOOK_IDLE_TIMEOUT_SECONDS * 1000);
  };

  useEffect(() => {
    if (course.type !== "ebook" || !isPlaying) return;
    resetEbookActivity();

    const handleUserInteraction = () => resetEbookActivity();
    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("pointermove", handleUserInteraction);
    window.addEventListener("scroll", handleUserInteraction, true);
    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction, { passive: true });

    return () => {
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("pointermove", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction, true);
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [course.type, isPlaying, currentPage]);

  const isPageBilledCapped =
    (pageBilledSeconds[currentPage] || 0) >= EBOOK_PAGE_MAX_BILLED_SECONDS;
  const isPageVisited = visitedPages.includes(currentPage);

  // Ebook reading interval (1-second active timer tick)
  useEffect(() => {
    if (course.type !== "ebook" || !isPlaying) return;
    if (isReaderIdle) {
      const timer = setTimeout(() => {
        setPlayerState("paused");
      }, 0);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const nextTime = prev + 1;

        // Check if page is already visited or cost-capped on this page:
        // In both cases, reading time ticks but micropayments are ₦0!
        const isFreePage = isPageVisited || isPageBilledCapped;

        if (isFreePage) {
          if (nextTime < FREE_PREVIEW_SECONDS) {
            setPlayerState("free_preview");
          } else if (spend >= course.unlockCap) {
            setPlayerState("unlocked");
          } else {
            setPlayerState("rewatching");
          }
          return nextTime;
        }

        // New billable reading:
        setMaxWatchedTime((prevMax) => {
          const nextMax = Math.max(prevMax, nextTime);
          const { nextState, nextSpend } = calculateStateAndSpend(
            nextTime,
            nextMax,
            true
          );
          setPlayerState(nextState);
          setSpend(nextSpend);
          return nextMax;
        });

        // Track billable seconds for this specific page
        setPageBilledSeconds((prev) => ({
          ...prev,
          [currentPage]: (prev[currentPage] || 0) + 1
        }));

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    course.type,
    isPlaying,
    isReaderIdle,
    isPageBilledCapped,
    isPageVisited,
    currentPage,
    spend,
    course.unlockCap,
    course.ratePerMin
  ]);

  const handleNextPage = () => {
    setVisitedPages((prev) => Array.from(new Set([...prev, currentPage])));
    if (currentPage < ebookPages.length - 1) {
      setCurrentPage((prev) => prev + 1);
      resetEbookActivity();
    }
  };

  const handlePrevPage = () => {
    setVisitedPages((prev) => Array.from(new Set([...prev, currentPage])));
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      resetEbookActivity();
    }
  };

  // Keyboard navigation for ebook
  useEffect(() => {
    if (course.type !== "ebook") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextPage();
      if (e.key === "ArrowLeft") handlePrevPage();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [course.type, currentPage, isPlaying]);

  // Dynamic font sizing configuration
  const fontSizes = {
    normal: {
      body: "text-[16px] sm:text-[17px] leading-[1.8]",
      h1: "text-2xl sm:text-3xl",
      h2: "text-xl sm:text-2xl",
      quote: "text-[15px] sm:text-[16px]",
      cardTitle: "text-xs",
      cardText: "text-xs",
    },
    large: {
      body: "text-[20px] sm:text-[22px] leading-[1.85]",
      h1: "text-3xl sm:text-4xl",
      h2: "text-2xl sm:text-3xl",
      quote: "text-[18px] sm:text-[20px]",
      cardTitle: "text-sm",
      cardText: "text-sm",
    },
    xlarge: {
      body: "text-[24px] sm:text-[26px] leading-[1.9]",
      h1: "text-4xl sm:text-5xl",
      h2: "text-3xl sm:text-4xl",
      quote: "text-[21px] sm:text-[23px]",
      cardTitle: "text-base",
      cardText: "text-base",
    },
  }[readerFontSize];

  // -------------------------------------------------------------
  // Ebook Content Data
  // -------------------------------------------------------------
  const ebookPages = [
    (
      <article key="p1" className="space-y-6">
        <header className="border-b border-rule pb-6 mb-6">
          <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
            Chapter 1 • Foundation Systems
          </span>
          <h1 className={`font-serif font-bold text-ink mt-2 leading-tight ${fontSizes.h1}`}>
            {course.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-muted mt-3">
            <span>By {course.instructor.name}</span>
            <span>•</span>
            <span>{course.instructor.role}</span>
            <span>•</span>
            <span className="font-mono text-ink">IFRS & Interledger Certified</span>
          </div>
        </header>

        <p className={`leading-relaxed font-serif text-ink/90 ${fontSizes.body}`}>
          Welcome to the interactive text edition. On Rheodemy, reading is billed strictly by the second using open Interledger payment channels. You never commit to an expensive subscription or upfront textbook purchase. You only pay for what you digest.
        </p>

        <div className="p-6 bg-surface border-l-4 border-forest rounded-r-lg my-6 shadow-xs">
          <h4 className="font-serif font-bold text-ink text-base mb-1">
            The Rheodemy Slow Reader Guarantee
          </h4>
          <p className={`font-serif italic text-ink/85 leading-relaxed ${fontSizes.quote}`}>
            &ldquo;Education must never penalize thoughtful contemplation. If you step away from your screen or pause to take physical notes for 15 seconds, the payment meter stops instantly. Furthermore, each page is strictly capped at 45 billable seconds (₦2.25 max). Once reached, the page remains free to study forever.&rdquo;
          </p>
        </div>

        <p className={`leading-relaxed font-serif text-ink/90 ${fontSizes.body}`}>
          In this module, we will explore offline-first design heuristics, transactional caching across intermittent 2G/3G connections, and how to verify cryptographic signatures on mobile client wallets.
        </p>
      </article>
    ),
    (
      <article key="p2" className="space-y-6">
        <header className="border-b border-rule pb-6 mb-6">
          <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
            Chapter 2 • Low-Bandwidth Interface Density
          </span>
          <h2 className={`font-serif font-bold text-ink mt-2 ${fontSizes.h2}`}>
            Typography, Scarcity & Visual Grids
          </h2>
        </header>

        <p className={`leading-relaxed font-serif text-ink/90 ${fontSizes.body}`}>
          In emerging market contexts, latency is not simply a technical metric—it is an economic cost. When a learner pays per megabyte on prepaid cellular data, bloated web assets directly cannibalize their learning budget.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div className="ledger-card p-4 bg-surface">
            <h5 className={`font-bold uppercase tracking-wider text-forest font-mono ${fontSizes.cardTitle}`}>
              Pattern A: Zero-Asset UI
            </h5>
            <p className={`text-muted mt-1 leading-relaxed ${fontSizes.cardText}`}>
              Use native system fonts, SVG vectors, and CSS grids. Eliminate multi-megabyte heavy web font files to guarantee sub-second initial paint times.
            </p>
          </div>
          <div className="ledger-card p-4 bg-surface">
            <h5 className={`font-bold uppercase tracking-wider text-forest font-mono ${fontSizes.cardTitle}`}>
              Pattern B: Optimistic Ledger
            </h5>
            <p className={`text-muted mt-1 leading-relaxed ${fontSizes.cardText}`}>
              Record student interactions and lesson checkpoints into local IndexedDB queues, syncing with the Interledger node only when a network handshake succeeds.
            </p>
          </div>
        </div>

        <p className={`leading-relaxed font-serif text-ink/90 ${fontSizes.body}`}>
          Notice how the payment meter in the corner stays quiet. You are reading comfortably without flashing alerts or distracting countdown tickers.
        </p>
      </article>
    ),
    (
      <article key="p3" className="space-y-6">
        <header className="border-b border-rule pb-6 mb-6">
          <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
            Chapter 3 • Trust Affordances & Settlement
          </span>
          <h2 className={`font-serif font-bold text-ink mt-2 ${fontSizes.h2}`}>
            Micro-Escrow & Creator Splits
          </h2>
        </header>

        <p className={`leading-relaxed font-serif text-ink/90 ${fontSizes.body}`}>
          Every second you stream this book, micro-kobo fractions are dynamically routed through Interledger: 80% directly into the creator&apos;s verified bank account, 15% to maintain node infrastructure, and 5% directly into the regional bursary reserve for underrepresented students.
        </p>

        <p className={`leading-relaxed font-serif text-ink/90 ${fontSizes.body}`}>
          When your cumulative spend reaches the course unlock ceiling of {course.unlockDisplay}, you graduate to full lifetime access. The course is permanently added to your library with zero recurring fees.
        </p>

        <div className="p-6 bg-forest/10 border border-forest/30 rounded-lg text-center space-y-2 mt-8">
          <CheckCircle2 className="w-8 h-8 text-forest mx-auto" />
          <h4 className="font-serif font-bold text-ink text-lg">
            Module 1 Completed
          </h4>
          <p className="text-xs text-muted max-w-md mx-auto">
            You can advance to Module 2 from the sidebar or re-read this chapter at any time for ₦0.
          </p>
        </div>
      </article>
    )
  ];

  // -------------------------------------------------------------
  // Pre-Release Interactive Actions
  // -------------------------------------------------------------
  const handleVote = () => {
    if (!hasVoted) {
      setVotes((prev) => prev + 1);
      setHasVoted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(`rheodemy_requested_${id}`, "true");
      }
    }
  };

  const togglePledge = () => {
    setIsPledging(!isPledging);
  };

  useEffect(() => {
    let pledgeInterval: NodeJS.Timeout;
    if (isPledging) {
      pledgeInterval = setInterval(() => {
        setPledgedAmount((prev) => prev + 50);
      }, 400);
    }
    return () => clearInterval(pledgeInterval);
  }, [isPledging]);

  // Pre-release screen
  if (!course.available) {
    const target = course.targetRequests || 100;
    const progressPercent = Math.min((votes / target) * 100, 100);
    const escrowGoal = course.escrowTarget || 50000;
    const escrowPercent = Math.min((pledgedAmount / escrowGoal) * 100, 100);

    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
        {/* Header */}
        <header className="h-16 border-b border-rule flex items-center justify-between px-6 bg-surface sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/learner"
              className="w-8 h-8 rounded-full border border-rule flex items-center justify-center hover:bg-paper transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-ink" />
            </Link>
            <div className="h-4 w-px bg-rule" />
            <h1 className="font-serif font-bold text-sm text-ink truncate max-w-sm">
              {course.title}
            </h1>
          </div>
          <span className="badge-category bg-forest/15 text-forest border border-forest/30 font-mono text-xs">
            {t.preRelease} • Awaiting Release
          </span>
        </header>

        {/* Demand & Crowdfund Container */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-4xl mx-auto w-full">
          <div className="ledger-card p-8 sm:p-12 w-full bg-surface space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
                Interledger Demand Escrow
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-ink">
                {course.title}
              </h2>
              <p className="text-sm text-muted max-w-lg mx-auto leading-relaxed">
                {course.description}
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted pt-2">
                <span>By <strong className="text-ink">{course.instructor.name}</strong></span>
                <span>•</span>
                <span>Expected: <strong className="text-ink">{course.expectedRelease}</strong></span>
                <span>•</span>
                <span>Format: <strong className="text-ink uppercase">{course.type}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Demand Upvoting */}
              <div className="p-6 rounded-lg bg-paper border border-rule space-y-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-forest" />
                    Student Demand Queue
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Cast your request. The author will publish the full curriculum once 100 students request it.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-mono text-muted">
                    <span>Requests: {votes} / {target}</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-rule h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-forest h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVote}
                    disabled={hasVoted}
                    className={`w-full py-3 rounded-[6px] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      hasVoted
                        ? "bg-forest/15 border border-forest/30 text-forest cursor-default"
                        : "btn-forest"
                    }`}
                  >
                    {hasVoted ? (
                      <>
                        <Check className="w-4 h-4" /> Request Registered
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Request This Course
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Micro-escrow Pledges */}
              <div className="p-6 rounded-lg bg-paper border border-rule space-y-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-4 h-4 text-sun" />
                    Interledger Escrow Pot
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Pledge micro-kobo fractions into escrow. If publication is cancelled, funds return to your wallet automatically.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-mono text-muted">
                    <span>Escrow: ₦{pledgedAmount.toLocaleString()} / ₦{escrowGoal.toLocaleString()}</span>
                    <span>{escrowPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-rule h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sun h-full rounded-full transition-all duration-500"
                      style={{ width: `${escrowPercent}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={togglePledge}
                    className={`w-full py-3 rounded-[6px] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isPledging
                        ? "bg-sun text-ink font-bold animate-pulse"
                        : "border border-rule hover:bg-surface text-ink"
                    }`}
                  >
                    {isPledging ? (
                      <>
                        <Activity className="w-4 h-4 animate-spin text-ink" />
                        Pledging Stream Active (₦50/tick)...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 text-forest" />
                        Pledge from Wallet
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Live Production Player (Video / Audio / Ebook)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      {/* Editorial Header */}
      <header className="h-16 border-b border-rule flex items-center justify-between px-4 sm:px-6 bg-surface sticky top-0 z-40">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/dashboard/learner"
            className="w-8 h-8 rounded-full border border-rule flex items-center justify-center hover:bg-paper transition-colors shrink-0"
            title="Back to Learner Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-ink" />
          </Link>
          <div className="h-4 w-px bg-rule shrink-0" />
          <div className="min-w-0 flex items-center gap-2">
            <h1 className="font-serif font-bold text-sm text-ink truncate max-w-xs sm:max-w-md">
              {course.title}
            </h1>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-paper border border-rule text-muted">
              {course.type}
            </span>
          </div>
        </div>

        {/* Top-Right Controls: Wallet Pill & Language */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <WalletPill
              cashBalance={`₦${currentWalletBalance.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`}
              minutesEquivalent={`~${Math.floor(currentWalletBalance / course.ratePerMin)} min`}
            />
          </div>
        </div>
      </header>

      {/* Main Player & Sidebar Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Column: Player & Under-Player Content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* ========================================================= */}
          {/* 1. VIDEO PLAYER FORMAT */}
          {/* ========================================================= */}
          {course.type === "video" && (
            <div
              ref={containerRef}
              className="w-full aspect-video bg-[#0E1513] relative group overflow-hidden select-none"
            >
              <video
                ref={videoRef}
                src="/videos/sample.mp4"
                playsInline
                preload="metadata"
                onTimeUpdate={handleMediaTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
              />

              {/* StatusDot mounted in top corner */}
              <div className="absolute top-4 end-4 z-30">
                <StatusDot
                  state={playerState}
                  sessionSpend={`₦${spend.toFixed(2)}`}
                  minutesUsed={formatMinutesUsed(currentTime)}
                  balance={`₦${currentWalletBalance.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`}
                  ratePerMin={getRateLabel()}
                  showLiveMeter={showLiveMeter}
                  onToggleLiveMeter={setShowLiveMeter}
                />
              </div>

              {/* Center Play Button Overlay */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] cursor-pointer z-20"
                  onClick={togglePlay}
                >
                  <button
                    type="button"
                    aria-label="Play video"
                    className="w-16 h-16 rounded-full bg-surface/90 hover:bg-surface text-ink flex items-center justify-center shadow-xl transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Play className="w-7 h-7 fill-current ms-1 text-ink" />
                  </button>
                </div>
              )}

              {/* Custom Editorial Video Controls Bar */}
              <div
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 pt-16 transition-opacity duration-300 z-20 ${
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Full-width Scrubber Bar */}
                <div className="relative w-full flex items-center group/scrubber cursor-pointer py-2">
                  <div className="w-full h-1.5 group-hover/scrubber:h-2.5 bg-white/20 rounded-full overflow-hidden transition-all pointer-events-none">
                    <div
                      className="h-full bg-forest transition-all duration-75"
                      style={{
                        width: `${Math.min(100, Math.max(0.5, (currentTime / (duration || 1)) * 100))}%`
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 1800}
                    step={0.5}
                    value={currentTime}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Seek video position"
                  />
                </div>

                {/* Bottom Row Controls */}
                <div className="flex items-center justify-between pt-2 text-white">
                  <div className="flex items-center gap-3 sm:gap-5">
                    {/* Play / Pause */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="hover:text-forest transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current" />
                      )}
                    </button>

                    {/* Skip -15s / +15s */}
                    <button
                      type="button"
                      onClick={() => skipSeconds(-15)}
                      className="hover:text-forest transition-colors cursor-pointer"
                      title="Rewind 15 seconds"
                    >
                      <Rewind className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => skipSeconds(15)}
                      className="hover:text-forest transition-colors cursor-pointer"
                      title="Skip forward 15 seconds"
                    >
                      <FastForward className="w-4 h-4" />
                    </button>

                    {/* Volume / Mute */}
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="hover:text-forest transition-colors cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-muted" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Time Counter */}
                    <span className="font-mono text-xs text-white/80 select-none">
                      {formatTimeHMS(currentTime)} / {formatTimeHMS(duration || 1800)}
                    </span>

                    {/* Rewatch Badge */}
                    {playerState === "rewatching" && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-forest/20 text-forest border border-forest/30 text-[10px] font-mono">
                        <RotateCcw className="w-3 h-3" /> Free Rewatch
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="hover:text-forest transition-colors cursor-pointer"
                      title="Toggle Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. AUDIO PLAYER FORMAT */}
          {/* ========================================================= */}
          {course.type === "audio" && (
            <div className="w-full bg-[#111A16] text-white p-6 sm:p-10 relative overflow-hidden select-none">
              <audio
                ref={audioRef}
                src="/videos/sample.mp4"
                preload="metadata"
                onTimeUpdate={handleMediaTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />

              {/* StatusDot mounted in top corner */}
              <div className="absolute top-4 end-4 z-30">
                <StatusDot
                  state={playerState}
                  sessionSpend={`₦${spend.toFixed(2)}`}
                  minutesUsed={formatMinutesUsed(currentTime)}
                  balance={`₦${currentWalletBalance.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`}
                  ratePerMin={getRateLabel()}
                  showLiveMeter={showLiveMeter}
                  onToggleLiveMeter={setShowLiveMeter}
                />
              </div>

              <div className="max-w-2xl mx-auto space-y-8 py-4">
                {/* Album Cover & Track Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-white/10 shadow-2xl relative shrink-0 bg-surface">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Headphones className="w-8 h-8 text-white/80" />
                    </div>
                  </div>

                  <div className="space-y-2 min-w-0">
                    <span className="badge-category bg-forest/20 text-forest border border-forest/40 text-[10px]">
                      Audio Masterclass • Module {activeModule.id}
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-white line-clamp-2">
                      {activeModule.title}
                    </h2>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-white/70">
                      <span>{course.instructor.name}</span>
                      {course.instructor.verified && <VerifiedStamp />}
                      <span>•</span>
                      <span className="font-mono text-white/90">{course.rateDisplay}</span>
                    </div>
                  </div>
                </div>

                {/* Animated Waveform Visualization */}
                <div className="h-16 flex items-center justify-between gap-1.5 px-4 bg-black/30 rounded-lg border border-white/5">
                  {audioBarHeights.map((h, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 rounded-full transition-all duration-150"
                      style={{
                        height: isPlaying ? `${h}px` : "6px",
                        backgroundColor:
                          (idx / audioBarHeights.length) * 100 <= (currentTime / (duration || 1)) * 100
                            ? "#0F5B45"
                            : "#33413B"
                      }}
                    />
                  ))}
                </div>

                {/* Full Scrubber Slider */}
                <div className="space-y-1">
                  <div className="relative w-full flex items-center group/scrubber cursor-pointer py-2">
                    <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden pointer-events-none">
                      <div
                        className="h-full bg-forest transition-all duration-75"
                        style={{
                          width: `${Math.min(100, Math.max(0.5, (currentTime / (duration || 1)) * 100))}%`
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 1800}
                      step={0.5}
                      value={currentTime}
                      onChange={(e) => seekTo(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Seek audio position"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-white/60">
                    <span>{formatTimeHMS(currentTime)}</span>
                    <span>{formatTimeHMS(duration || 1800)}</span>
                  </div>
                </div>

                {/* Primary Audio Transport Controls */}
                <div className="flex items-center justify-between pt-2">
                  {/* Speed Pill Selector */}
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-white/10">
                    {[1, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => changePlaybackSpeed(spd)}
                        className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                          playbackSpeed === spd
                            ? "bg-forest text-white font-bold"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Centered Skip & Play Controls */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => skipSeconds(-15)}
                      className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                      title="Rewind 15 seconds"
                    >
                      <Rewind className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full bg-forest hover:bg-forest/90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ms-1" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => skipSeconds(15)}
                      className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                      title="Skip forward 15 seconds"
                    >
                      <FastForward className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mute Toggle */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-2 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-muted" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. EBOOK READER FORMAT */}
          {/* ========================================================= */}
          {course.type === "ebook" && (
            <div className="w-full bg-paper border-b border-rule min-h-[580px] p-6 sm:p-12 relative flex flex-col justify-between">
              
              {/* StatusDot mounted in top corner */}
              <div className="absolute top-4 end-4 z-30">
                <StatusDot
                  state={playerState}
                  sessionSpend={`₦${spend.toFixed(2)}`}
                  minutesUsed={formatMinutesUsed(currentTime)}
                  balance={`₦${currentWalletBalance.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`}
                  ratePerMin={getRateLabel()}
                  showLiveMeter={showLiveMeter}
                  onToggleLiveMeter={setShowLiveMeter}
                />
              </div>

              {/* Reader Toolbar: Font sizing & Reading Toggle */}
              <div className="max-w-3xl mx-auto w-full flex items-center justify-between pb-4 border-b border-rule">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-mono uppercase">Text size:</span>
                  <button
                    type="button"
                    onClick={() => setReaderFontSize("normal")}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                      readerFontSize === "normal"
                        ? "bg-forest text-white"
                        : "border border-rule hover:bg-surface text-ink"
                    }`}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFontSize("large")}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                      readerFontSize === "large"
                        ? "bg-forest text-white"
                        : "border border-rule hover:bg-surface text-ink"
                    }`}
                  >
                    Large
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFontSize("xlarge")}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                      readerFontSize === "xlarge"
                        ? "bg-forest text-white"
                        : "border border-rule hover:bg-surface text-ink"
                    }`}
                  >
                    XL
                  </button>
                </div>

                <button
                  type="button"
                  onClick={togglePlay}
                  className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isPlaying
                      ? "bg-surface border border-rule text-ink hover:bg-paper"
                      : "btn-forest"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause Reading
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-3.5 h-3.5" /> Start Reading
                    </>
                  )}
                </button>
              </div>

              {/* Slow Reader Notification Banners (Non-intrusive) */}
              <div className="max-w-3xl mx-auto w-full pt-4 space-y-2">
                {isReaderIdle && isPlaying && (
                  <div className="p-3 bg-sun/15 border border-sun/40 text-ink rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-sun shrink-0" />
                    <span>
                      <strong>Idle paused:</strong> You have been idle for 15 seconds. Meter paused to protect your wallet while thinking. Move cursor or scroll to resume.
                    </span>
                  </div>
                )}

                {isPageBilledCapped && (
                  <div className="p-3 bg-forest/10 border border-forest/30 text-forest rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                    <span>
                      <strong>Page cap reached (45s max):</strong> You will not be billed further on this page. Continue reading for free!
                    </span>
                  </div>
                )}

                {isPageVisited && !isPageBilledCapped && (
                  <div className="p-3 bg-surface border border-rule text-muted rounded-lg text-xs flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-forest shrink-0" />
                    <span>
                      <strong>Visited page:</strong> Free re-reading active (₦0 / min).
                    </span>
                  </div>
                )}
              </div>

              {/* Reader Body Canvas */}
              <div
                className={`max-w-3xl mx-auto w-full py-6 transition-all duration-300 ${
                  !isPlaying ? "opacity-60" : "opacity-100"
                } ${fontSizes.body}`}
              >
                {ebookPages[currentPage]}
              </div>

              {/* Ebook Pagination Bar */}
              <div className="max-w-3xl mx-auto w-full pt-8 border-t border-rule flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium border border-rule hover:bg-surface disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="text-center font-mono text-xs text-muted">
                  Page {currentPage + 1} of {ebookPages.length}
                </div>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === ebookPages.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium border border-rule hover:bg-surface disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* UNDER PLAYER: COURSE INFO & LIVE SETTLEMENT SPLIT */}
          {/* ========================================================= */}
          <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
            
            {/* Title & Instructor Card */}
            <div className="space-y-4 pb-6 border-b border-rule">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
                    Active Module {activeModule.id}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                    {activeModule.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="badge-category bg-forest/15 text-forest border border-forest/30 font-mono text-xs">
                    {course.unlockDisplay}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted">
                <div className="w-8 h-8 rounded-full bg-surface border border-rule flex items-center justify-center font-bold text-ink">
                  {course.instructor.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-ink">
                    <span>{course.instructor.name}</span>
                    {course.instructor.verified && <VerifiedStamp />}
                  </div>
                  <p className="text-[11px] text-muted">{course.instructor.role}</p>
                </div>
              </div>

              <p className="text-sm text-ink/80 leading-relaxed pt-2">
                {course.description}
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: Course Modules Sidebar */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-rule bg-surface flex flex-col">
          <div className="p-5 border-b border-rule">
            <h3 className="font-serif font-bold text-sm text-ink uppercase tracking-wider">
              {t.courseModules}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Select any chapter to switch active lesson
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {course.modules.map((mod, idx) => {
              const isActive = idx === activeModuleIndex;
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setActiveModuleIndex(idx);
                    setCurrentPage(0);
                    if (mediaRef.current) {
                      mediaRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? "bg-forest/10 border-forest text-ink font-semibold"
                      : "border-rule bg-paper hover:bg-surface text-ink/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5 ${
                        isActive
                          ? "bg-forest text-white font-bold"
                          : "border border-rule bg-surface text-muted"
                      }`}
                    >
                      {mod.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-medium leading-snug line-clamp-2">
                        {mod.title}
                      </h4>
                      <p className="text-[11px] font-mono text-muted mt-1 flex items-center justify-between">
                        <span>{mod.duration}</span>
                        {isActive && (
                          <span className="text-forest font-semibold">
                            {course.type === "ebook" ? "Reading" : "Active"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Laurie AI Assistant Tutor Sidebar Box */}
          <div className="p-4 border-t border-rule bg-paper">
            <div className="p-3 bg-surface border border-forest/20 rounded-md space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center font-serif font-bold text-xs">
                  L
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-ink flex items-center gap-1.5">
                    <span>Laurie AI Tutor</span>
                    <span className="text-[9px] font-mono bg-forest/10 text-forest px-1 rounded">AI</span>
                  </div>
                  <p className="text-[10px] text-muted">Clarify concepts in this module</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isPlaying && mediaRef.current) {
                    mediaRef.current.pause();
                    setIsPlaying(false);
                    setPlayerState("paused");
                  }
                  setIsLaurieOpen(true);
                }}
                className="w-full btn-forest text-xs py-1.5 rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Ask Laurie (₦0 while paused)</span>
              </button>
            </div>
          </div>
        </aside>

      </div>

      {/* Laurie AI Assistant Tutor Drawer */}
      <LaurieAdvisor
        isOpen={isLaurieOpen}
        onClose={() => setIsLaurieOpen(false)}
        learnerName="Learner"
        currentCourseContext={{
          id: course.id,
          title: course.title,
          topic: activeModule.title,
        }}
      />

    </div>
  );
}
