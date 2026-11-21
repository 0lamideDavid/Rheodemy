"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Copy,
  Check,
  CreditCard,
  Building2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type WalletTransaction } from "@/lib/api";
import { formatUSD } from "@/lib/currency";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WalletPage() {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [learnerBalance, setLearnerBalance] = useState(0);
  const [creatorBalance, setCreatorBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [pointer, setPointer] = useState<string | null>(null);
  const [pointerError, setPointerError] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCreator = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  const load = () => {
    setIsLoading(true);
    setLoadError(null);
    Promise.all([
      api.wallet.balance(),
      api.wallet.transactions(),
      api.wallet.pointer().catch(() => null),
    ])
      .then(([balance, history, walletPointer]) => {
        setLearnerBalance(balance.learnerBalance);
        setCreatorBalance(balance.creatorBalance);
        setTransactions(history);
        setPointer(walletPointer?.pointerUrl ?? null);
        setPointerError(!walletPointer);
      })
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyPointer = async () => {
    if (!pointer) return;
    await navigator.clipboard.writeText(pointer);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-forest">
            Wallet & payments
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
            Your learning budget
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Balances and transaction history come directly from the Rheodemy
            ledger. Streaming payments settle to educators over Interledger.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-rule bg-surface px-3 py-2 text-xs font-medium text-muted hover:text-ink"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </header>

      {loadError && (
        <div className="ledger-card flex items-start gap-3 bg-surface p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
          <div>
            <p className="font-semibold text-ink">Could not load your wallet.</p>
            <p className="text-xs text-muted">{loadError}</p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="ledger-card flex flex-col justify-between bg-surface p-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Wallet className="h-3.5 w-3.5 text-forest" /> Learner balance
            </div>
            <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-ink">
              {isLoading ? "…" : formatUSD(learnerBalance)}
            </p>
            <p className="mt-2 text-xs text-muted">Available for new lesson sessions</p>
          </div>
          <Link href="/coming-soon" className="btn-forest mt-6 self-start text-xs">
            <ArrowDownRight className="h-4 w-4" /> Top up balance
          </Link>
        </div>

        <div className="ledger-card flex flex-col justify-between bg-surface p-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Building2 className="h-3.5 w-3.5 text-forest" /> Creator earnings
            </div>
            <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-ink">
              {isLoading ? "…" : formatUSD(creatorBalance)}
            </p>
            <p className="mt-2 text-xs text-muted">
              {isCreator
                ? "Net earnings from paid lesson sessions"
                : "Available once you publish a course"}
            </p>
          </div>
          {isCreator ? (
            <Link href="/dashboard/creator" className="btn-secondary mt-6 self-start text-xs">
              Creator dashboard
            </Link>
          ) : (
            <Link href="/become-creator" className="btn-secondary mt-6 self-start text-xs">
              Become a creator
            </Link>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="ledger-card bg-surface p-6 lg:col-span-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <CreditCard className="h-4 w-4 text-forest" /> Interledger pointer
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            This is the wallet address linked to your Rheodemy account.
          </p>

          {pointerError ? (
            <p className="mt-4 rounded-lg border border-rule bg-paper/60 p-3 text-xs text-muted">
              No wallet pointer is attached to this account yet.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <code className="block break-all rounded-lg border border-rule bg-paper/60 p-3 font-mono text-[11px] text-ink">
                {isLoading ? "Loading…" : pointer ?? "—"}
              </code>
              <button
                onClick={copyPointer}
                disabled={!pointer}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-surface px-3 py-2 text-xs font-medium text-muted hover:text-ink disabled:opacity-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-forest" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy pointer"}
              </button>
            </div>
          )}
        </div>

        <div className="ledger-card overflow-hidden bg-surface lg:col-span-2">
          <div className="flex items-center justify-between border-b border-rule px-5 py-4">
            <h2 className="font-serif text-lg font-bold text-ink">Transactions</h2>
            <span className="font-mono text-[11px] text-muted">USD</span>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded bg-rule/30" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted">
              No transactions yet. Start a lesson to see your first charge.
            </div>
          ) : (
            <ul className="divide-y divide-rule">
              {transactions.map((transaction) => {
                const isDebit = transaction.type === "DEBIT";
                return (
                  <li key={transaction.id} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isDebit ? "bg-clay/10 text-clay" : "bg-forest/10 text-forest"
                      }`}
                    >
                      {isDebit ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {transaction.description}
                      </p>
                      <p className="text-[11px] text-muted">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <span
                      className={`font-mono text-sm font-semibold tabular-nums ${
                        isDebit ? "text-clay" : "text-forest"
                      }`}
                    >
                      {isDebit ? "−" : "+"}
                      {formatUSD(transaction.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
