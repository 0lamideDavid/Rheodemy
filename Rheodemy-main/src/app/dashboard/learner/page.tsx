"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Play, Star, Clock, Headphones, FileText, CheckCircle2, MessageSquare, Sparkles, ThumbsUp, Wallet, X, Hammer, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Course {
  id: string;
  title: string;
  description: string;
  pricePerMinute: number;
  currency: string;
  thumbnailUrl: string | null;
  instructor: { firstName: string; lastName: string };
  lessons?: { id: string; title: string; durationSec: number }[];
  _count?: { lessons: number; enrollments: number };
}

const UNSPLASH_FALLBACK = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop';

const PRE_RELEASE_COURSES = [
  {
    id: 'mock-1',
    title: 'Advanced Rust Web Services',
    description: 'Build ultra-fast, memory-safe APIs and microservices using Actix-Web, Axum, and Sqlx.',
    pricePerMinute: 0.15,
    cap: 20.00,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
    instructor: { firstName: 'Dr. Evelyn', lastName: 'Foster (Guest)' },
    rating: 4.8,
    duration: '10h 15m',
    type: 'audio',
    expected: 'September 2026',
    requests: 120,
    requestsGoal: 200,
    escrow: 300.00,
    escrowGoal: 1000.00
  },
  {
    id: 'mock-2',
    title: 'Zero to One: Product Strategy',
    description: 'Learn how to build companies that create new things, going from 0 to 1 rather than 1 to n.',
    pricePerMinute: 0.08,
    cap: 10.00,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop',
    instructor: { firstName: 'Peter', lastName: 'Thiel (Guest)' },
    rating: 4.7,
    duration: '~5h read',
    type: 'ebook',
    expected: 'August 2026',
    requests: 18,
    requestsGoal: 50,
    escrow: 12.50,
    escrowGoal: 50.00
  }
];

interface Feedback {
  id: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
}

