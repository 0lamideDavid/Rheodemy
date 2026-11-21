"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Loader2,
  Video,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function UploadCourse() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState("0.12");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rateValue = Number.parseFloat(rate);
  const isRateValid = Number.isFinite(rateValue) && rateValue > 0 && rateValue <= 10;
  const canPublish =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    isRateValid &&
    !isPublishing;

  const handlePublish = async () => {
    setError(null);
    setIsPublishing(true);
    try {
      await api.courses.create({
        title: title.trim(),
        description: description.trim(),
        pricePerMinute: rateValue,
        currency: "USD",
      });
      router.push("/dashboard/creator");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not publish this course. Please try again."
      );
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/creator"
          className="p-2 rounded-full border border-rule hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
            Publish a course
          </h1>
          <p className="text-muted text-sm mt-1">
            The Rheodemy backend creates the course and its first lesson.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="ledger-card p-6 sm:p-8 bg-surface space-y-5">
            <h2 className="text-xl font-bold text-ink">1. Course details</h2>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-paper border border-rule rounded-lg px-4 py-3 focus:outline-none focus:border-forest transition-colors text-sm text-ink"
                placeholder="e.g. Masterclass in TypeScript"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-paper border border-rule rounded-lg px-4 py-3 h-28 focus:outline-none focus:border-forest transition-colors text-sm text-ink"
                placeholder="What will students learn?"
              />
            </div>
          </div>

          <div className="ledger-card p-6 sm:p-8 bg-surface space-y-4">
            <h2 className="text-xl font-bold text-ink">2. Media</h2>
            <div className="p-4 bg-paper border border-rule rounded-lg flex items-start gap-3">
              <Video className="w-5 h-5 text-forest shrink-0 mt-0.5" />
              <div className="text-xs text-muted space-y-1">
                <p className="font-semibold text-ink">
                  Media upload is not enabled in this build.
                </p>
                <p>
                  Publishing creates the course plus a default introduction
                  lesson on the backend. Real Mux/audio/ebook upload is a later
                  phase.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="ledger-card p-6 sm:p-8 bg-surface space-y-5">
            <h2 className="text-xl font-bold text-ink">3. Monetization</h2>

            <div className="p-4 bg-forest/5 rounded-lg border border-forest/20 space-y-1">
              <p className="text-sm font-medium text-forest flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Pay-as-you-learn active
              </p>
              <p className="text-xs text-muted">
                Learners are billed per minute while actively engaged, in USD.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Streaming rate (USD / min)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  $
                </span>
                <input
                  type="number"
                  min="0.01"
                  max="10"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-paper border border-rule rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-forest transition-colors text-ink"
                />
              </div>
              <p className="text-xs text-muted mt-2">
                The backend accepts a rate between $0.01 and $10 per minute.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded border border-clay/30 bg-clay/5 text-xs text-clay flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            className="w-full btn-forest px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing to Rheodemy…
              </>
            ) : (
              "Publish course"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
