/**
 * fx.ts — Hardcoded FX Rate Table
 *
 * Rates are loaded from environment variables at startup so they can be
 * updated for Demo Day without a code change.
 *
 * Why hardcoded and not a live API?
 * ─────────────────────────────────
 * The ILP Quote step already handles real on-chain FX (USD ↔ EUR etc.)
 * when sending between wallets with different asset codes. This FX table
 * is used ONLY for the virtual balance display layer — converting the USD
 * cost-per-tick into the student's local currency (e.g. NGN) for the UI.
 */

// ── Rate table type ───────────────────────────────────────────────────────────

export type CurrencyCode = 'USD' | 'NGN' | 'EUR' | 'GBP' | 'KES' | 'GHS';

export type FxRateTable = Record<CurrencyCode, number>; // rate relative to 1 USD

// ── Load rates from env (with sensible demo defaults) ─────────────────────────

export const FX_RATES: FxRateTable = {
  USD: 1,
  NGN: Number(process.env.FX_USD_TO_NGN ?? 1600),
  EUR: Number(process.env.FX_USD_TO_EUR ?? 0.92),
  GBP: Number(process.env.FX_USD_TO_GBP ?? 0.79),
  KES: Number(process.env.FX_USD_TO_KES ?? 129),
  GHS: Number(process.env.FX_USD_TO_GHS ?? 15.4),
};

// ── Supported codes list (for validation) ────────────────────────────────────

export const SUPPORTED_CURRENCIES = Object.keys(FX_RATES) as CurrencyCode[];

export function isSupportedCurrency(code: string): code is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(code as CurrencyCode);
}
