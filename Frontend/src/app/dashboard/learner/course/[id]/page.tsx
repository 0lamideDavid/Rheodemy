"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  Eye,
  EyeOff,
  FileText,
  Headphones,
  Video,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, API_URL, type Course, type Lesson } from "@/lib/api";
import { formatUSD, formatUSDPrecise, toNumber } from "@/lib/currency";
import { StatusDot, type PaymentState } from "@/components/ui/StatusDot";
import { SessionReceipt } from "@/components/ui/SessionReceipt";

const FREE_PREVIEW_SECONDS = 120;

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatMinutes(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(safe / 60)}m ${(safe % 60).toString().padStart(2, "0")}s`;
}

function lessonMedia(lesson: Lesson | null): "video" | "audio" | "ebook" {
  if (!lesson) return "video";
  const url = lesson.contentUrl.toLowerCase();
  if (/\.(mp3|wav|m4a|ogg)$/.test(url)) return "audio";
  if (/\.(pdf|epub)$/.test(url)) return "ebook";
  return "video";
}

export default function CoursePlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const courseId = params?.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [lessonIndex, setLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const [chargeableSeconds, setChargeableSeconds] = useState(0);
  const [sessionSpend, setSessionSpend] = useState(0);
  const [showMeter, setShowMeter] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const maxWatchedRef = useRef(0);
  const chargeableRef = useRef(0);
  const spendRef = useRef(0);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  const lesson = course?.lessons?.[lessonIndex] ?? null;
  const mediaKind = lessonMedia(lesson);
  const ratePerMinute = toNumber(course?.pricePerMinute);
  const ratePerSecond = ratePerMinute / 60;

  const inFreePreview = chargeableSeconds < FREE_PREVIEW_SECONDS;
  const paymentState: PaymentState = !isPlaying
    ? "paused"
    : isBuffering
    ? "paused"
    : inFreePreview
    ? "free_preview"
    : "paying";

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    api.courses
      .get(courseId)
      .then((data) => {
        if (!cancelled) setCourse(data);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  useEffect(() => {
    if (!token) return;
    api.wallet
      .balance()
      .then((data) => setBalance(data.learnerBalance))
      .catch(() => setBalance(null));
  }, [token]);

  const endSession = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    sessionIdRef.current = null;

    const totalAmount = Number(spendRef.current.toFixed(6));
    try {
      await fetch(`${API_URL}/api/sessions/${sessionId}/end`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ totalAmount }),
        keepalive: true,
      });
    } catch {
      // The server also force-closes stale sessions; nothing else to do here.
    } finally {
      if (token) {
        api.wallet
          .balance()
          .then((data) => setBalance(data.learnerBalance))
          .catch(() => undefined);
      }
    }
  }, [token]);

  const startSession = useCallback(async () => {
    if (!course || !token) return;
    if (sessionIdRef.current) return;
    try {
      const { sessionId } = await api.sessions.start(
        course.id,
        lesson?.id ?? undefined
      );
      sessionIdRef.current = sessionId;
    } catch (error) {
      console.error("[CoursePlayer] Could not start payment session:", error);
    }
  }, [course, token, lesson]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      void endSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      void endSession();
    };
  }, [endSession]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isPlaying) {
        mediaRef.current?.pause();
        setIsPlaying(false);
        void endSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlaying, endSession]);

  useEffect(() => {
    if (!isPlaying || isBuffering) return;
    const timer = window.setInterval(() => {
      setPosition((previous) => {
        const next = previous + 1;
        const watchedBefore = maxWatchedRef.current;
        if (next > watchedBefore) {
          maxWatchedRef.current = next;
          if (next > FREE_PREVIEW_SECONDS) {
            chargeableRef.current += 1;
            spendRef.current += ratePerSecond;
            setChargeableSeconds(chargeableRef.current);
            setSessionSpend(spendRef.current);
          }
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying, isBuffering, ratePerSecond]);

  const togglePlayback = async () => {
    const element = mediaRef.current;
    if (mediaKind === "ebook") {
      if (isPlaying) {
        setIsPlaying(false);
        await endSession();
        setReceiptOpen(spendRef.current > 0);
      } else {
        await startSession();
        setIsPlaying(true);
      }
      return;
    }

    if (!element) return;
    if (isPlaying) {
      element.pause();
      setIsPlaying(false);
      await endSession();
      if (spendRef.current > 0) setReceiptOpen(true);
    } else {
      await startSession();
      try {
        await element.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const selectLesson = async (index: number) => {
    if (index === lessonIndex) return;
    mediaRef.current?.pause();
    setIsPlaying(false);
    await endSession();
    maxWatchedRef.current = 0;
    chargeableRef.current = 0;
    spendRef.current = 0;
    setPosition(0);
    setDuration(0);
    setChargeableSeconds(0);
    setSessionSpend(0);
    setLessonIndex(index);
  };

  const remaining = useMemo(() => {
    if (balance === null) return null;
    return Math.max(0, balance - sessionSpend);
  }, [balance, sessionSpend]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        <Loader2 className="me-2 h-5 w-5 animate-spin" /> Checking your session…
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="h-6 w-40 animate-pulse rounded bg-rule/40" />
        <div className="ledger-card aspect-video animate-pulse bg-rule/30" />
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-clay" />
        <h1 className="font-serif text-2xl font-bold text-ink">Course unavailable</h1>
        <p className="mt-2 text-sm text-muted">{loadError ?? "This course could not be found."}</p>
        <Link href="/dashboard/learner" className="btn-forest mt-6 text-sm">
          Back to catalog
        </Link>
      </div>
    );
  }

  const totalMinutes = course.lessons?.reduce((sum, item) => sum + item.durationSec, 0) ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/learner"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="font-mono tabular-nums">{formatUSD(ratePerMinute)} / min</span>
          <span className="hidden sm:inline">•</span>
          <span>{course.lessons?.length ?? 0} lessons</span>
          {totalMinutes > 0 && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>{formatMinutes(totalMinutes)}</span>
            </>
          )}
        </div>
      </div>

      <header className="space-y-1">
        <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">{course.title}</h1>
        <p className="text-sm text-muted">
          {course.instructor?.firstName} {course.instructor?.lastName} ·{" "}
          {course.description}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="ledger-card relative overflow-hidden bg-black">
            {lesson && mediaKind === "video" && (
              <video
                key={lesson.id}
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={lesson.contentUrl}
                className="aspect-video w-full bg-black"
                muted={isMuted}
                playsInline
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  void endSession();
                  if (spendRef.current > 0) setReceiptOpen(true);
                }}
              />
            )}

            {lesson && mediaKind === "audio" && (
              <div className="flex flex-col items-center gap-4 bg-surface p-10">
                <Headphones className="h-12 w-12 text-forest" />
                <p className="text-sm font-semibold text-ink">{lesson.title}</p>
                <audio
                  key={lesson.id}
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  src={lesson.contentUrl}
                  className="w-full"
                  muted={isMuted}
                  onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                  onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
                  onWaiting={() => setIsBuffering(true)}
                  onPlaying={() => setIsBuffering(false)}
                  onEnded={() => {
                    setIsPlaying(false);
                    void endSession();
                    if (spendRef.current > 0) setReceiptOpen(true);
                  }}
                />
              </div>
            )}

            {lesson && mediaKind === "ebook" && (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-surface p-10 text-center">
                <FileText className="h-12 w-12 text-forest" />
                <p className="text-sm font-semibold text-ink">{lesson.title}</p>
                <a
                  href={lesson.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs"
                >
                  Open reading material
                </a>
                <p className="text-xs text-muted">
                  Time spent reading with the lesson open is metered per minute.
                </p>
              </div>
            )}

            {!lesson && (
              <div className="flex aspect-video items-center justify-center bg-surface text-sm text-muted">
                This course has no published lessons yet.
              </div>
            )}

            <div className="absolute end-3 top-3">
              <StatusDot
                state={paymentState}
                sessionSpend={formatUSD(sessionSpend)}
                minutesUsed={formatMinutes(chargeableSeconds)}
                balance={balance === null ? "—" : formatUSD(remaining ?? 0)}
                ratePerMin={`${formatUSD(ratePerMinute)} / min`}
                showLiveMeter={showMeter}
                onToggleLiveMeter={setShowMeter}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={togglePlayback} className="btn-forest text-sm">
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> {position > 0 ? "Resume" : "Start lesson"}
                </>
              )}
            </button>

            <button
              onClick={() => setIsMuted((value) => !value)}
              className="btn-secondary text-sm"
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>

            <button
              onClick={() => setShowMeter((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-surface px-3 py-2 text-xs font-medium text-muted hover:text-ink"
            >
              {showMeter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showMeter ? "Hide meter" : "Show meter"}
            </button>

            <span className="ms-auto font-mono text-xs tabular-nums text-muted">
              {formatClock(position)} {duration > 0 ? `/ ${formatClock(duration)}` : ""}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-rule">
            <div
              className="h-full bg-forest transition-[width] duration-500"
              style={{ width: `${duration > 0 ? Math.min(100, (position / duration) * 100) : 0}%` }}
            />
          </div>

          <div className="ledger-card bg-surface p-4 text-xs text-muted">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>
                Rate: <strong className="font-mono text-ink">{formatUSD(ratePerMinute)} / min</strong>
              </span>
              <span>
                Session spend:{" "}
                <strong className="font-mono tabular-nums text-ink">{formatUSDPrecise(sessionSpend)}</strong>
              </span>
              <span>
                Preview:{" "}
                <strong className="font-mono text-ink">
                  {inFreePreview
                    ? `${formatClock(FREE_PREVIEW_SECONDS - chargeableSeconds)} left`
                    : "ended"}
                </strong>
              </span>
              <span>Paused and rewatching are free.</span>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="ledger-card bg-surface">
            <div className="border-b border-rule px-4 py-3">
              <h2 className="font-serif text-lg font-bold text-ink">Lessons</h2>
            </div>
            <ul className="divide-y divide-rule">
              {(course.lessons ?? []).map((item, index) => {
                const kind = lessonMedia(item);
                const Icon = kind === "audio" ? Headphones : kind === "ebook" ? FileText : Video;
                const active = index === lessonIndex;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => void selectLesson(index)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors ${
                        active ? "bg-forest/5 text-ink" : "text-muted hover:bg-paper/60"
                      }`}
                    >
                      <Icon className={`mt-0.5 h-4 w-4 ${active ? "text-forest" : "text-muted"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium leading-snug">{item.title}</span>
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {Math.ceil(item.durationSec / 60)} min
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {(course.lessons ?? []).length === 0 && (
                <li className="px-4 py-6 text-xs text-muted">No lessons published yet.</li>
              )}
            </ul>
          </div>

          <button
            onClick={() => {
              void endSession();
              if (spendRef.current > 0) setReceiptOpen(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rule bg-surface px-4 py-2.5 text-xs font-medium text-muted hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" /> End session
          </button>
        </aside>
      </div>

      {receiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <SessionReceipt
            lessonTitle={lesson?.title ?? course.title}
            instructorName={`${course.instructor?.firstName ?? ""} ${course.instructor?.lastName ?? ""}`.trim()}
            teachingMinutes={formatMinutes(chargeableSeconds)}
            pausedMinutes={formatMinutes(0)}
            totalSpent={formatUSDPrecise(sessionSpend)}
            remainingBalance={balance === null ? "—" : formatUSD(remaining ?? 0)}
            onClose={() => {
              setReceiptOpen(false);
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