export default function LearnerDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreRelease, setSelectedPreRelease] = useState<any>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`);
        const data = await res.json();
        setCourses(data.data || []);
      } catch (err) {
        console.error('[LearnerDashboard] Failed to fetch courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

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

  const getCourseFormatRank = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('handbook')) return 2; // ebook
    if (t.includes('audio') || t.includes('podcast')) return 3; // audio
    return 1; // video
  };

  const filteredCourses = courses.filter(course => {
    // Hide the manually created dummy course and the Y Combinator course
    if (course.title === 'Course' || course.description === 'No description provided.') return false;
    if (course.title.includes('Y Combinator')) return false;
    
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const rank = getCourseFormatRank(course.title);
    const matchesFormat = filter === 'all' || 
      (filter === 'video' && rank === 1) || 
      (filter === 'ebook' && rank === 2) || 
      (filter === 'audio' && rank === 3);

    return matchesSearch && matchesFormat;
  }).sort((a, b) => getCourseFormatRank(a.title) - getCourseFormatRank(b.title));

  const filteredPreRelease = PRE_RELEASE_COURSES.filter(course => 
    (filter === 'all' || filter === course.type) && 
    (course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    const rankA = a.type === 'video' ? 1 : a.type === 'ebook' ? 2 : 3;
    const rankB = b.type === 'video' ? 1 : b.type === 'ebook' ? 2 : 3;
    return rankA - rankB;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.discoverContent}</h1>
          <p className="text-muted mt-2 text-sm max-w-md">
            {t.dashboardDesc}
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors shadow-sm placeholder:text-muted"
          />
        </div>
      </div>

      {/* Format Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            filter === 'all' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-muted hover:text-foreground'
          }`}
        >
          {t.allContent}
        </button>
        <button 
          onClick={() => setFilter('video')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filter === 'video' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-muted hover:text-foreground'
          }`}
        >
          <Play className="w-3 h-3" /> {t.videoCourses}
        </button>
        <button 
          onClick={() => setFilter('ebook')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filter === 'ebook' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-muted hover:text-foreground'
          }`}
        >
          <FileText className="w-3 h-3" /> {t.writtenPDFs}
        </button>
        <button 
          onClick={() => setFilter('audio')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filter === 'audio' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-muted hover:text-foreground'
          }`}
        >
          <Headphones className="w-3 h-3" /> {t.audioPodcasts}
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#0A0A0A] rounded-2xl overflow-hidden border border-white/5 flex flex-col animate-pulse">
              <div className="aspect-video bg-white/5" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : filteredCourses.length === 0 && filteredPreRelease.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted">
            <p>{searchQuery ? 'No courses found matching your search.' : 'No courses available yet. Check back soon!'}</p>
          </div>
        ) : (
          <>
            {filteredCourses.map((course) => {
              return (
              <div 
                onClick={() => router.push(`/dashboard/learner/course/${course.id}`)} 
                key={course.id} 
                className="bg-[#0A0A0A] rounded-2xl overflow-hidden hover:border-primary/30 transition-colors group cursor-pointer border border-white/5 flex flex-col relative"
              >
                <div className="aspect-video bg-black relative overflow-hidden flex items-center justify-center border-b border-white/5 group-hover:border-primary/20 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />
                  
                  {/* Real Course Format Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider px-2.5 py-1.5 rounded-md border border-white/10 flex items-center gap-1.5 uppercase">
                      {course.title.toLowerCase().includes('handbook') ? <FileText className="w-3 h-3" /> : (course.title.toLowerCase().includes('audio') || course.title.toLowerCase().includes('podcast')) ? <Headphones className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {course.title.toLowerCase().includes('handbook') ? 'ebook' : (course.title.toLowerCase().includes('audio') || course.title.toLowerCase().includes('podcast')) ? 'audio' : 'video'}
                    </div>
                  </div>

                  <img src={course.thumbnailUrl || UNSPLASH_FALLBACK} alt={course.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-105" />
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col relative z-20">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-base leading-tight">{course.title}</h3>
                    <span className="bg-primary/10 text-primary text-[10px] font-mono px-2 py-1 rounded border border-primary/20 whitespace-nowrap">
                      ${Number(course.pricePerMinute) >= 0.01 ? Number(course.pricePerMinute).toFixed(2) : Number(course.pricePerMinute).toFixed(4)}/min
                    </span>
                  </div>
                  <p className="text-sm text-muted line-clamp-2 flex-1">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted font-medium pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary animate-pulse" /> 5.0</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {(course.lessons?.length ?? course._count?.lessons ?? 0)} lesson{(course.lessons?.length ?? course._count?.lessons ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                    <div>{course.instructor.firstName} {course.instructor.lastName}</div>
                  </div>
                </div>
              </div>
            )})}

            {filteredPreRelease.map((course) => (
              <div 
                key={course.id} 
                onClick={() => setSelectedPreRelease(course)}
                className="bg-[#0A0A0A] rounded-2xl overflow-hidden hover:border-primary/30 transition-colors group border border-white/5 flex flex-col relative opacity-60 hover:opacity-100 cursor-pointer"
              >
                <div className="aspect-video bg-black relative overflow-hidden flex items-center justify-center border-b border-white/5 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider px-2.5 py-1.5 rounded-md border border-white/10 flex items-center gap-1.5 uppercase">
                      {course.type === 'video' ? <Play className="w-3 h-3" /> : course.type === 'audio' ? <Headphones className="w-3 h-3" /> : <FileText className="w-3 h-3" />} {course.type}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-purple-500/20 backdrop-blur-md text-purple-300 text-[10px] font-bold tracking-wider px-2.5 py-1.5 rounded-md border border-purple-500/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                      <Sparkles className="w-3 h-3" /> Pre-Release
                    </div>
                  </div>

                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-30" />
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col relative z-20">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-base leading-tight">{course.title}</h3>
                    <div className="flex flex-col items-end">
                      <span className="bg-primary/10 text-primary text-[10px] font-mono px-2 py-1 rounded border border-primary/20 whitespace-nowrap">
                        ${course.pricePerMinute.toFixed(2)}/min
                      </span>
                      <span className="text-[9px] text-muted font-mono mt-1">CAP: ${course.cap.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted line-clamp-2 flex-1">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted font-medium pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary" /> {course.rating}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                    </div>
                    <div>{course.instructor.firstName} {course.instructor.lastName}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
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

              {/* Suggestions written text */}
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

      {/* Modal */}
      {selectedPreRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-4xl p-10 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setSelectedPreRelease(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-muted hover:text-white transition-colors" />
            </button>
            
            <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
              <div className="text-primary text-xs font-bold tracking-widest uppercase">Pre-Release Course</div>
              <h2 className="text-4xl font-extrabold tracking-tight">{selectedPreRelease.title}</h2>
              <p className="text-muted text-lg leading-relaxed">{selectedPreRelease.description}</p>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted pt-4">
                <span>By <span className="font-semibold text-white">{selectedPreRelease.instructor.firstName} {selectedPreRelease.instructor.lastName}</span></span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span>Expected: <span className="font-semibold text-white">{selectedPreRelease.expected}</span></span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span>Format: <span className="font-semibold text-white uppercase">{selectedPreRelease.type}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {/* Card 1: Requests */}
              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/5 flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-primary" />
                    Awaiting Release & Funding
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    This course has not been released yet. The creator will publish it once it receives enough requests or pre-funding pledges.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-mono text-muted">
                    <span>Requests: {selectedPreRelease.requests} / {selectedPreRelease.requestsGoal}</span>
                    <span>{Math.round((selectedPreRelease.requests / selectedPreRelease.requestsGoal) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-black rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(selectedPreRelease.requests / selectedPreRelease.requestsGoal) * 100}%` }}
                    />
                  </div>
                  <button 
                    onClick={() => setShowComingSoon(true)}
                    className="w-full py-4 rounded-xl bg-primary text-black font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
                  >
                    <Sparkles className="w-4 h-4" /> Request this Course
                  </button>
                </div>
              </div>

              {/* Card 2: Escrow */}
              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/5 flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-500" />
                    Escrow Pledge Meter
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Pledge microcent transactions from your active wallet. Funds reside in an escrow contract and return to you if publication fails.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-mono text-muted">
                    <span>Escrow: ${selectedPreRelease.escrow.toFixed(2)} / ${selectedPreRelease.escrowGoal.toFixed(2)}</span>
                    <span>{Math.round((selectedPreRelease.escrow / selectedPreRelease.escrowGoal) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-black rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      style={{ width: `${(selectedPreRelease.escrow / selectedPreRelease.escrowGoal) * 100}%` }}
                    />
                  </div>
                  <button 
                    onClick={() => setShowComingSoon(true)}
                    className="w-full py-4 rounded-xl bg-[#2A2A2A] text-white font-bold text-sm hover:bg-[#333333] transition-colors border border-white/5 flex items-center justify-center gap-2 mt-4"
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-purple-500 text-purple-500 text-[10px] font-bold">i</div>
                    Pledge Micro-monetization
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-md p-10 relative shadow-2xl flex flex-col items-center text-center space-y-6">
            
            <div className="w-20 h-20 rounded-full bg-black border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,212,200,0.15)]">
              <Hammer className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight">Coming Soon</h2>
              <p className="text-muted text-sm leading-relaxed max-w-[280px] mx-auto">
                You've caught us building! This feature is actively under development and will be released in the upcoming Phase 2 update.
              </p>
            </div>

            <button 
              onClick={() => setShowComingSoon(false)}
              className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
