"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Wallet, BookOpen, Layers, RefreshCw, PlayCircle, Clock, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type Course } from "@/lib/api";
import { formatUSD } from "@/lib/currency";
import { COURSE_CATEGORIES, courseCategory, toCourseCard } from "@/lib/courseView";
import { CourseCard } from "@/components/ui/CourseCard";
import { LaurieAdvisor } from "@/components/ui/LaurieAdvisor";

const FORMATS = ["All", "Video", "Audio", "Ebook"] as const;

// Placeholder slots for in-progress courses – populate with real API data when ready
const DEMO_IN_PROGRESS: {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  rate: string;
  medium: "video" | "audio" | "ebook";
  minutesSpent: number;
}[] = [];

export default function LearnerDashboard() {
  const { displayName } = useAuth();
  const [laurieOpen, setLaurieOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<(typeof COURSE_CATEGORIES)[number]>("All");
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("All");

  const loadCourses = () => {
    setIsLoading(true);
    setLoadError(null);
    api.courses
      .list()
      .then(setCourses)
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCourses();
    api.wallet
      .balance()
      .then((data) => setBalance(data.learnerBalance))
      .catch(() => setBalanceError(true));
  }, []);

  const visibleCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return courses.filter((course) => {
      const card = toCourseCard(course);
      const matchesCategory = category === "All" || courseCategory(course) === category;
      const matchesFormat =
        format === "All" || card.medium === format.toLowerCase();
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        `${course.instructor?.firstName ?? ""} ${course.instructor?.lastName ?? ""}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesFormat && matchesQuery;
    });
  }, [courses, category, format, searchQuery]);

  const firstName = displayName.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-forest">
            Learner dashboard
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
            Welcome back, {firstName}.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Browse the live Rheodemy catalog. Every course shows its real USD
            per-minute rate before you start a paid session.
          </p>
        </div>

        <Link
          href="/dashboard/wallet"
          className="ledger-card flex min-w-[220px] items-center justify-between gap-4 bg-surface px-5 py-4 transition-colors hover:border-muted"
        >
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Wallet className="h-3.5 w-3.5 text-forest" />
              Wallet balance
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-ink">
              {balanceError
                ? "—"
                : balance === null
                ? "…"
                : formatUSD(balance)}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card flex items-center gap-3 bg-surface p-4">
          <div className="rounded-lg bg-forest/10 p-2 text-forest">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">Published courses</div>
            <div className="font-mono text-lg font-bold tabular-nums text-ink">
              {isLoading ? "…" : courses.length}
            </div>
          </div>
        </div>
        <div className="ledger-card flex items-center gap-3 bg-surface p-4">
          <div className="rounded-lg bg-forest/10 p-2 text-forest">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">Subjects</div>
            <div className="font-mono text-lg font-bold tabular-nums text-ink">
              {new Set(courses.map(courseCategory)).size}
            </div>
          </div>
        </div>
        <div className="ledger-card flex items-center gap-3 bg-surface p-4">
          <div className="rounded-lg bg-forest/10 p-2 text-forest">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">Spendable balance</div>
            <div className="font-mono text-lg font-bold tabular-nums text-ink">
              {balanceError ? "Unavailable" : balance === null ? "…" : formatUSD(balance)}
            </div>
          </div>
        </div>
      </section>

      <section id="catalog-section" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search courses, skills, or educators..."
              className="w-full rounded-lg border border-rule bg-surface ps-9 pe-3 py-3 text-sm text-ink placeholder:text-muted focus:border-muted focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FORMATS.map((item) => (
              <button
                key={item}
                onClick={() => setFormat(item)}
                className={`rounded-[6px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                  format === item
                    ? "border-forest bg-forest text-white"
                    : "border-rule bg-surface text-muted hover:text-ink"
                }`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={loadCourses}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-rule bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {COURSE_CATEGORIES.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-[6px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === item
                  ? "border-forest bg-forest text-white"
                  : "border-rule bg-surface text-muted hover:text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="ledger-card animate-pulse overflow-hidden">
                <div className="aspect-[16/10] bg-rule/40" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-2/3 rounded bg-rule/40" />
                  <div className="h-4 w-full rounded bg-rule/40" />
                  <div className="h-3 w-1/2 rounded bg-rule/40" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="ledger-card space-y-3 bg-surface p-8 text-center">
            <p className="text-sm font-semibold text-clay">We could not load the catalog.</p>
            <p className="text-xs text-muted">{loadError}</p>
            <button onClick={loadCourses} className="btn-forest text-xs">
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseCard key={course.id} course={toCourseCard(course)} />
            ))}
          </div>
        )}

        {!isLoading && !loadError && visibleCourses.length === 0 && (
          <div className="ledger-card bg-surface p-12 text-center">
            <p className="text-sm text-muted">
              No courses match your filters right now.
            </p>
          </div>
        )}
      </section>

      {/* ── CONTINUE WHERE YOU LEFT OFF ─────────────────────────────── */}
      <section className="ledger-card bg-surface px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-forest/10 p-2 text-forest shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-forest font-mono">Continue where you left off</p>
            <p className="text-sm text-muted mt-0.5">
              Your last session will appear here — just hit Resume to pick up right where you stopped.
            </p>
          </div>
        </div>
        <button
          disabled
          className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-rule bg-rule/30 px-4 py-2 text-xs font-semibold text-muted cursor-not-allowed"
        >
          <PlayCircle className="h-4 w-4" />
          No session yet
        </button>
      </section>

      {/* ── COURSES IN PROGRESS ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-forest">
              Continue learning
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink mt-0.5">
              Courses in progress
            </h2>
          </div>
        </div>

        {DEMO_IN_PROGRESS.length === 0 ? (
          <div className="ledger-card bg-surface p-8 flex flex-col items-center justify-center gap-3 text-center border-dashed">
            <div className="rounded-full bg-forest/10 p-3 text-forest">
              <PlayCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-ink">No courses started yet</p>
            <p className="text-xs text-muted max-w-xs">
              Once you begin a session, your in-progress courses will appear here so you can pick up right where you left off.
            </p>
            <a
              href="#courses"
              className="btn-forest text-xs mt-1"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Browse catalog
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_IN_PROGRESS.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/learner/course/${item.id}`}
                className="ledger-card bg-surface p-4 flex flex-col gap-3 hover:border-muted transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
                      {item.medium}
                    </p>
                    <h3 className="text-sm font-bold text-ink mt-0.5 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-muted">{item.instructor}</p>
                  </div>
                  <PlayCircle className="h-5 w-5 text-forest shrink-0 mt-0.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.minutesSpent} min spent</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-rule">
                    <div
                      className="h-1.5 rounded-full bg-forest transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-rule">
                  <span className="text-xs text-muted">{item.rate}</span>
                  <span className="text-xs font-semibold text-forest">Resume →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── LAURIE FLOATING BUTTON ──────────────────────────────────── */}
      <button
        onClick={() => setLaurieOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-forest/90 transition-colors"
        aria-label="Open Laurie AI advisor"
      >
        <Sparkles className="h-4 w-4" />
        Ask Laurie
      </button>

      <LaurieAdvisor
        isOpen={laurieOpen}
        onClose={() => setLaurieOpen(false)}
        learnerName={firstName}
      />
    </div>
  );
}
