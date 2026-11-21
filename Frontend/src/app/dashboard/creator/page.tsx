"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  Users,
  DollarSign,
  Clock,
  RefreshCw,
  Radio,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  API_URL,
  type Course,
  type InstructorSession,
} from "@/lib/api";
import { formatUSD } from "@/lib/currency";

interface ActiveSession {
  sessionId: string;
  studentName: string;
  courseTitle: string;
  earned: number;
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CreatorDashboard() {
  const { token, displayName } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [history, setHistory] = useState<InstructorSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  const coursesRef = useRef<Course[]>([]);

  useEffect(() => {
    coursesRef.current = courses;
  }, [courses]);

  const load = () => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    Promise.all([
      api.courses.mine(),
      api.wallet.balance(),
      api.sessions.instructorHistory(10),
    ])
      .then(([myCourses, balance, recent]) => {
        setCourses(myCourses);
        setEarnings(balance.creatorBalance);
        setHistory(recent);
      })
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let socket: { disconnect: () => void } | null = null;

    import("socket.io-client").then(({ io }) => {
      const client = io(API_URL, { auth: { token } });
      socket = client;

      client.on(
        "session:started",
        (payload: {
          sessionId: string;
          courseId: string;
          courseTitle?: string;
          studentName?: string;
        }) => {
          const course = coursesRef.current.find(
            (item) => item.id === payload.courseId
          );
          const rate = Number(course?.pricePerMinute ?? 0) / 60;
          setActiveSessions((previous) => [
            ...previous.filter((item) => item.sessionId !== payload.sessionId),
            {
              sessionId: payload.sessionId,
              studentName: payload.studentName || "Learner",
              courseTitle: payload.courseTitle || course?.title || "Lesson",
              earned: 0,
            },
          ]);

          if (rate > 0) {
            const timer = window.setInterval(() => {
              setActiveSessions((previous) =>
                previous.map((item) =>
                  item.sessionId === payload.sessionId
                    ? { ...item, earned: item.earned + rate }
                    : item
                )
              );
            }, 1000);
            client.once("session:ended", () => window.clearInterval(timer));
          }
        }
      );

      client.on("session:ended", (payload: { sessionId: string }) => {
        setActiveSessions((previous) =>
          previous.filter((item) => item.sessionId !== payload.sessionId)
        );
        api.wallet
          .balance()
          .then((balance) => setEarnings(balance.creatorBalance))
          .catch(() => undefined);
      });
    });

    return () => {
      socket?.disconnect();
    };
  }, [token]);

  const totals = useMemo(() => {
    const lessons = courses.reduce(
      (sum, course) => sum + (course._count?.lessons ?? course.lessons?.length ?? 0),
      0
    );
    const students = courses.reduce(
      (sum, course) => sum + (course._count?.enrollments ?? 0),
      0
    );
    return { lessons, students };
  }, [courses]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-forest">
            Creator dashboard
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
            {displayName ? `Hello, ${displayName.split(" ")[0]}.` : "Creator dashboard"}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Your published courses, live learning sessions, and settled earnings
            in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-surface px-3 py-2 text-xs font-medium text-muted hover:text-ink"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <Link href="/dashboard/creator/upload" className="btn-forest text-xs">
            <Plus className="h-4 w-4" /> New course
          </Link>
        </div>
      </header>

      {loadError && (
        <div className="ledger-card flex items-start gap-3 bg-surface p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
          <div>
            <p className="font-semibold text-ink">Could not load your creator data.</p>
            <p className="text-xs text-muted">{loadError}</p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Earnings", value: isLoading ? "…" : formatUSD(earnings), icon: DollarSign },
          { label: "Courses", value: isLoading ? "…" : String(courses.length), icon: BookOpen },
          { label: "Lessons", value: isLoading ? "…" : String(totals.lessons), icon: Clock },
          { label: "Enrollments", value: isLoading ? "…" : String(totals.students), icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="ledger-card flex items-center gap-3 bg-surface p-4">
            <div className="rounded-lg bg-forest/10 p-2 text-forest">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
              <div className="font-mono text-lg font-bold tabular-nums text-ink">{value}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="ledger-card overflow-hidden bg-surface lg:col-span-2">
          <div className="flex items-center justify-between border-b border-rule px-5 py-4">
            <h2 className="font-serif text-lg font-bold text-ink">Your courses</h2>
            <span className="font-mono text-[11px] text-muted">{courses.length} total</span>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded bg-rule/30" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="space-y-3 p-10 text-center">
              <p className="text-sm text-muted">You have not published a course yet.</p>
              <Link href="/dashboard/creator/upload" className="btn-forest text-xs">
                Publish your first course
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-rule">
              {courses.map((course) => (
                <li key={course.id} className="flex items-center gap-4 px-5 py-4">
                  <img
                    src={
                      course.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=200&auto=format&fit=crop"
                    }
                    alt=""
                    className="h-12 w-16 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/learner/course/${course.id}`}
                      className="block truncate text-sm font-semibold text-ink hover:text-forest"
                    >
                      {course.title}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {course._count?.lessons ?? course.lessons?.length ?? 0} lessons ·{" "}
                      {formatUSD(course.pricePerMinute)} / min · {course.status.toLowerCase()}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted">
                    {course._count?.enrollments ?? 0} learners
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="ledger-card overflow-hidden bg-surface">
            <div className="flex items-center justify-between border-b border-rule px-5 py-4">
              <h2 className="font-serif text-lg font-bold text-ink">Live sessions</h2>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-forest">
                <Radio className="h-3.5 w-3.5" /> {activeSessions.length}
              </span>
            </div>
            {activeSessions.length === 0 ? (
              <p className="p-5 text-xs text-muted">
                No learner is streaming a paid session right now.
              </p>
            ) : (
              <ul className="divide-y divide-rule">
                {activeSessions.map((session) => (
                  <li key={session.sessionId} className="px-5 py-3">
                    <p className="truncate text-sm font-medium text-ink">{session.studentName}</p>
                    <p className="truncate text-[11px] text-muted">{session.courseTitle}</p>
                    <p className="mt-1 font-mono text-xs font-semibold tabular-nums text-forest">
                      +{formatUSD(session.earned)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ledger-card overflow-hidden bg-surface">
            <div className="border-b border-rule px-5 py-4">
              <h2 className="font-serif text-lg font-bold text-ink">Recent activity</h2>
            </div>
            {isLoading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-10 animate-pulse rounded bg-rule/30" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="p-5 text-xs text-muted">No completed sessions yet.</p>
            ) : (
              <ul className="divide-y divide-rule">
                {history.slice(0, 6).map((session) => (
                  <li key={session.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-ink">{session.studentName}</p>
                      <p className="truncate text-[11px] text-muted">{session.courseTitle}</p>
                      <p className="text-[10px] text-muted">{formatWhen(session.endedAt)}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold tabular-nums text-forest">
                      +{formatUSD(session.creatorEarnings)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
