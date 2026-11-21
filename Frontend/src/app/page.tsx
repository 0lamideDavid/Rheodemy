"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  Search, 
  Play, 
  Pause, 
  RotateCcw,
  RotateCw,
  ArrowRight, 
  Sun,
  Moon,
  Check
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { StatusDot, PaymentState } from "@/components/ui/StatusDot";
import { RateTag } from "@/components/ui/RateTag";
import { VerifiedStamp } from "@/components/ui/VerifiedStamp";
import { CourseCard, CourseData } from "@/components/ui/CourseCard";
import HeroLearnerPortal from "@/components/ui/HeroLearnerPortal";
import { BrandLogo } from "@/components/ui/BrandLogo";

// Realistic sample courses adhering to subject tags and editorial design
const SAMPLE_COURSES: CourseData[] = [
  {
    id: "ts-arch",
    title: "TypeScript Systems Architecture & Microservices",
    instructor: {
      name: "Alex Chen",
      verified: true,
    },
    medium: "video",
    category: "Tech",
    durationOrPages: "45 min",
    ratePerMin: "₦5 / min",
    unlockPrice: "₦200 unlock",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    unlockedProgress: 45,
  },
  {
    id: "product-design",
    title: "Human-Centered Design for Emerging Markets",
    instructor: {
      name: "Amara Okafor",
      verified: true,
    },
    medium: "ebook",
    category: "Creative",
    durationOrPages: "120 pages",
    ratePerMin: "₦3 / page",
    unlockPrice: "₦150 unlock",
    coverImage: "https://images.unsplash.com/photo-1544716278-e513176f20b5?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "startup-growth",
    title: "Zero to Product-Market Fit in Sub-Saharan Africa",
    instructor: {
      name: "Kofi Mensah",
      verified: true,
    },
    medium: "audio",
    category: "Business",
    durationOrPages: "60 min",
    ratePerMin: "₦4 / min",
    unlockPrice: "₦180 unlock",
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "french-basics",
    title: "Professional Business French for Trade & Commerce",
    instructor: {
      name: "Claire Dubois",
      verified: true,
    },
    medium: "video",
    category: "Languages",
    durationOrPages: "38 min",
    ratePerMin: "₦5 / min",
    unlockPrice: "₦190 unlock",
    coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "data-analytics",
    title: "Practical SQL & Analytics for Fintech Operations",
    instructor: {
      name: "David Adeleke",
      verified: true,
    },
    medium: "video",
    category: "Tech",
    durationOrPages: "52 min",
    ratePerMin: "₦5 / min",
    unlockPrice: "₦220 unlock",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "accounting-exams",
    title: "ICAN & ACCA Financial Reporting Deep-Dive",
    instructor: {
      name: "Dr. Fatima Al-Mansoor",
      verified: true,
    },
    medium: "ebook",
    category: "Exams",
    durationOrPages: "240 pages",
    ratePerMin: "₦4 / page",
    unlockPrice: "₦250 unlock",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
  },
];

