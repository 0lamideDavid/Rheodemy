"use client";

import { useState, useEffect } from 'react';
import { Plus, Play, ChevronRight, BarChart3, Clock, DollarSign, FileText, Star, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface InstructorCourse {
  id: string;
  title: string;
  pricePerMinute: number;
  lessons?: { id: string; durationSec: number }[];
  _count?: { lessons: number; enrollments: number };
  totalEarnings?: number;
  totalMinutes?: number;
}

interface ActiveSession {
  sessionId: string;
  studentName: string;
  courseTitle: string;
  pricePerMinute: number;
  earnings: number;
}

interface Feedback {
  id: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
}

export default function CreatorDashboard() {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/me/instructor`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        setCourses(data.data || []);
      } catch (err) {
        console.error('[CreatorDashboard] Failed to fetch courses:', err);
      } finally {
        setIsCoursesLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchBalance = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setWalletBalance(data.data?.balance || 0);
      } catch (err) {
        console.error("Failed to fetch wallet balance:", err);
      }
    };
    fetchBalance();
  }, [token]);

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    if (!token) return;

    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token },
      });

      socket.on('session:started', (payload: any) => {
        // Find course to get pricePerMinute
        setCourses(currentCourses => {
          const course = currentCourses.find(c => c.id === payload.courseId);
          const price = course?.pricePerMinute || 0;
          
          setActiveSessions(prev => [
            ...prev.filter(s => s.sessionId !== payload.sessionId),
            {
              sessionId: payload.sessionId,
              studentName: payload.studentName || 'Anonymous Student',
              courseTitle: payload.courseTitle || 'Unknown Course',
              pricePerMinute: price,
              earnings: 0
            }
          ]);
          return currentCourses;
        });
      });

      socket.on('session:ended', (payload: any) => {
        setActiveSessions(prev => prev.filter(s => s.sessionId !== payload.sessionId));
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSessions(prev => prev.map(session => ({
        ...session,
        earnings: session.earnings + (session.pricePerMinute / 60)
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalLessons = courses.reduce((sum, c) => sum + (c.lessons?.length ?? c._count?.lessons ?? 0), 0);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("monetization");
  const [comment, setComment] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rheodemy_feedbacks');
      if (saved) {
        setFeedbacks(JSON.parse(saved));
      }
    }
  }, []);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    const newFeedback: Feedback = {
      id: Math.random().toString(),
      rating,
      category,
      comment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rheodemy_feedbacks', JSON.stringify(updated));
    }
    
    // reset
    setRating(0);
    setComment("");
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{t.overview}</h1>
          <p className="text-muted mt-2 text-sm max-w-xl leading-relaxed">
            {t.overviewDesc}
          </p>
        </div>
        <Link 
          href="/dashboard/creator/upload" 
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {t.newCourse}
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Earnings Card */}
        <div className="p-6 rounded-xl border border-primary/20 bg-primary/[0.02] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
             <div className="w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted mb-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,212,200,0.8)] animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-semibold">{t.totalRevenue}</span>
            </div>
            <div>
              <p className="text-5xl font-mono font-light tracking-tight text-foreground">
                {walletBalance === null ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : `$${walletBalance.toFixed(2)}`}
              </p>
              <p className="text-xs text-muted mt-3 flex items-center gap-2">
                <span className="text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">80%</span> net creator share
              </p>
            </div>
          </div>
        </div>
        
        {/* Active Learners */}
        <div className="p-6 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors flex flex-col justify-between relative">
          <div className="flex items-center gap-2 text-muted/60 mb-4">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">{t.activeLearners}</span>
          </div>
          <div>
            <p className="text-5xl font-mono font-light tracking-tight text-foreground">{totalLessons}</p>
            <p className="text-xs text-muted mt-3 flex items-center gap-2">
              <span className="text-foreground/70">total lessons</span> across all courses
            </p>
          </div>
        </div>

        {/* Active Engagement */}
        <div className="p-6 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors flex flex-col justify-between relative">
          <div className="flex items-center gap-2 text-muted/60 mb-4">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">{t.activeEngagement}</span>
          </div>
          <div>
            <p className="text-5xl font-mono font-light tracking-tight text-foreground">12.4<span className="text-muted/40">k</span></p>
            <p className="text-xs text-muted mt-3 flex items-center gap-2">
              <span className="text-muted">{t.engagementDesc}</span>
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
        
        {/* Subtle separator line above */}
        <div className="absolute -top-5 left-0 w-full h-[1px] bg-gradient-to-r from-white/5 via-white/10 to-transparent" />

        {/* Content List */}
        <div className="lg:col-span-2 space-y-6 pt-2">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t.publishedContent}</h2>
            <Link href="/coming-soon" className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors">
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {isCoursesLoading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 p-4 rounded-xl bg-white/[0.01] border border-white/5 animate-pulse">
                  <div className="w-16 h-16 bg-white/5 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : courses.length === 0 ? (
              <div className="py-8 text-center text-muted text-sm">No courses published yet.</div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="flex items-center gap-6 p-4 rounded-xl border border-transparent hover:border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group cursor-pointer relative overflow-hidden">
                  <div className="w-16 h-16 bg-[#0c0c0c] rounded-lg relative flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-colors flex-shrink-0">
                    <Play className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                    <div className="absolute -top-1.5 -right-1.5 text-[8px] font-bold font-mono bg-primary/20 text-primary px-1 rounded backdrop-blur-sm">VID</div>
                  </div>
                  <div className="flex-1 space-y-2 relative z-10">
                    <h3 className="font-semibold text-base leading-tight text-foreground group-hover:text-primary transition-colors">{course.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {(course.lessons?.length ?? course._count?.lessons ?? 0)} lessons</span>
                      <span className="flex items-center gap-1.5"><DollarSign className="w-3 h-3 text-primary" /> ${Number(course.pricePerMinute) >= 0.01 ? Number(course.pricePerMinute).toFixed(2) : Number(course.pricePerMinute).toFixed(4)}/min</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="space-y-6 pt-2">
          <div className="border-b border-white/5 pb-4 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Live Now</h2>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
          
          <div className="space-y-4 pt-2">
            {activeSessions.length === 0 ? (
              <div className="py-8 text-center text-muted text-sm border border-white/5 rounded-xl bg-white/[0.01]">
                No students streaming right now
              </div>
            ) : (
              activeSessions.map(session => (
                <div key={session.sessionId} className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{session.studentName}</p>
                      <p className="text-xs text-muted">is watching <span className="text-primary">{session.courseTitle}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-emerald-400">
                        +${(session.earnings * 0.8).toFixed(4)}
                      </p>
                      <p className="text-[10px] text-muted">creator share</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Local Interactive Feedback Section */}
      <section className="pt-8 border-t border-white/5">
        <div className="glass p-8 rounded-3xl border border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Feedback Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {t.feedbackTitle}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t.feedbackDesc}
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              {/* Star selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">{t.ratingLabel}</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl transition-transform hover:scale-115 focus:outline-none cursor-pointer"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? 'text-primary fill-primary filter drop-shadow-[0_0_8px_rgba(0,212,200,0.4)]'
                            : 'text-muted/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">{t.categoryLabel}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="monetization">{t.monetization}</option>
                    <option value="translations">{t.translations}</option>
                    <option value="uiux">{t.uiux}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>
              </div>

              {/* Suggestions text area */}
              <div className="space-y-1">
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t.feedbackPlaceholder}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted"
                />
              </div>

              {feedbackSuccess && (
                <div className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                  {t.feedbackSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={rating === 0}
                className="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer text-sm"
              >
                {t.submitFeedback}
              </button>
            </form>
          </div>

          {/* Feedback ledger log list */}
          <div className="flex flex-col h-full space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">{t.recentFeedback}</h4>
            <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3 scrollbar-thin">
              {feedbacks.map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-sm animate-in fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">{t[f.category as keyof typeof t] || f.category}</span>
                    <span className="text-muted/60">{f.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < f.rating ? 'text-primary fill-primary' : 'text-muted/20'}`} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed font-sans">{f.comment}</p>
                </div>
              ))}

              {feedbacks.length === 0 && (
                <div className="h-full flex items-center justify-center text-center text-muted/50 py-12">
                  <p>No feedback logged yet in this local session.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
