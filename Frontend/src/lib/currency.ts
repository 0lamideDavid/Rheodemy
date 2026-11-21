const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdPreciseFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === "string" ? Number(value) : value ?? 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatUSD(value: string | number | null | undefined): string {
  return usdFormatter.format(toNumber(value));
}

export function formatUSDPrecise(
  value: string | number | null | undefined
): string {
  const amount = toNumber(value);
  if (amount === 0) return usdFormatter.format(0);
  if (Math.abs(amount) < 0.01) return `$${amount.toFixed(6)}`;
  return usdPreciseFormatter.format(amount);
}

export function formatRatePerMinute(
  value: string | number | null | undefined
): string {
  return `${formatUSD(value)} / min`;
}