export default function EditorialLandingPage() {
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Interactive Lesson Demo States (Illustrating the quiet status dot)
  const [demoState, setDemoState] = useState<PaymentState>("free_preview");
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoTime, setDemoTime] = useState(34); // current playback position in seconds
  const [maxWatchedTime, setMaxWatchedTime] = useState(34); // furthest second reached (rewatch protection)
  const [demoSpend, setDemoSpend] = useState(0);
  const [showLiveMeter, setShowLiveMeter] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const TOTAL_DEMO_DURATION = 2710; // 45m 10s
  const INITIAL_DEMO_BALANCE = 1200.0; // Starting student wallet balance
  const COURSE_UNLOCK_CAP = 200.0; // Rent-to-own guaranteed cap (Permanent Unlock)

  // Live wallet balance dynamically decreases as micropayments stream, strictly capped at ₦200 total deduction
  const currentWalletBalance = Math.max(0, INITIAL_DEMO_BALANCE - demoSpend);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatMinutesUsed = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  // Rent-to-own and rewatch protection logic:
  // 1. 0:00 - 2:00 = Free preview (spend = ₦0)
  // 2. Beyond 2:00 = Micropayments at ₦5/min ONLY for NEW seconds (time >= maxWatchedTime)
  // 3. Rewatching (time < maxWatchedTime) = 100% FREE! Zero money accumulates while rewatching.
  // 4. Once cumulative spend reaches ₦200 = Course is permanently unlocked forever!
  const deriveStateAndSpend = (
    currentTime: number, 
    currentMaxWatched: number, 
    isPlaying: boolean
  ): { state: PaymentState; spend: number } => {
    // Cumulative spend only counts new content watched beyond the 2-minute (120s) preview
    const paidSeconds = Math.max(0, currentMaxWatched - 120);
    const rawSpend = paidSeconds * (5 / 60);
    const spend = Math.min(COURSE_UNLOCK_CAP, rawSpend);

    // Case 1: Cap reached -> Permanently Unlocked
    if (spend >= COURSE_UNLOCK_CAP) {
      return { state: "unlocked", spend: COURSE_UNLOCK_CAP };
    }

    // Case 2: Video is paused
    if (!isPlaying) {
      return { state: "paused", spend };
    }

    // Case 3: In the initial 2-minute free preview window
    if (currentTime < 120) {
      return { state: "free_preview", spend };
    }

    // Case 4: Rewatching previously watched/paid seconds (REWIND PROTECTION!)
    if (currentTime < currentMaxWatched) {
      return { state: "rewatching", spend };
    }

    // Case 5: Actively streaming brand-new paid content
    return { state: "paying", spend };
  };

  const getRateLabel = () => {
    switch (demoState) {
      case "unlocked":
        return "₦0 / min (Unlocked)";
      case "free_preview":
        return "₦0 / min (Preview)";
      case "rewatching":
        return "₦0 / min (Free Rewatch)";
      case "paused":
        return "₦0 / min (Paused)";
      case "paying":
      default:
        return "₦5 / min";
    }
  };

  // Real-time playback timer & micropayment metering calculation
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (demoPlaying) {
      interval = setInterval(() => {
        setDemoTime((prevTime) => {
          const nextTime = prevTime + 1;
          setMaxWatchedTime((prevMax) => {
            const nextMax = Math.max(prevMax, nextTime);
            const { state, spend } = deriveStateAndSpend(nextTime, nextMax, true);
            setDemoState(state);
            setDemoSpend(spend);
            return nextMax;
          });
          return nextTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [demoPlaying]);

  const toggleDemoPlay = () => {
    if (demoPlaying) {
      setDemoPlaying(false);
      const { state, spend } = deriveStateAndSpend(demoTime, maxWatchedTime, false);
      setDemoState(state === "unlocked" ? "unlocked" : "paused");
      setDemoSpend(spend);
      if (videoRef.current) videoRef.current.pause();
    } else {
      setDemoPlaying(true);
      const { state, spend } = deriveStateAndSpend(demoTime, maxWatchedTime, true);
      setDemoState(state);
      setDemoSpend(spend);
      if (videoRef.current) videoRef.current.play().catch(() => {});
    }
  };

  const jumpToTime = (seconds: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_DEMO_DURATION, seconds));
    setDemoTime(clamped);
    setMaxWatchedTime((prevMax) => {
      // If jumping forward, extend max watched; if jumping backward, preserve max watched so rewatch is free!
      const nextMax = Math.max(prevMax, clamped);
      const { state, spend } = deriveStateAndSpend(clamped, nextMax, demoPlaying);
      setDemoState(state);
      setDemoSpend(spend);
      return nextMax;
    });
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = clamped % videoRef.current.duration;
    }
  };

  const resetSimulation = () => {
    setDemoTime(0);
    setMaxWatchedTime(0);
    setDemoSpend(0);
    setDemoState(demoPlaying ? "free_preview" : "paused");
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const seekRelative = (deltaSeconds: number) => {
    jumpToTime(demoTime + deltaSeconds);
  };

  const categories = ["All", "Tech", "Business", "Languages", "Exams", "Creative"];

  const filteredCourses = SAMPLE_COURSES.filter((course) => {
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesQuery = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div id="top" className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-sun/30">
      
      {/* 🧭 NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-xs border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Wave Mark */}
          <div className="flex items-center gap-6">
            <BrandLogo />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
              <a href="#courses" className="hover:text-ink transition-colors">Courses</a>
              <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
              <a href="#teach" className="hover:text-ink transition-colors">Teach</a>
            </nav>
          </div>

          {/* Search Field (Desktop) */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses or skills..."
                className="w-full ps-9 pe-3 py-2 bg-surface border border-rule focus:border-muted rounded-lg text-xs text-ink placeholder:text-muted transition-colors focus:outline-hidden"
              />
            </div>
          </div>

          {/* Header Controls: Theme, Language, Wallet Pill & Auth */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle (Quiet) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle light or dark theme"
              className="w-9 h-9 rounded-lg border border-rule bg-surface hover:border-muted text-ink flex items-center justify-center transition-colors cursor-pointer"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-sun" /> : <Moon className="w-4 h-4 text-muted" />}
            </button>

            {/* Sign In & Primary CTA */}
            <Link 
              href="/auth?login=true" 
              className="text-xs font-semibold text-muted hover:text-ink transition-colors px-2 hidden xs:inline"
            >
              Sign in
            </Link>

            <Link
              href="/onboarding"
              className="btn-forest text-xs py-2 px-4 min-h-[38px]"
            >
              Start
            </Link>
          </div>

        </div>
      </header>

      {/* 🏛️ HERO SECTION */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full space-y-16">
        
        {/* Editorial Value Proposition */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center overflow-visible">
          
          {/* Left Column: Editorial Copy & Guarantees */}
          <div className="lg:col-span-6 space-y-6">
            {/* Headline: First line Serif, Second line Sans-Serif */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08]">
              <span className="font-serif text-ink block">Learn without borders.</span>
              <span className="font-sans font-bold text-forest block">Pay only for the minutes you use.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl font-normal">
              No monthly subscription traps. Stream verified video lessons, interactive e-books, and masterclasses — paying strictly while you are actively learning, with guaranteed price caps.
            </p>

            {/* Quick Search on Mobile */}
            <div className="lg:hidden w-full pt-2">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, skills, or teachers..."
                  className="w-full ps-9 pe-3 py-3 bg-surface border border-rule focus:border-muted rounded-lg text-sm text-ink placeholder:text-muted transition-colors focus:outline-hidden"
                />
              </div>
            </div>

            {/* Core Guarantees: Plain language, honest proof */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-rule text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-[4px] bg-forest/10 text-forest shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-ink font-semibold block">Full unlock price</strong>
                  <span className="text-muted">Once your micropayments reach full price, the lesson is permanently free.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-[4px] bg-forest/10 text-forest shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-ink font-semibold block">Zero charge on pause</strong>
                  <span className="text-muted">Rewatching and pausing are 100% free. Pausing always pauses payment.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-[4px] bg-forest/10 text-forest shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-ink font-semibold block">2-minute free preview</strong>
                  <span className="text-muted">Watch any lesson before spending a single kobo or cent. No account needed.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Authentic Learner Portal & Floating Ledger Badges (elearning style) */}
          <div className="hidden lg:block lg:col-span-6 relative">
            <HeroLearnerPortal />
          </div>

        </section>

        {/* 🎬 THE INTERACTIVE LESSON PREVIEW (Quiet Status Dot Demo) */}
        <section className="ledger-card p-5 sm:p-7 bg-surface space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rule">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted font-bold">Interactive player preview</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink mt-0.5">
                How the quiet payment meter works
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted hidden sm:inline">Notice:</span>
              <span className="text-xs font-semibold text-forest bg-forest/10 px-2.5 py-1 rounded-[4px]">
                Meter is hidden by default to keep learning focused
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Player Simulation Area (70% on desktop) */}
            <div className="lg:col-span-8 relative aspect-video bg-[#0E1513] rounded-lg overflow-hidden border border-rule group">
              <video
                ref={videoRef}
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop"
              >
                <source src="/videos/sample.mp4" type="video/mp4" />
              </video>

              {/* Status Dot Placement (Corner of the player) */}
              <div className="absolute top-3.5 end-3.5 z-20">
                <StatusDot
                  state={demoState}
                  sessionSpend={`₦${demoSpend.toFixed(2)}`}
                  minutesUsed={formatMinutesUsed(demoTime)}
                  balance={`₦${currentWalletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  ratePerMin={getRateLabel()}
                  showLiveMeter={showLiveMeter}
                  onToggleLiveMeter={setShowLiveMeter}
                />
              </div>

              {/* Play / Pause Centered Action */}
              <button
                type="button"
                onClick={toggleDemoPlay}
                aria-label={demoPlaying ? "Pause video lesson" : "Play video lesson"}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-surface/90 hover:bg-surface text-ink flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-lg z-20"
              >
                {demoPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ms-1" />}
              </button>

              {/* Interactive Full-Width Scrubber Track (Drag & Click Anywhere) */}
              <div className="absolute bottom-10 inset-x-0 px-3 z-30">
                <div className="relative w-full flex items-center group/scrubber cursor-pointer py-1.5">
                  {/* Background Track & Active Progress Bar */}
                  <div className="w-full h-1.5 group-hover/scrubber:h-2.5 bg-white/30 rounded-full overflow-hidden transition-all pointer-events-none">
                    <div 
                      className="h-full bg-forest transition-all duration-75" 
                      style={{ width: `${Math.min(100, Math.max(0.5, (demoTime / TOTAL_DEMO_DURATION) * 100))}%` }}
                    />
                  </div>
                  {/* Invisible Draggable Range Input over the whole track */}
                  <input
                    type="range"
                    min={0}
                    max={TOTAL_DEMO_DURATION}
                    value={demoTime}
                    onChange={(e) => jumpToTime(Number(e.target.value))}
                    aria-label="Seek lesson video"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {/* Draggable visual indicator thumb */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none transition-transform group-hover/scrubber:scale-125"
                    style={{ left: `calc(${Math.min(100, (demoTime / TOTAL_DEMO_DURATION) * 100)}% - 7px)` }}
                  />
                </div>
              </div>

              {/* Bottom Video Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-ink/95 via-ink/80 to-transparent flex items-center justify-between text-xs text-white z-20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    type="button"
                    onClick={toggleDemoPlay} 
                    aria-label={demoPlaying ? "Pause video" : "Play video"}
                    className="hover:text-sun transition-colors cursor-pointer p-1"
                  >
                    {demoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  {/* Rewind 15s */}
                  <button
                    type="button"
                    onClick={() => seekRelative(-15)}
                    aria-label="Rewind 15 seconds"
                    title="Rewind 15 seconds (Rewind is 100% free)"
                    className="hover:text-sun text-white/90 transition-colors cursor-pointer p-1 flex items-center gap-0.5 text-[11px] font-mono"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>15s</span>
                  </button>

                  {/* Forward 15s */}
                  <button
                    type="button"
                    onClick={() => seekRelative(15)}
                    aria-label="Fast-forward 15 seconds"
                    title="Fast-forward 15 seconds"
                    className="hover:text-sun text-white/90 transition-colors cursor-pointer p-1 flex items-center gap-0.5 text-[11px] font-mono"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>15s</span>
                  </button>

                  {/* Dynamic Time Counter */}
                  <span className="font-mono tabular-nums text-[11px] text-white/90 ps-1">
                    {formatTime(demoTime)} / 45:10
                  </span>
                </div>

                <div className="text-[11px] text-white/80 hidden sm:block">
                  <span>Buffering & rewinding are always ₦0</span>
                </div>
              </div>
            </div>

            {/* Sidebar Details (The Ledger View) */}
            <div className="lg:col-span-4 p-5 rounded-lg bg-paper border border-rule space-y-5">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-muted font-bold">Currently previewing</span>
                <h3 className="font-serif font-bold text-lg text-ink mt-0.5">
                  TypeScript Systems Architecture
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                  <span>Instructor: Alex Chen</span>
                  <VerifiedStamp />
                </div>
              </div>

              {/* Rate & Unlock Price Tag */}
              <div className="p-3 bg-surface rounded-lg border border-rule space-y-1">
                <div className="text-[11px] text-muted">Streaming rate</div>
                <RateTag ratePerMin="₦5 / min" unlockPrice="₦200 full price" size="lg" />
                <p className="text-[11px] text-muted pt-1">
                  Once your payments reach ₦200, you own the course for life.
                </p>
              </div>

              {/* Simulation explanation & Quick Test Triggers */}
              <div className="text-xs text-muted space-y-2.5">
                <p>
                  <strong>Test the live meter:</strong> Drag the scrubber or use the fast-forward buttons to test throughout the 45-minute lesson.
                </p>

                {/* 5 Quick Scrub Triggers Across the Entire Lesson */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => jumpToTime(45)}
                    className={`text-[11px] font-mono px-2 py-1.5 rounded border text-center transition-colors cursor-pointer ${
                      demoTime < 120 ? "bg-forest/15 border-forest text-forest font-bold" : "bg-surface border-rule text-muted hover:text-ink"
                    }`}
                  >
                    0:45 (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToTime(135)}
                    className={`text-[11px] font-mono px-2 py-1.5 rounded border text-center transition-colors cursor-pointer ${
                      demoState === "paying" ? "bg-forest/15 border-forest text-forest font-bold" : "bg-surface border-rule text-muted hover:text-ink"
                    }`}
                  >
                    2:15 (Paid)
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToTime(1200)}
                    className={`text-[11px] font-mono px-2 py-1.5 rounded border text-center transition-colors cursor-pointer ${
                      demoTime === 1200 ? "bg-forest/15 border-forest text-forest font-bold" : "bg-surface border-rule text-muted hover:text-ink"
                    }`}
                  >
                    20:00 (Mid)
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToTime(2550)}
                    className={`text-[11px] font-mono px-2 py-1.5 rounded border text-center transition-colors cursor-pointer ${
                      demoState === "unlocked" ? "bg-forest/15 border-forest text-forest font-bold" : "bg-surface border-rule text-muted hover:text-ink"
                    }`}
                  >
                    42:30 (₦200 Cap)
                  </button>
                </div>

                {/* Reset Simulator Link */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-muted">
                  <span>Rewind test: Hit ⟲ 15s to see ₦0 rewatch</span>
                  <button
                    type="button"
                    onClick={resetSimulation}
                    className="underline hover:text-ink cursor-pointer font-medium"
                  >
                    Reset (0:00)
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 📚 COURSE CATALOG WITH CATEGORY FILTER */}
        <section id="courses" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-forest font-mono">
                Curated Catalog
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-1">
                Explore courses by skill
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-forest text-white"
                      : "bg-surface text-muted hover:text-ink border border-rule"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="p-12 text-center ledger-card bg-surface">
              <p className="text-sm text-muted">No courses found matching your search. Try another subject.</p>
            </div>
          )}
        </section>

        {/* 🤝 HOW IT WORKS: FAMILIAR BEFORE CLEVER */}
        <section id="how-it-works" className="ledger-card p-8 sm:p-12 bg-surface space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-forest font-bold">
              Fair learning economics
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              How pay-as-you-learn works
            </h2>
            <p className="text-muted text-sm sm:text-base">
              Traditional courses demand $50 upfront before you even know if the instructor is good. Rheodemy fixes the alignment of value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-forest text-white font-mono font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">Know the price upfront</h3>
              <p className="text-xs text-muted leading-relaxed">
                Every course displays a per-minute rate and a full unlock price. You always know the exact cost before paid playback begins.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-forest text-white font-mono font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">Pay only for active attention</h3>
              <p className="text-xs text-muted leading-relaxed">
                The meter pauses instantly when you pause, walk away, or buffer. Rereading and reviewing completed segments is strictly ₦0.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-forest text-white font-mono font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">Automatic unlock for life</h3>
              <p className="text-xs text-muted leading-relaxed">
                When your cumulative streaming payments reach the creator&apos;s full price, the course is permanently unlocked in your library.
              </p>
            </div>
          </div>
        </section>

        {/* ⚖️ TRANSPARENCY: WHERE DOES THE MONEY GO? */}
        <section className="ledger-card p-8 sm:p-12 bg-surface space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-forest font-bold">
              Ledger transparency
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Where every micro-payment goes
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Every second streamed on Interledger is split automatically on-chain with zero 30-day payout holding periods.
            </p>
          </div>

          {/* Proportional Split Bar */}
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full bg-rule rounded-sm overflow-hidden flex">
              <div className="h-full bg-forest" style={{ width: "75%" }} title="75% to Educator" />
              <div className="h-full bg-[#3B5B7E]" style={{ width: "15%" }} title="15% Platform infrastructure" />
              <div className="h-full bg-sun" style={{ width: "5%" }} title="5% Rating insurance" />
              <div className="h-full bg-clay" style={{ width: "5%" }} title="5% Community refund reserve" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
              <div>
                <span className="font-mono font-bold text-sm text-forest block">75% Teacher</span>
                <span className="text-muted text-[11px]">Streamed directly to verified educator&apos;s wallet.</span>
              </div>
              <div>
                <span className="font-mono font-bold text-sm text-[#3B5B7E] block">15% Operations</span>
                <span className="text-muted text-[11px]">Low-bandwidth edge CDN hosting and verification.</span>
              </div>
              <div>
                <span className="font-mono font-bold text-sm text-ink block">5% Insurance</span>
                <span className="text-muted text-[11px]">Protects teachers against unexpected disconnects.</span>
              </div>
              <div>
                <span className="font-mono font-bold text-sm text-clay block">5% Reserve</span>
                <span className="text-muted text-[11px]">Guarantees one-tap refunds if a session has issues.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 👨‍🏫 FOR INSTRUCTORS (TEACH) */}
        <section id="teach" className="ledger-card p-8 sm:p-12 bg-paper border border-rule space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-forest font-bold">
              For verified educators
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Teach without middlemen. Get paid every second.
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Stop waiting 30 to 60 days for international wire payouts. Interledger streams your earnings into your wallet as students learn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <Link
              href="/become-creator"
              className="btn-forest text-sm py-3 px-6"
            >
              Apply as a creator <ArrowRight className="w-4 h-4 ms-1" />
            </Link>
            <span className="text-xs text-muted">
              Pass our 5-layer verification (ID, Skill proof, Reputation).
            </span>
          </div>
        </section>

      </main>

      {/* 📜 EDITORIAL FOOTER */}
      <footer className="border-t border-rule bg-surface py-12 px-4 sm:px-6 mt-16 text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <BrandLogo size="lg" href="#top" scrollToTop={true} />
            <p className="max-w-xs text-xs text-muted leading-relaxed">
              Open Payments educational marketplace for emerging markets. Built on Interledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-ink">
            <a href="#how-it-works" className="hover:text-forest transition-colors">How it works</a>
            <a href="#courses" className="hover:text-forest transition-colors">Courses</a>
            <a href="#teach" className="hover:text-forest transition-colors">Teach</a>
            <Link href="/onboarding" className="hover:text-forest transition-colors">Start</Link>
            <Link href="/auth?login=true" className="hover:text-forest transition-colors">Sign in</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-rule flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
          <span>© 2026 Rheodemy. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="text-muted">English • Français • Português • Español • العربية • Kiswahili</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
