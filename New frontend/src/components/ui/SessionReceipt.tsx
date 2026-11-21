import React from "react";
import { Receipt, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SessionReceiptProps {
  lessonTitle: string;
  instructorName: string;
  teachingMinutes: string;
  pausedMinutes: string;
  totalSpent: string;
  remainingBalance: string;
  onClose?: () => void;
  className?: string;
}

export function SessionReceipt({
  lessonTitle,
  instructorName,
  teachingMinutes,
  pausedMinutes,
  totalSpent,
  remainingBalance,
  onClose,
  className = "",
}: SessionReceiptProps) {
  return (
    <div
      role="region"
      aria-label="Session summary receipt"
      className={`ledger-card p-6 bg-surface max-w-md w-full border border-rule shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-rule">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-forest" aria-hidden="true" />
          <h3 className="font-serif text-lg font-bold text-ink">Lesson receipt</h3>
        </div>
        <span className="text-xs font-mono text-muted tabular-nums">Interledger settled</span>
      </div>

      <div className="py-4 space-y-1">
        <h4 className="font-semibold text-sm text-ink line-clamp-1">{lessonTitle}</h4>
        <p className="text-xs text-muted">Instructor: {instructorName}</p>
      </div>

      <div className="py-3 border-y border-dashed border-rule space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted">Teaching time</span>
          <span className="font-mono tabular-nums text-ink">{teachingMinutes}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted">Paused / inactive</span>
          <span className="font-mono tabular-nums text-muted">{pausedMinutes} (₦0 charged)</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-rule font-medium">
          <span className="text-ink">Total spent</span>
          <span className="font-mono font-bold text-base text-ink tabular-nums">{totalSpent}</span>
        </div>
        <div className="flex justify-between items-center text-muted">
          <span>Remaining balance</span>
          <span className="font-mono tabular-nums">{remainingBalance}</span>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => alert("Dispute or report problem flow will open.")}
          className="text-muted hover:text-clay inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Report a problem</span>
        </button>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="btn-forest text-xs py-2 px-4 min-h-[36px]"
          >
            Continue
          </button>
        ) : (
          <Link
            href="/dashboard/learner"
            className="btn-forest text-xs py-2 px-4 min-h-[36px]"
          >
            Dashboard <ArrowRight className="w-3.5 h-3.5 ms-1" />
          </Link>
        )}
      </div>
    </div>
  );
}

