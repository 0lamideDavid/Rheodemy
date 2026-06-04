"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Play, Star, Clock, Headphones, FileText, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Course {
  id: string;
  title: string;
  description: string;
  pricePerMinute: number;
  currency: string;
  thumbnailUrl: string | null;
  instructor: { firstName: string; lastName: string };
  lessons: { id: string; title: string; durationSec: number }[];
}

const UNSPLASH_FALLBACK = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop';

interface Feedback {
  id: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
}

export default function LearnerDashboard() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted">
            <p>{courses.length === 0 ? 'No courses available yet. Check back soon!' : t.noContent}</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <Link 
              href={`/dashboard/learner/course/${course.id}`} 
              key={course.id} 
              className="bg-[#0A0A0A] rounded-2xl overflow-hidden hover:border-primary/30 transition-colors group cursor-pointer border border-white/5 flex flex-col relative"
            >
              <div className="aspect-video bg-black relative overflow-hidden flex items-center justify-center border-b border-white/5 group-hover:border-primary/20 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />
                <img src={course.thumbnailUrl || UNSPLASH_FALLBACK} alt={course.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-105" />
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col relative z-20">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-base leading-tight">{course.title}</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-mono px-2 py-1 rounded border border-primary/20 whitespace-nowrap">
                    ${course.pricePerMinute.toFixed(2)}/min
                  </span>
                </div>
                <p className="text-sm text-muted line-clamp-2 flex-1">{course.description}</p>
                <div className="flex items-center justify-between text-xs text-muted font-medium pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary animate-pulse" /> 5.0</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div>{course.instructor.firstName} {course.instructor.lastName}</div>
                </div>
              </div>
            </Link>
          ))
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

    </div>
  );
}
