// src/lib/formatters.ts
/**
 * Utility helpers for formatting monetary values.
 */

/**
 * Formats a numeric value as United States Dollars.
 *
 * Example:
 * ```ts
 * const price = formatUSD(5.5); // "$5.50"
 * ```
 */
export const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

