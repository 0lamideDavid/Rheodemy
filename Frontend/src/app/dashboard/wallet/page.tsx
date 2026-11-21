"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, type WalletBalance, type WalletTransaction } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { formatUSD } from "@/lib/currency";

const QUICK_AMOUNTS = [5, 10, 25];

type Rail = "momo" | "mpesa" | "airtel" | "ilp";

const RAILS: { id: Rail; label: string }[] = [
  { id: "momo", label: "MTN MoMo" },
  { id: "mpesa", label: "M-Pesa Kenya" },
  { id: "airtel", label: "Airtel Money" },
  { id: "ilp", label: "ILP Open Payments" },
];

const EMPTY_BALANCE: WalletBalance = {
  learnerBalance: 0,
  creatorBalance: 0,
  currency: "USD",
};

export default function WalletPage() {
  const { token, user } = useAuth();
  const isCreator = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  const [balance, setBalance] = useState<WalletBalance>(EMPTY_BALANCE);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [paymentPointer, setPaymentPointer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(10);
  const [depositRail, setDepositRail] = useState<Rail>("momo");
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const [nextBalance, nextTransactions, pointer] = await Promise.all([
        api.wallet.balance(),
        api.wallet.transactions(),
        api.wallet.pointer().catch(() => ({ pointerUrl: "" })),
      ]);
      setBalance(nextBalance);
      setTransactions(nextTransactions);
      setPaymentPointer(pointer.pointerUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load wallet");
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

    const handleWallet = (payload: {
      learnerBalance?: number;
      creatorBalance?: number;
      currency?: string;
    }) => {
      setBalance((prev) => ({
        learnerBalance: payload.learnerBalance ?? prev.learnerBalance,
        creatorBalance: payload.creatorBalance ?? prev.creatorBalance,
        currency: payload.currency ?? prev.currency,
      }));
      void refresh();
    };
    const handleTick = () => void refresh();

    socket.on("wallet:updated", handleWallet);
    socket.on("payment:tick", handleTick);
    socket.on("session:ended", handleTick);

    return () => {
      socket.off("wallet:updated", handleWallet);
      socket.off("payment:tick", handleTick);
      socket.off("session:ended", handleTick);
    };
  }, [token, refresh]);

  const handleCopy = () => {
    if (!paymentPointer) return;
    navigator.clipboard.writeText(paymentPointer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      setDepositError("Enter a valid amount");
      return;
    }
    setIsDepositing(true);
    setDepositError(null);

    try {
      const topUp = await api.wallet.topUp(depositAmount, "simulated");

      // Poll the server until the simulated rail confirms (server-side).
      let status = topUp.status;
      for (let attempt = 0; attempt < 20 && status === "PENDING"; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const current = await api.wallet.topUpStatus(topUp.reference);
        status = current.status;
      }

      if (status !== "COMPLETED") {
        throw new Error("Top-up is still pending. Please try again.");
      }

      await refresh();
      setDepositSuccess(true);
      setTimeout(() => {
        setDepositSuccess(false);
        setIsDepositOpen(false);
      }, 1500);
    } catch (err) {
      setDepositError(
        err instanceof Error ? err.message : "Top-up could not be completed"
      );
    } finally {
      setIsDepositing(false);
    }
  };

  const totalIn = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "CREDIT")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const totalOut = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "DEBIT")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  return (
    <div className="space-y-10 pb-16">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rule">
        <div className="space-y-1">
          <span className="text-xs uppercase font-mono tracking-widest text-forest font-bold">
            Interledger Open Payments • Self-Custody
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            Wallet &amp; Streaming Settlements
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Direct micropayments with sub-second finality. Zero hidden
            subscription fees.
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

      {error && (
        <div className="p-3 rounded border border-clay/30 bg-clay/5 text-xs text-clay">
          {error}
        </div>
      )}

      {/* DUAL BALANCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learner balance */}
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
              <span className="text-xs font-mono text-muted uppercase block">
                Available Balance
              </span>
              <p
                className="font-mono text-3xl sm:text-4xl font-bold text-ink mt-1"
                suppressHydrationWarning
              >
                {isLoading ? "…" : formatUSD(balance.learnerBalance)}
              </p>
              <p className="text-xs text-muted mt-1">
                Streams out only while actively watching, reading, or listening.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-rule flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted font-mono">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
              <span>Channel: Active</span>
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

        {/* Creator royalties or educator hook */}
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
                <span className="text-xs font-mono text-muted uppercase block">
                  Unwithdrawn Earnings (55% Cut)
                </span>
                <p className="font-mono text-3xl sm:text-4xl font-bold text-forest mt-1">
                  {isLoading ? "…" : formatUSD(balance.creatorBalance)}
                </p>
                <p className="text-xs text-muted mt-1">
                  Credited in real time from every streamed second across your
                  published courses.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-rule flex items-center justify-between">
              <span className="text-xs text-muted">
                Zero 30-day withholding • Instant payout
              </span>
              <span className="text-[11px] font-mono px-2 py-1 rounded bg-forest/10 text-forest font-semibold">
                55 / 45 split
              </span>
            </div>
          </div>
        ) : (
          <div className="ledger-card p-6 sm:p-8 bg-surface border-dashed space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-[4px] bg-paper border border-rule text-muted font-mono text-[11px] font-semibold uppercase tracking-wider">
                Teach &amp; Earn
              </span>
              <h3 className="font-serif font-bold text-xl text-ink">
                Monetize your knowledge by the second
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Educators on Rheodemy receive a 55% direct royalty split in real
                time. Withdraw instantly to African Mobile Money (MTN MoMo,
                M-Pesa).
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

      {/* LEDGER SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="ledger-card p-4 bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-muted">
                Total In
              </p>
              <p className="font-mono text-sm font-bold text-ink">
                {formatUSD(totalIn)}
              </p>
            </div>
          </div>
        </div>
        <div className="ledger-card p-4 bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-clay/10 text-clay flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-muted">
                Total Out
              </p>
              <p className="font-mono text-sm font-bold text-ink">
                {formatUSD(totalOut)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT LEDGER ENTRIES */}
      <section className="ledger-card p-6 sm:p-8 bg-surface space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rule">
          <h3 className="font-serif font-bold text-lg text-ink">
            Recent Ledger Entries
          </h3>
          <span className="text-[10px] font-mono uppercase text-muted">
            {transactions.length} entries
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading ledger…</span>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-muted py-6">
            No entries yet. Top up your wallet to start streaming.
          </p>
        ) : (
          <ul className="divide-y divide-rule">
            {transactions.slice(0, 12).map((entry) => (
              <li
                key={entry.id}
                className="py-3 flex items-center justify-between gap-4 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">
                    {entry.description}
                  </p>
                  <p className="text-[10px] text-muted font-mono mt-0.5">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-mono font-bold shrink-0 ${
                    entry.type === "CREDIT" ? "text-forest" : "text-clay"
                  }`}
                >
                  {entry.type === "CREDIT" ? "+" : "−"}
                  {formatUSD(entry.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* PAYMENT POINTER + RAILS */}
      <section className="ledger-card p-6 sm:p-8 bg-surface space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rule">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-ink">
              Your Interledger Payment Pointer
            </h3>
            <p className="text-xs text-muted">
              Used to route peer-to-peer streaming micro-settlements securely
              over the Interledger Network.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 rounded bg-paper border border-rule text-xs font-mono font-medium text-ink max-w-[260px] truncate">
              {paymentPointer || "No pointer linked"}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!paymentPointer}
              className="p-2 rounded border border-rule hover:bg-paper text-ink transition-colors cursor-pointer disabled:opacity-40"
              title="Copy pointer address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-forest" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-muted font-semibold block">
            Integrated Emerging Market Funding Rails
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {RAILS.map((rail) => (
              <div
                key={rail.id}
                className="p-3 bg-paper border border-rule rounded flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-forest" />
                <span className="font-medium text-ink">{rail.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-forest/5 border border-forest/20 rounded text-xs text-ink/80 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <span>
            Self-Custody Guarantee: Funds stay in your channel. The streaming
            meter strictly pauses payment on buffering, review, or when you
            pause.
          </span>
        </div>
      </section>

      {/* TOP UP MODAL */}
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

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-muted font-semibold block">
                Deposit Amount (USD)
              </span>
              <div className="grid grid-cols-3 gap-3">
                {QUICK_AMOUNTS.map((amt) => (
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
                    +${amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full mt-2 px-3 py-2 rounded-[4px] border border-rule bg-paper text-sm font-mono text-ink focus:outline-none focus:border-forest"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-muted font-semibold block">
                Choose Payment Rail
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {RAILS.map((rail) => (
                  <button
                    key={rail.id}
                    type="button"
                    onClick={() => setDepositRail(rail.id)}
                    className={`p-3 rounded-[4px] border text-left flex items-center justify-between cursor-pointer ${
                      depositRail === rail.id
                        ? "border-forest bg-forest/5 font-bold"
                        : "border-rule bg-paper"
                    }`}
                  >
                    <span>{rail.label}</span>
                    {depositRail === rail.id && (
                      <Check className="w-3.5 h-3.5 text-forest" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-paper border border-rule rounded text-xs text-muted flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
              <span>
                Simulated rail for this demo. The server verifies and credits the
                ledger; unspent balances remain in your wallet.
              </span>
            </div>

            {depositError && (
              <p className="text-xs text-clay bg-clay/5 border border-clay/20 rounded p-2">
                {depositError}
              </p>
            )}

            <button
              type="button"
              onClick={handleDeposit}
              disabled={isDepositing || depositSuccess}
              className="w-full btn-forest text-xs py-3 rounded-[4px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {depositSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Deposit Credited Successfully!</span>
                </>
              ) : isDepositing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming with server…</span>
                </>
              ) : (
                <>
                  <span>Confirm Deposit of {formatUSD(depositAmount)}</span>
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
