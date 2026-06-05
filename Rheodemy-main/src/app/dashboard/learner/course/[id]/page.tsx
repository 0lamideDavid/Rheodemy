"use client";
import MuxPlayer from '@mux/mux-player-react';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Play, Pause, Maximize, Volume2, VolumeX, Settings, 
  CheckCircle2, Activity, Sparkles, Globe2, FileText, Headphones, 
  BookOpen, ChevronLeft, ChevronRight, AlertCircle, ThumbsUp, Wallet, Coins, Loader2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface CourseLesson {
  id: string;
  title: string;
  durationSec: number;
  order: number;
  contentUrl: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  pricePerMinute: number;
  thumbnailUrl: string | null;
  instructor: { firstName: string; lastName: string };
  lessons: CourseLesson[];
  type?: 'video' | 'audio' | 'ebook';
  rate?: number;
  modules?: any[];
}

const mockCourses = {
  "1": {
    title: "Mastering TypeScript in 2026",
    instructor: "Alex Chen",
    type: "video",
    rate: 0.12,
    available: true,
    modules: [
      { id: 1, title: "Introduction to Advanced Types", duration: "12:14" },
      { id: 2, title: "Utility Types Masterclass", duration: "18:45" },
      { id: 3, title: "Generics deep dive", duration: "24:10" }
    ]
  },
  "2": {
    title: "The 10x Designer Handbook",
    instructor: "Sarah Doe",
    type: "ebook",
    rate: 0.05,
    available: true,
    modules: [
      { id: 1, title: "Systems Thinking", duration: "10 mins read" },
      { id: 2, title: "Layout Architecture", duration: "20 mins read" },
      { id: 3, title: "Rapid Prototyping", duration: "15 mins read" }
    ]
  },
  "3": {
    title: "Y Combinator: Startup School (Audio)",
    instructor: "Y Combinator",
    type: "audio",
    rate: 0.02,
    available: true,
    modules: [
      { id: 1, title: "How to Build the Future", duration: "45:20" },
      { id: 2, title: "Finding Product Market Fit", duration: "38:10" },
      { id: 3, title: "Scaling your team", duration: "52:05" }
    ]
  },
  "4": {
    title: "Advanced Rust Web Services",
    instructor: "Dr. Evelyn Foster",
    type: "video",
    rate: 0.15,
    available: false,
    expectedRelease: "July 2026",
    initialRequests: 42,
    targetRequests: 100,
    description: "Build ultra-fast, memory-safe APIs and microservices using Actix-Web, Axum, and Sqlx."
  },
  "5": {
    title: "Zero to One: Product Strategy",
    instructor: "Peter Thiel (Guest)",
    type: "ebook",
    rate: 0.08,
    available: false,
    expectedRelease: "August 2026",
    initialRequests: 18,
    targetRequests: 50,
    description: "Learn how to build companies that create new things, going from 0 to 1 rather than 1 to n."
  }
};

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const id = params?.id as string;

  // ── API Data State ────────────────────────────────────────────────────────
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const activeLesson = course?.lessons?.[currentLessonIndex] || null;
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // ── ILP Session State ─────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const courseType = ((course as any)?.type || 'video') as 'video' | 'audio' | 'ebook';
  const mediaRef = courseType === 'audio' ? audioRef : videoRef;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playerLanguage, setPlayerLanguage] = useState("Original (English)");

  // Ebook Pagination & Slow Reader States
  const [currentPage, setCurrentPage] = useState(0);
  const [visitedPages, setVisitedPages] = useState<number[]>([]);
  const isPageNew = !visitedPages.includes(currentPage);
  
  // Slow Reader: Activity / Idle Tracker (15s inactivity triggers idle)
  const [isReaderIdle, setIsReaderIdle] = useState(false);
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Slow Reader: Cost Capping (track active billable seconds on current page)
  const [pageBilledSeconds, setPageBilledSeconds] = useState<Record<number, number>>({});
  const isPageCostCapped = (pageBilledSeconds[currentPage] || 0) >= 45;

  // Media High-Water Mark State (for skipping/rewinding)
  const [highestTimeReached, setHighestTimeReached] = useState(0);
  const isMediaReplaying = mediaRef.current ? mediaRef.current.currentTime < highestTimeReached - 0.5 : false;

  // Monetization State — driven by real socket ticks
  const [totalStreamed, setTotalStreamed] = useState(0);
  const [creatorShare, setCreatorShare] = useState(0);
  const [platformShare, setPlatformShare] = useState(0);
  const [bursaryShare, setBursaryShare] = useState(0);
  const ratePerSecond = (course?.pricePerMinute ?? 0) / 60;

  // Pre-Release Interactive states
  const [votes, setVotes] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isPledging, setIsPledging] = useState(false);
  const [pledgedAmount, setPledgedAmount] = useState<number>(12.50);
  const [streamedSeconds, setStreamedSeconds] = useState(0);

  // ── Fetch Course Data ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${id}`);
        const data = await res.json();
        setCourse(data.data || null);
      } catch (err) {
        console.error('[CoursePlayer] Failed to fetch course:', err);
      } finally {
        setIsCourseLoading(false);
      }
    };
    fetchCourse();
  }, [id]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const voted = localStorage.getItem(`rheodemy_requested_${id}`);
      if (voted) {
        setHasVoted(true);
        setVotes(prev => prev + 1);
      }
    }
  }, [id]);

  // Simulated Escrow Pledge stream
  useEffect(() => {
    let pledgeInterval: NodeJS.Timeout;
    if (isPledging) {
      pledgeInterval = setInterval(() => {
        setPledgedAmount(prev => prev + 0.05);
      }, 500);
    }
    return () => clearInterval(pledgeInterval);
  }, [isPledging]);

  // Auto-expand the active lesson's module when course loads or lesson changes
  useEffect(() => {
    if (course?.lessons && course.lessons.length > 0) {
      const activeModule = course.lessons[currentLessonIndex]?.title.match(/^(Module\s+\d+):/i)?.[1] || "General Lessons";
      setExpandedModules(prev => prev.includes(activeModule) ? prev : [...prev, activeModule]);
    }
  }, [course, currentLessonIndex]);

  // ── ILP Session Management ────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    if (!token || !course) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: course.id, lessonId: activeLesson?.id || undefined }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error('[CoursePlayer] /api/sessions/start returned error:', data);
        return;
      }
      
      const newSessionId = data.data?.sessionId || data.sessionId;
      if (newSessionId) {
        setSessionId(newSessionId);
        // Connect socket and listen for payment:tick events
        const { io } = await import('socket.io-client');
        const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
          auth: { token },
        });
        
        // Listen for connection, then join the session room!
        socket.on('connect', () => {
          socket.emit('join:session', newSessionId);
        });

        socket.on('payment:tick', (payload: any) => {
          if (payload.sessionId === newSessionId) {
            setTotalStreamed(prev => prev + payload.amountStreamed);
            setCreatorShare(prev => prev + payload.creatorShare);
            setPlatformShare(prev => prev + payload.platformShare);
            setBursaryShare(prev => prev + payload.bursaryShare);
          }
        });
        socketRef.current = socket;
      }
    } catch (err) {
      console.error('[CoursePlayer] Failed to start session:', err);
    }
  }, [token, course, activeLesson]);

  const endSession = useCallback(async () => {
    if (!sessionId || !token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (err) {
      console.error('[CoursePlayer] Failed to end session:', err);
    } finally {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSessionId(null);
    }
  }, [sessionId, token]);

  const selectLesson = async (index: number) => {
    if (index === currentLessonIndex) return;

    // 1. Pause player & end session if active
    if (isPlaying) {
      if (mediaRef.current) {
        mediaRef.current.pause();
      }
      setIsPlaying(false);
      await endSession();
    }

    // 2. Set index
    setCurrentLessonIndex(index);
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Reload media when lesson index changes
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.load();
    }
  }, [currentLessonIndex]);

  // End session on component unmount
  useEffect(() => {
    return () => {
      if (sessionId) endSession();
    };
  }, [sessionId]);

  const resetActivityTimer = () => {
    setIsReaderIdle(false);
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }
    activityTimerRef.current = setTimeout(() => {
      setIsReaderIdle(true);
    }, 15000); // 15 seconds idle timeout
  };

  useEffect(() => {
    if (course?.type === 'ebook' && isPlaying && !isPageCostCapped && isPageNew) {
      // Initialize activity listeners
      resetActivityTimer();
      window.addEventListener('mousemove', resetActivityTimer);
      window.addEventListener('scroll', resetActivityTimer, true);
      window.addEventListener('keydown', resetActivityTimer);
      window.addEventListener('click', resetActivityTimer);

      return () => {
        if (activityTimerRef.current) {
          clearTimeout(activityTimerRef.current);
        }
        window.removeEventListener('mousemove', resetActivityTimer);
        window.removeEventListener('scroll', resetActivityTimer, true);
        window.removeEventListener('keydown', resetActivityTimer);
        window.removeEventListener('click', resetActivityTimer);
      };
    }
  }, [isPlaying, currentPage, isPageCostCapped, isPageNew, course?.type]);

  // Ebook billing increment interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && course?.type === 'ebook' && isPageNew && !isPageCostCapped && !isReaderIdle) {
      interval = setInterval(() => {
        setStreamedSeconds(prev => prev + 1);
        setProgress(prev => Math.min(prev + 0.22, 100)); // fake progress for page
        
        // Track page billed time
        setPageBilledSeconds(prev => ({
          ...prev,
          [currentPage]: (prev[currentPage] || 0) + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, course?.type, currentPage, isPageNew, isPageCostCapped, isReaderIdle]);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(err => console.error(err));
      }
    }
  };

  const togglePlay = async () => {
    if (courseType === 'ebook') {
      if (!isPlaying) {
        await startSession();
      } else {
        await endSession();
      }
      setIsPlaying(!isPlaying);
      return;
    }

    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
        setIsPlaying(false);
        await endSession();
      } else {
        const playPromise = mediaRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(async () => {
            setIsPlaying(true);
            await startSession();
          }).catch(error => {
            console.error("Video playback failed:", error);
            if (mediaRef.current) {
               mediaRef.current.muted = true;
               setIsMuted(true);
               mediaRef.current.play().then(async () => {
                 setIsPlaying(true);
                 await startSession();
               }).catch(e => console.error(e));
            }
          });
        } else {
          setIsPlaying(true);
          await startSession();
        }
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      const current = mediaRef.current.currentTime;
      const duration = mediaRef.current.duration;
      setProgress((current / duration) * 100);
      
      // High-Water Mark Logic: Only charge for new sections
      if (current > highestTimeReached) {
        setHighestTimeReached(current);
      }
    }
  };

  const ebookPages = activeLesson?.contentUrl
    ? activeLesson.contentUrl.split('\\n\\n').map((paragraph: string, i: number) => (
        <p key={i} className="mb-6 leading-relaxed text-[#1A1A1A] text-lg font-serif">{paragraph}</p>
      ))
    : [<p key="0" className="text-muted">No content available.</p>];

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!visitedPages.includes(currentPage)) {
      setVisitedPages([...visitedPages, currentPage]);
    }
    if (currentPage < ebookPages.length - 1) {
      setCurrentPage(prev => prev + 1);
      resetActivityTimer();
    }
  };

  const handlePrevPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!visitedPages.includes(currentPage)) {
      setVisitedPages([...visitedPages, currentPage]);
    }
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      resetActivityTimer();
    }
  };

  // Pre-Release Voting handlers
  const handleVote = () => {
    if (!hasVoted) {
      setVotes(prev => prev + 1);
      setHasVoted(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`rheodemy_requested_${id}`, 'true');
      }
    }
  };

  const togglePledge = () => {
    setIsPledging(!isPledging);
  };

  // Loading state
  if (isCourseLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not found
  if (!course) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-foreground">
        <p className="text-muted text-lg">Course not found.</p>
        <Link href="/dashboard/learner" className="text-primary mt-4 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  // Render Pre-Release request hub if course is not available
  if (false) { // All courses from API are available; keeping structure for pre-release feature
    const progressPercent = Math.min((votes / 100) * 100, 100);
    const pledgePercent = Math.min((pledgedAmount / 50.00) * 100, 100);

    return (
      <div className="min-h-screen bg-[#050505] text-foreground flex flex-col relative z-10 font-sans">
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/learner" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted hover:text-foreground transition-colors" />
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="font-medium text-sm text-foreground truncate max-w-sm">{course?.title}</h1>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {t.preRelease}
          </div>
        </header>

        {/* Main interactive request container */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 max-w-4xl mx-auto w-full">
          <div className="glass w-full p-8 md:p-12 rounded-[2.5rem] border border-white/10 space-y-10 shadow-2xl shadow-black relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Creator info & Header */}
            <div className="space-y-4 text-center">
              <span className="text-xs uppercase tracking-widest text-primary font-bold">{t.preReleaseCourse}</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{course?.title}</h2>
              <p className="text-sm text-muted max-w-lg mx-auto leading-relaxed">{(course as any).description}</p>
              
              <div className="flex items-center justify-center gap-4 text-xs text-muted/80 pt-2">
                <span>By <strong className="text-foreground">{course?.instructor?.firstName} {course?.instructor?.lastName}</strong></span>
                <span>•</span>
                <span>Expected: <strong className="text-foreground">{(course as any).expectedRelease}</strong></span>
                <span>•</span>
                <span>Format: <strong className="text-foreground uppercase">{course?.type}</strong></span>
              </div>
            </div>

            {/* Voting & Funding splits grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              
              {/* Box 1: Upvoting / Demand check */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-primary" />
                    {t.awaitingRelease}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {t.preReleaseDesc}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-muted">
                      <span>Requests: {votes} / {(course as any).targetRequests}</span>
                      <span>{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  <button 
                    onClick={handleVote}
                    disabled={hasVoted}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer
                      ${hasVoted 
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                        : 'bg-primary text-black hover:opacity-90 hover:scale-[1.02]'
                      }
                    `}
                  >
                    {hasVoted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {t.courseRequested}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {t.requestCourse}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Box 2: Escrow pre-funding pledges */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-400 animate-pulse" />
                    {t.pledgedAmount}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Pledge microcent transactions from your active wallet. Funds reside in an escrow contract and return to you if publication fails.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-muted">
                      <span>Escrow: ${pledgedAmount.toFixed(2)} / $50.00</span>
                      <span>{pledgePercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${pledgePercent}%` }} />
                    </div>
                  </div>

                  <button 
                    onClick={togglePledge}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer
                      ${isPledging 
                        ? 'bg-purple-500 text-white animate-pulse' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 text-foreground'
                      }
                    `}
                  >
                    {isPledging ? (
                      <>
                        <Activity className="w-4 h-4 text-white animate-spin" />
                        Pledging Stream active...
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 text-purple-400" />
                        {t.pledgeFund}
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

  // Group lessons by module dynamically
  const modulesMap: Record<string, { id: string; title: string; lessons: (CourseLesson & { index: number })[] }> = {};
  
  (course?.lessons || []).forEach((lesson, idx) => {
    const match = lesson.title.match(/^(Module\s+\d+):\s*(.*)$/i);
    let moduleKey = "General Lessons";
    let lessonTitle = lesson.title;
    
    if (match) {
      moduleKey = match[1];
      lessonTitle = match[2];
    }
    
    if (!modulesMap[moduleKey]) {
      modulesMap[moduleKey] = {
        id: moduleKey,
        title: moduleKey,
        lessons: []
      };
    }
    
    modulesMap[moduleKey].lessons.push({
      ...lesson,
      title: lessonTitle,
      index: idx
    });
  });
  
  const groupedModules = Object.values(modulesMap);

  // Determine active module based on current playing lesson
  const activeModuleId = course?.lessons?.[currentLessonIndex] 
    ? (course.lessons[currentLessonIndex].title.match(/^(Module\s+\d+):/i)?.[1] || "General Lessons")
    : null;

  // Dynamic placeholders (posters) for each lesson
  const lessonPosters = [
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop", // coding laptop
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop", // code editor
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop", // wireframe/ux
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=600&auto=format&fit=crop", // matrix neon code
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop", // cyber security binary
  ];
  const posterUrl = lessonPosters[currentLessonIndex % lessonPosters.length];

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex flex-col relative z-10 font-sans">
      
      {/* Cinematic Top Bar */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/learner" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted hover:text-foreground transition-colors" />
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="font-medium text-sm text-foreground truncate max-w-sm">{course.title}</h1>
        </div>

        {/* Unobtrusive Monetization Tracker */}
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(0,212,200,0.05)]">
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying && !isReaderIdle ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(0,212,200,0.8)]' : 'bg-muted'}`} />
          <span className="text-xs font-mono text-primary flex items-center gap-1.5">
            Streaming ILP <span className="opacity-50">|</span> ${totalStreamed.toFixed(4)}
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <div ref={containerRef} className="w-full aspect-video bg-black relative group cursor-pointer" onClick={togglePlay}>
            
            {courseType === 'video' && (
              <MuxPlayer 
                ref={videoRef as any}
                key={activeLesson?.id || 'default-vid'}
                className="w-full h-full object-cover"
                playbackId={activeLesson?.contentUrl || 'jy02Y501NLjgcgnNQbhiDQrbTtNZqIpdSYpT02KpPLzHzs'}
                envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
                poster={posterUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                streamType="on-demand"
              />
            )}

            {courseType === 'audio' && (
              <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center relative">
                <audio 
                  ref={audioRef}
                  key={activeLesson?.id || 'default-aud'}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={activeLesson?.contentUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} type="audio/mpeg" />
                </audio>
                <div className={`w-32 h-32 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center mb-4 transition-transform duration-1000 ${isPlaying ? 'scale-110 shadow-[0_0_50px_rgba(0,212,200,0.2)]' : 'scale-100'}`}>
                  <Headphones className={`w-12 h-12 text-primary ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1.5 bg-primary rounded-full transition-all duration-300 ${isPlaying ? 'animate-bounce' : 'h-1'}`} style={{ height: isPlaying ? `${Math.random() * 24 + 8}px` : '4px', animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
            )}

            {courseType === 'ebook' && (
              <div className="w-full h-full bg-[#FAFAFA] text-[#1A1A1A] p-8 sm:p-12 overflow-y-auto relative cursor-auto" onClick={(e) => e.stopPropagation()}>
                
                {/* Paused Overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-[#FAFAFA]/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <button onClick={togglePlay} className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-2xl cursor-pointer">
                       <BookOpen className="w-6 h-6" /> {t.startReading}
                    </button>
                  </div>
                )}

                {/* Floating State Indicators (Slow Reader Protection Alert Panels) */}
                {isPlaying && (
                  <div className="absolute bottom-6 right-8 z-30 flex flex-col gap-2 items-end">
                    
                    {/* 1. Idle Notice */}
                    {isReaderIdle && (
                      <div className="bg-yellow-500 text-black px-4 py-2.5 rounded-xl border border-yellow-600/20 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <AlertCircle className="w-4 h-4 text-black animate-bounce" />
                        <span className="text-sm font-semibold">{t.idlePaused}</span>
                      </div>
                    )}

                    {/* 2. Capped Notice */}
                    {isPageCostCapped && (
                      <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl border border-emerald-600/20 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span className="text-sm font-semibold">{t.paymentCapped}</span>
                      </div>
                    )}

                    {/* 3. Re-reading Notice */}
                    {!isPageNew && !isPageCostCapped && (
                      <div className="bg-white text-black px-4 py-2 rounded-full border border-black/10 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">{t.rereadingFree}</span>
                      </div>
                    )}

                    <button onClick={togglePlay} className="bg-black/90 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-black transition-colors shadow-xl cursor-pointer">
                      <Pause className="w-4 h-4 fill-current" /> {t.pauseReading}
                    </button>
                  </div>
                )}

                <div className={`max-w-2xl mx-auto flex flex-col min-h-full pb-24 transition-opacity duration-500 ${!isPlaying ? 'opacity-30 blur-[2px]' : 'opacity-100'}`}>
                  {/* Page Content */}
                  <div className="flex-1">
                    {ebookPages[currentPage]}
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="pt-12 mt-12 border-t border-black/10 flex items-center justify-between">
                    <button 
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-black/60 hover:text-black hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> {t.back}
                    </button>
                    <span className="text-sm font-mono text-black/40">Page {currentPage + 1} of {ebookPages.length}</span>
                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage === ebookPages.length - 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-black/60 hover:text-black hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      {t.continue} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Large Center Play Button */}
            {!isPlaying && courseType !== 'ebook' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="pointer-events-auto w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(0,212,200,0.3)] transition-transform hover:scale-110 cursor-pointer"
                >
                  <Play className="w-8 h-8 ml-1" />
                </button>
              </div>
            )}
            
            {/* Custom Premium Controls (Hidden for Ebooks) */}
            {courseType !== 'ebook' && (
              <div 
                className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 pt-24 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                onClick={(e) => e.stopPropagation()}
              >
                
                {/* Timeline */}
                <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 cursor-pointer relative group/timeline hover:h-2 transition-all">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary rounded-full pointer-events-none transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,212,200,0.5)] opacity-0 group-hover/timeline:opacity-100 transition-opacity" />
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={isNaN(progress) ? 0 : progress}
                    onChange={(e) => {
                      const percentage = Number(e.target.value) / 100;
                      if (mediaRef.current) {
                        mediaRef.current.currentTime = percentage * mediaRef.current.duration;
                        setProgress(Number(e.target.value));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Controls Container */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button onClick={togglePlay} className="text-white hover:text-primary transition-colors z-10 cursor-pointer">
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                    </button>
                    <button onClick={toggleMute} className="text-white hover:text-primary transition-colors z-10 cursor-pointer">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <span className="text-xs font-mono text-white/70 flex items-center gap-3">
                      <span>{Math.floor((mediaRef.current?.currentTime || 0) / 60)}:{(Math.floor(mediaRef.current?.currentTime || 0) % 60).toString().padStart(2, '0')}</span>
                      
                      {/* Media Re-listening Indicator */}
                      {isMediaReplaying && (
                        <span className="bg-white/10 text-white px-2 py-1 rounded-md text-[10px] font-sans font-semibold tracking-wider flex items-center gap-1.5 animate-in fade-in">
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                          Re-watching (Free)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); alert('Settings coming in Phase 2!'); }} 
                      className="text-white hover:text-primary transition-colors cursor-pointer"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={toggleFullscreen} 
                      className="text-white hover:text-primary transition-colors cursor-pointer"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Under Video Content */}
          <div className="p-8 max-w-5xl mx-auto w-full space-y-12">
            
            {/* Course Title & Instructor */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">{activeLesson?.title || course?.title}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4 text-sm text-muted">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">{course?.instructor?.firstName?.[0]}</div>
                  <span className="text-foreground font-medium">{course?.instructor?.firstName} {course?.instructor?.lastName}</span>
                  <span>•</span>
                  <span>Rate: ${course?.rate || course?.pricePerMinute}/{t.min}</span>
                </div>
                
                {/* AI Language Selector */}
                <div className="flex items-center gap-3">
                  {playerLanguage !== "Original (English)" && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#c084fc] bg-[#c084fc]/10 px-2.5 py-1 rounded-full border border-[#c084fc]/20 animate-in fade-in zoom-in duration-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t.aiTranslated}
                    </span>
                  )}
                  <div className="relative">
                    <Globe2 className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select 
                      value={playerLanguage}
                      onChange={(e) => setPlayerLanguage(e.target.value)}
                      className="pl-9 pr-8 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer hover:bg-white/5"
                    >
                      <option value="Original (English)">English (Original)</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Escrow Visualization */}
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/[0.02] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5">
                 <Activity className="w-32 h-32 text-primary" />
               </div>
               
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                   <h3 className="text-xs uppercase tracking-widest font-semibold text-primary flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,212,200,0.8)]" />
                     {t.liveEscrow}
                   </h3>
                   <span className="font-mono text-sm text-foreground">{t.totalStreamed}: ${totalStreamed.toFixed(4)}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 80% Creator */}
                    <div className="p-4 rounded-lg bg-[#0A0A0A] border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors">
                      <p className="text-[10px] uppercase tracking-wider text-muted mb-1">{t.creatorShare}</p>
                      <p className="font-mono text-lg text-foreground relative z-10">${creatorShare.toFixed(4)}</p>
                    </div>
                    {/* 15% Platform */}
                    <div className="p-4 rounded-lg bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors">
                      <p className="text-[10px] uppercase tracking-wider text-muted mb-1">{t.platformShare}</p>
                      <p className="font-mono text-lg text-foreground">${platformShare.toFixed(4)}</p>
                    </div>
                    {/* 5% NGO */}
                    <div className="p-4 rounded-lg bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors">
                      <p className="text-[10px] uppercase tracking-wider text-muted mb-1">{t.bursaryShare}</p>
                      <p className="font-mono text-lg text-foreground">${bursaryShare.toFixed(4)}</p>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>

        {/* Sidebar Modules */}
        <div className="w-full lg:w-96 border-l border-white/5 bg-[#0A0A0A] flex flex-col h-[calc(100vh-64px)] lg:sticky lg:top-16">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">{t.courseModules}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {groupedModules.map((module) => {
              const isModuleActive = module.id === activeModuleId;
              const isModuleExpanded = expandedModules.includes(module.id);
              
              return (
                <div key={module.id} className="border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden transition-all duration-300">
                  {/* Module Header */}
                  <div 
                    onClick={() => toggleModule(module.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isModuleActive 
                        ? 'bg-primary/5 text-primary font-medium' 
                        : 'text-foreground hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className={`w-4 h-4 ${isModuleActive ? 'text-primary' : 'text-muted'}`} />
                      <span className="font-semibold text-sm">{module.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isModuleExpanded ? 'rotate-90 text-primary' : 'text-muted'}`} />
                  </div>
                  
                  {/* Module Lessons Dropdown */}
                  {isModuleExpanded && (
                    <div className="border-t border-white/5 p-2 bg-[#050505] space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {module.lessons.map((lesson) => {
                        const isLessonActive = lesson.index === currentLessonIndex;
                        
                        return (
                          <div 
                            key={lesson.id} 
                            onClick={() => selectLesson(lesson.index)}
                            className={`p-3 rounded-lg flex gap-3 cursor-pointer group transition-colors ${
                              isLessonActive 
                                ? 'bg-primary/10 border border-primary/20' 
                                : 'border border-transparent hover:border-white/5 hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isLessonActive ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-white/20 group-hover:border-white/40 flex items-center justify-center text-[7px] text-muted">
                                  {lesson.order}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-xs font-medium truncate ${isLessonActive ? 'text-primary' : 'text-muted group-hover:text-white transition-colors'}`}>
                                {lesson.title}
                              </h4>
                              <p className="text-[10px] text-muted font-mono mt-0.5">
                                {Math.floor(lesson.durationSec / 60)}:{(lesson.durationSec % 60).toString().padStart(2, '0')} {isLessonActive ? '• Playing' : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
