"use client";

import React, { useState, useRef, useEffect } from "react";
import { Wallet, Plus } from "lucide-react";
import Link from "next/link";

interface WalletPillProps {
  cashBalance: string; // e.g. "$1,200.00"
  minutesEquivalent?: string; // e.g. "About 240 mins"
  sponsorCredits?: string; // e.g. "$2,000"
  sponsorRestriction?: string; // e.g. "STEM courses only"
  className?: string;
}

export function WalletPill({
  cashBalance,
  minutesEquivalent,
  sponsorCredits,
  sponsorRestriction,
  className = "",
}: WalletPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Wallet balance: ${cashBalance}. Tap to open balance and top up.`}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-rule hover:border-muted text-ink shadow-xs transition-colors cursor-pointer min-h-[38px]"
      >
        <Wallet className="w-4 h-4 text-forest" aria-hidden="true" />
        <span className="font-mono font-bold text-xs tabular-nums text-ink">
          {cashBalance}
        </span>
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label="Wallet quick overview"
          className="absolute top-full end-0 mt-2 w-72 p-4 bg-surface rounded-xl border border-rule shadow-lg z-50 text-ink animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <span className="text-xs font-semibold text-ink">Wallet</span>
            <Link
              href="/dashboard/wallet"
              className="text-xs text-forest hover:underline font-medium"
            >
              History
            </Link>
          </div>

          <div className="py-3 space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-muted font-medium">
              Cash balance
            </div>
            <div className="text-xl font-bold font-mono text-ink tabular-nums">
              {cashBalance}
            </div>
            {minutesEquivalent && (
              <p className="text-xs text-muted leading-tight">
                {minutesEquivalent}
              </p>
            )}
          </div>

          {sponsorCredits && (
            <div className="py-2.5 px-3 rounded-lg bg-paper border border-rule text-xs space-y-0.5">
              <div className="flex justify-between items-center font-medium">
                <span className="text-forest">Sponsor credits</span>
                <span className="font-mono font-bold tabular-nums text-forest">
                  {sponsorCredits}
                </span>
              </div>
              {sponsorRestriction && (
                <p className="text-[11px] text-muted">{sponsorRestriction}</p>
              )}
            </div>
          )}

          <div className="pt-3">
            <Link
              href="/dashboard/wallet?action=topup"
              className="btn-forest w-full text-xs py-2 min-h-[36px] flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add money</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

