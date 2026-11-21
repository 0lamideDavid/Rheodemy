"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export type PaymentState = "free_preview" | "paying" | "paused" | "low_balance" | "unlocked" | "rewatching";

interface StatusDotProps {
  state: PaymentState;
  sessionSpend: string; // e.g. "$25.00"
  minutesUsed: string; // e.g. "5m 00s"
  balance: string; // e.g. "$1,200.00"
  ratePerMin: string; // e.g. "$5 / min"
  showLiveMeter?: boolean;
  onToggleLiveMeter?: (show: boolean) => void;
  className?: string;
}

export function StatusDot({
  state,
  sessionSpend,
  minutesUsed,
  balance,
  ratePerMin,
  showLiveMeter = false,
  onToggleLiveMeter,
  className = "",
}: StatusDotProps) {
  const [isPeekOpen, setIsPeekOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetAutoClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsPeekOpen(false);
    }, 5000);
  };

  const handleToggle = () => {
    setIsPeekOpen((prev) => {
      const next = !prev;
      if (next) resetAutoClose();
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getStatusDetails = () => {
    switch (state) {
      case "free_preview":
        return {
          label: "Free preview",
          sublabel: "No charge yet",
          icon: (
            <span
              className="inline-block w-2.5 h-2.5 rotate-45 border-2 border-forest dark:border-forest-hover bg-forest/25"
              aria-hidden="true"
            />
          ),
          colorClass: "text-forest border-forest",
        };
      case "paying":
        return {
          label: "Paying",
          sublabel: "Payment flowing",
          icon: (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full bg-forest"
              aria-hidden="true"
            />
          ),
          colorClass: "text-forest border-forest",
        };
      case "paused":
        return {
          label: "Paused",
          sublabel: "Nothing charged",
          icon: (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border-2 border-muted bg-transparent"
              aria-hidden="true"
            />
          ),
          colorClass: "text-muted border-muted",
        };
      case "low_balance":
        return {
          label: "Low balance",
          sublabel: "Balance running low",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-clay" aria-hidden="true" />,
          colorClass: "text-clay border-clay",
        };
      case "unlocked":
        return {
          label: "Unlocked",
          sublabel: "Cap reached • $0/min forever",
          icon: (
            <span
              className="inline-block w-2.5 h-2.5 rotate-45 bg-forest border-2 border-forest"
              aria-hidden="true"
            />
          ),
          colorClass: "text-forest border-forest",
        };
      case "rewatching":
        return {
          label: "Rewatching",
          sublabel: "Already paid • $0/min",
          icon: <RotateCcw className="w-3.5 h-3.5 text-forest" aria-hidden="true" />,
          colorClass: "text-forest border-forest",
        };
    }
  };

  const details = getStatusDetails();

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={resetAutoClose}
    >
      {/* Quiet Status Dot / Pill Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isPeekOpen}
        aria-label={`Payment status: ${details.label}. ${details.sublabel}. Tap to view session details.`}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/95 dark:bg-surface/95 border-2 border-rule dark:border-forest/50 hover:border-forest text-ink shadow-md backdrop-blur-xs transition-all cursor-pointer min-h-[36px]"
      >
        <span className="flex items-center justify-center w-4 h-4">
          {details.icon}
        </span>
        <span className="text-xs font-semibold text-ink tabular-nums tracking-wide">
          {showLiveMeter ? sessionSpend : details.label}
        </span>
      </button>

      {/* 5-Second Peek Panel on Demand */}
      {isPeekOpen && (
        <div
          role="region"
          aria-label="Payment Session Peek Panel"
          className="absolute top-full end-0 mt-2 w-72 p-4 bg-surface rounded-xl border border-rule shadow-lg z-50 text-ink animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted font-medium">
                Current status
              </div>
              <div className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                {details.icon}
                <span>{details.label}</span>
              </div>
            </div>
            <div className="text-end">
              <div className="text-[11px] uppercase tracking-wider text-muted font-medium">
                Rate
              </div>
              <div className="text-sm font-bold font-mono tabular-nums text-forest">
                {ratePerMin}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 py-3 border-b border-rule text-xs">
            <div>
              <div className="text-muted">This session</div>
              <div className="text-base font-bold font-mono tabular-nums mt-0.5 text-ink">
                {sessionSpend}
              </div>
            </div>
            <div>
              <div className="text-muted">Active time</div>
              <div className="text-base font-bold font-mono tabular-nums mt-0.5 text-ink">
                {minutesUsed}
              </div>
            </div>
          </div>

          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Wallet balance</span>
              <span className="font-bold font-mono tabular-nums text-ink">{balance}</span>
            </div>

            {onToggleLiveMeter && (
              <div className="flex items-center justify-between pt-2 border-t border-rule text-xs">
                <span className="text-muted">Show live meter</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showLiveMeter}
                  onClick={() => onToggleLiveMeter(!showLiveMeter)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    showLiveMeter ? "bg-forest" : "bg-rule"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow-sm ring-0 transition duration-200 ease-in-out ${
                      showLiveMeter ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

