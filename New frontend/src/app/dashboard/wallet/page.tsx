"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  Copy, 
  Check, 
  ShieldCheck, 
  Building2,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState<"creator" | "learner">("learner");
  const [balance, setBalance] = useState<number>(1200.0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedRole = localStorage.getItem("rheodemy_role");
      if (storedRole === "creator") setRole("creator");
      const storedBalance = localStorage.getItem("rheodemy_wallet_balance");
      if (storedBalance) setBalance(parseFloat(storedBalance));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [depositRail, setDepositRail] = useState<"momo" | "mpesa" | "airtel" | "ilp">("momo");
  const [depositSuccess, setDepositSuccess] = useState(false);

  const paymentPointer = "$ilp.rheodemy.com/learner_8f92a1";

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentPointer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = () => {
    const updated = balance + depositAmount;
    setBalance(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("rheodemy_wallet_balance", updated.toFixed(2));
    }
    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setIsDepositOpen(false);
    }, 1500);
  };

  const isCreator = role === "creator";

  return (
    <div className="space-y-10 pb-16">
      
      {/* 🧭 PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rule">
        <div className="space-y-1">
          <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
            Interledger Open Payments • Self-Custody
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            Wallet & Streaming Settlements
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Direct micropayments with sub-second finality. Zero hidden subscription fees.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDepositOpen(true)}
          className="btn-forest text-xs py-2.5 px-4 min-h-[38px] flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Top Up Balance</span>
        </button>
      </div>

      {/* 💳 DUAL BALANCES LEDGER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Learner Balance */}
        <div className="ledger-card p-6 sm:p-8 bg-surface space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-[4px] bg-forest/10 border border-forest/20 text-forest font-mono text-[11px] font-bold uppercase tracking-wider">
                Learner Channel
              </span>
              <div className="w-9 h-9 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-muted uppercase block">Available Balance</span>
              <p className="font-mono text-3xl sm:text-4xl font-bold text-ink mt-1" suppressHydrationWarning>
                ₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted mt-1">
                Streams out only while actively watching, reading, or listening.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-rule flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted font-mono">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
              <span>Channel: Active (0 pending locks)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDepositOpen(true)}
              className="text-xs font-semibold text-forest hover:underline cursor-pointer"
            >
              Deposit Funds &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Creator Royalties or Educator Onboarding Hook */}
        {isCreator ? (
          <div className="ledger-card p-6 sm:p-8 bg-surface space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-sun/15 border border-sun/30 text-ink font-mono text-[11px] font-bold uppercase tracking-wider">
                  Creator Desk Royalties
                </span>
                <div className="w-9 h-9 rounded-lg bg-sun/15 text-ink flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-muted uppercase block">Unwithdrawn Earnings (80% Cut)</span>
                <p className="font-mono text-3xl sm:text-4xl font-bold text-forest mt-1">
                  ₦28,450.00
                </p>
                <p className="text-xs text-muted mt-1">
                  Earned from 4,376 streamed seconds across 3 courses.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-rule flex items-center justify-between">
              <span className="text-xs text-muted">
                Zero 30-day withholding • Instant payout
              </span>
              <button
                type="button"
                className="btn-forest text-xs py-1.5 px-3"
              >
                Withdraw to MoMo
              </button>
            </div>
          </div>
        ) : (
          <div className="ledger-card p-6 sm:p-8 bg-surface border-dashed space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-[4px] bg-paper border border-rule text-muted font-mono text-[11px] font-semibold uppercase tracking-wider">
                Teach & Earn
              </span>
              <h3 className="font-serif font-bold text-xl text-ink">
                Monetize your knowledge by the second
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Educators on Rheodemy receive 80% direct royalty splits in real time. Withdraw instantly to African Mobile Money (MTN MoMo, M-Pesa).
              </p>
            </div>

            <div className="pt-4 border-t border-rule">
              <Link
                href="/role"
                className="btn-forest text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <span>Activate Educator Capabilities</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* 🏛️ OPEN PAYMENTS PROTOCOL DETAILS */}
      <section className="ledger-card p-6 sm:p-8 bg-surface space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rule">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-ink">
              Your Interledger Payment Pointer
            </h3>
            <p className="text-xs text-muted">
              Used to route peer-to-peer streaming micro-settlements securely over the Interledger Network.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 rounded bg-paper border border-rule text-xs font-mono font-medium text-ink">
              {paymentPointer}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded border border-rule hover:bg-paper text-ink transition-colors cursor-pointer"
              title="Copy pointer address"
            >
              {copied ? <Check className="w-4 h-4 text-forest" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Supported Deposit Rails */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-muted font-semibold block">
            Integrated Emerging Market Funding Rails
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-paper border border-rule rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest" />
              <span className="font-medium text-ink">MTN MoMo</span>
            </div>
            <div className="p-3 bg-paper border border-rule rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest" />
              <span className="font-medium text-ink">M-Pesa Kenya</span>
            </div>
            <div className="p-3 bg-paper border border-rule rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest" />
              <span className="font-medium text-ink">Airtel Money</span>
            </div>
            <div className="p-3 bg-paper border border-rule rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest" />
              <span className="font-medium text-ink">ILP Open Payments</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-forest/5 border border-forest/20 rounded text-xs text-ink/80 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <span>
            Self-Custody Guarantee: Funds stay in your channel. The streaming meter strictly pauses payment on buffering, review, or when you pause.
          </span>
        </div>
      </section>

      {/* 💳 TOP UP MODAL */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="ledger-card p-6 sm:p-8 bg-surface max-w-md w-full space-y-6 shadow-xl border border-rule animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between border-b border-rule pb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-forest" />
                <h3 className="font-serif font-bold text-xl text-ink">
                  Top Up Learner Wallet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositOpen(false)}
                className="w-7 h-7 rounded-full border border-rule flex items-center justify-center text-muted hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Amount Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-muted font-semibold block">
                Deposit Amount (NGN)
              </span>
              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`p-3 rounded-[4px] font-mono text-sm font-bold border transition-all cursor-pointer ${
                      depositAmount === amt
                        ? "bg-forest/10 border-forest text-forest"
                        : "bg-paper border-rule text-ink hover:bg-surface"
                    }`}
                  >
                    +₦{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Payment Rails */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-muted font-semibold block">
                Choose Payment Rail
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDepositRail("momo")}
                  className={`p-3 rounded-[4px] border text-left flex items-center justify-between cursor-pointer ${
                    depositRail === "momo" ? "border-forest bg-forest/5 font-bold" : "border-rule bg-paper"
                  }`}
                >
                  <span>MTN MoMo</span>
                  {depositRail === "momo" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
                <button
                  type="button"
                  onClick={() => setDepositRail("mpesa")}
                  className={`p-3 rounded-[4px] border text-left flex items-center justify-between cursor-pointer ${
                    depositRail === "mpesa" ? "border-forest bg-forest/5 font-bold" : "border-rule bg-paper"
                  }`}
                >
                  <span>M-Pesa Kenya</span>
                  {depositRail === "mpesa" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
                <button
                  type="button"
                  onClick={() => setDepositRail("airtel")}
                  className={`p-3 rounded-[4px] border text-left flex items-center justify-between cursor-pointer ${
                    depositRail === "airtel" ? "border-forest bg-forest/5 font-bold" : "border-rule bg-paper"
                  }`}
                >
                  <span>Airtel Money</span>
                  {depositRail === "airtel" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
                <button
                  type="button"
                  onClick={() => setDepositRail("ilp")}
                  className={`p-3 rounded-[4px] border text-left flex items-center justify-between cursor-pointer ${
                    depositRail === "ilp" ? "border-forest bg-forest/5 font-bold" : "border-rule bg-paper"
                  }`}
                >
                  <span>ILP Open Payments</span>
                  {depositRail === "ilp" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="p-3 bg-paper border border-rule rounded text-xs text-muted flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
              <span>Funds are self-custodied. Unspent balances remain in your wallet and only stream while actively learning.</span>
            </div>

            {/* CTA Execution */}
            <button
              type="button"
              onClick={handleDeposit}
              disabled={depositSuccess}
              className="w-full btn-forest text-xs py-3 rounded-[4px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {depositSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Deposit Credited Successfully!</span>
                </>
              ) : (
                <>
                  <span>Confirm Deposit of ₦{depositAmount.toLocaleString()}</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}