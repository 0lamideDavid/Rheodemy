"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Play,
  ChevronRight,
  BarChart3,
  Clock,
  DollarSign,
  FileText,
  Star,
  MessageSquare,
  Headphones,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type Course,
  type FeedbackItem,
  type InstructorSession,
  type InstructorStats,
} from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { formatUSD } from "@/lib/currency";

interface Feedback {
  id: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
}

const EMPTY_STATS: InstructorStats = {
  totalRevenue: 0,
  activeLearners: 0,
  totalMinutesStreamed: 0,
  totalCourses: 0,
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function mediumOf(course: Course): "video" | "audio" | "ebook" {
  const type = course.lessons?.[0]?.contentType;
  if (type === "AUDIO") return "audio";
  if (type === "EBOOK") return "ebook";
  return "video";
}

export default function CreatorDashboard() {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [stats, setStats] = useState<InstructorStats>(EMPTY_STATS);
  const [courses, setCourses] = useState<Course[]>([]);
  const [history, setHistory] = useState<InstructorSession[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [liveEarnings, setLiveEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback form states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("monetization");
  const [comment, setComment] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const [nextStats, nextCourses, nextHistory, nextFeedback] =
        await Promise.all([
          api.courses.instructorStats(),
          api.courses.mine(),
          api.sessions.instructorHistory(10),
          api.feedback.recent(10).catch(() => [] as FeedbackItem[]),
        ]);
      setStats(nextStats);
      setCourses(nextCourses);
      setHistory(nextHistory);
      setFeedbacks(
        nextFeedback.map((f) => ({
          id: f.id,
          rating: f.rating,
          category: f.category,
          comment: f.comment,
          timestamp: relativeTime(f.createdAt),
        }))
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load creator data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    if (!socket) return;

    const handleTick = (payload: {
      creatorEarnings?: number;
      state?: string;
    }) => {
      if (payload.state === "paying" && payload.creatorEarnings) {
        setLiveEarnings((prev) => prev + payload.creatorEarnings!);
      }
    };
    const handleEnded = () => {
      setLiveEarnings(0);
      void refresh();
    };
    const handleWallet = () => void refresh();

    socket.on("payment:tick", handleTick);
    socket.on("session:ended", handleEnded);
    socket.on("wallet:updated", handleWallet);

    return () => {
      socket.off("payment:tick", handleTick);
      socket.off("session:ended", handleEnded);
      socket.off("wallet:updated", handleWallet);
    };
  }, [token, refresh]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await api.feedback.submit({
        rating,
        category,
        comment,
      });
      setFeedbacks((prev) => [
        {
          id: created.id,
          rating: created.rating,
          category: created.category,
          comment: created.comment,
          timestamp: "just now",
        },
        ...prev,
      ]);
      setRating(0);
      setComment("");
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit feedback"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRevenue = stats.totalRevenue + liveEarnings;

  const earningsByCourse = useMemo(() => {
    const map = new Map<string, number>();
    for (const session of history) {
      map.set(
        session.courseTitle,
        (map.get(session.courseTitle) ?? 0) + session.creatorEarnings
      );
    }
    return map;
  }, [history]);

  const minutesDisplay =
    stats.totalMinutesStreamed >= 60
      ? `${(stats.totalMinutesStreamed / 60).toFixed(1)}h`
      : `${stats.totalMinutesStreamed}m`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {t.overview}
          </h1>
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

      {error && (
        <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-xs text-red-300">
          {error}
        </div>
      )}

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
              <span className="text-xs uppercase tracking-wider font-semibold">
                {t.totalRevenue}
              </span>
            </div>
            <div>
              <p className="text-5xl font-mono font-light tracking-tight text-foreground">
                {isLoading ? "…" : formatUSD(totalRevenue)}
              </p>
              <p className="text-xs text-muted mt-3 flex items-center gap-2">
                <span className="text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                  55%
                </span>
                creator share of every streamed second
              </p>
            </div>
          </div>
        </div>

        {/* Active Learners */}
        <div className="p-6 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors flex flex-col justify-between relative">
          <div className="flex items-center gap-2 text-muted/60 mb-4">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">
              {t.activeLearners}
            </span>
          </div>
          <div>
            <p className="text-5xl font-mono font-light tracking-tight text-foreground">
              {isLoading ? "…" : stats.activeLearners}
            </p>
            <p className="text-xs text-muted mt-3 flex items-center gap-2">
              <span className="text-foreground/70">
                {stats.totalCourses} course
                {stats.totalCourses === 1 ? "" : "s"}
              </span>{" "}
              published
            </p>
          </div>
        </div>

        {/* Active Engagement */}
        <div className="p-6 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors flex flex-col justify-between relative">
          <div className="flex items-center gap-2 text-muted/60 mb-4">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">
              {t.activeEngagement}
            </span>
          </div>
          <div>
            <p className="text-5xl font-mono font-light tracking-tight text-foreground">
              {isLoading ? "…" : minutesDisplay}
            </p>
            <p className="text-xs text-muted mt-3 flex items-center gap-2">
              <span className="text-muted">{t.engagementDesc}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
        <div className="absolute -top-5 left-0 w-full h-[1px] bg-gradient-to-r from-white/5 via-white/10 to-transparent" />

        {/* Content List */}
        <div className="lg:col-span-2 space-y-6 pt-2">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              {t.publishedContent}
            </h2>
            <Link
              href="/dashboard/creator/upload"
              className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors"
            >
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted py-8">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your catalog…
              </div>
            ) : courses.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-white/10 text-sm text-muted">
                No published courses yet.{" "}
                <Link
                  href="/dashboard/creator/upload"
                  className="text-primary hover:underline"
                >
                  Publish your first course
                </Link>
                .
              </div>
            ) : (
              courses.map((course, index) => {
                const medium = mediumOf(course);
                const earned = earningsByCourse.get(course.title) ?? 0;
                return (
                  <div key={course.id}>
                    <div className="flex items-center gap-6 p-4 rounded-xl border border-transparent hover:border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group cursor-pointer relative overflow-hidden">
                      <div className="w-16 h-16 bg-[#0c0c0c] rounded-lg relative flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-colors flex-shrink-0">
                        {medium === "video" ? (
                          <Play className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                        ) : medium === "audio" ? (
                          <Headphones className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                        ) : (
                          <FileText className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                        )}
                        <div className="absolute -top-1.5 -right-1.5 text-[8px] font-bold font-mono bg-primary/20 text-primary px-1 rounded backdrop-blur-sm uppercase">
                          {medium === "video"
                            ? "VID"
                            : medium === "audio"
                              ? "AUD"
                              : "EBOOK"}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 relative z-10">
                        <h3 className="font-semibold text-base leading-tight text-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {course._count?.lessons ?? 0} lessons
                          </span>
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3 text-primary" />
                            {formatUSD(earned)} {t.earned}
                          </span>
                          <span className="font-mono text-primary/70">
                            {formatUSD(course.pricePerMinute)}/min
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < courses.length - 1 && (
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent my-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="space-y-6 pt-2">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              {t.activityFeed}
            </h2>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-primary/50 before:via-white/10 before:to-transparent pt-2">
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading activity…
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-muted">
                No completed sessions yet. Learner payments will appear here in
                real time.
              </p>
            ) : (
              history.map((session) => (
                <div
                  key={session.id}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                >
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-primary/30 bg-[#0A0A0A] text-primary absolute left-0 md:left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(0,212,200,0.3)]">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] pl-4 md:pl-0 md:pr-4 ml-auto md:ml-0 text-sm">
                    <p className="text-muted leading-relaxed">
                      <span className="font-medium text-foreground">
                        {session.studentName}
                      </span>{" "}
                      finished{" "}
                      <span className="font-medium text-foreground">
                        {session.courseTitle}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        +{formatUSD(session.creatorEarnings)}
                      </span>
                      <span className="text-xs text-muted/50">
                        {relativeTime(session.endedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
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
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {t.ratingLabel}
                </label>
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
                            ? "text-primary fill-primary filter drop-shadow-[0_0_8px_rgba(0,212,200,0.4)]"
                            : "text-muted/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {t.categoryLabel}
                  </label>
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
                disabled={rating === 0 || isSubmitting}
                className="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer text-sm flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.submitFeedback}
              </button>
            </form>
          </div>

          {/* Feedback ledger log list */}
          <div className="flex flex-col h-full space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
              {t.recentFeedback}
            </h4>
            <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3 scrollbar-thin">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-sm animate-in fade-in"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">
                      {t[f.category as keyof typeof t] || f.category}
                    </span>
                    <span className="text-muted/60">{f.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < f.rating
                            ? "text-primary fill-primary"
                            : "text-muted/20"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed font-sans">
                    {f.comment}
                  </p>
                </div>
              ))}

              {feedbacks.length === 0 && (
                <div className="h-full flex items-center justify-center text-center text-muted/50 py-12">
                  <p>No feedback logged yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
