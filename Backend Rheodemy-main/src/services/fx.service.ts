/**
 * fx.service.ts — Currency conversion for the display layer
 *
 * This service is used to convert the USD cost-per-tick into the student's
 * preferred local currency for the UI. The actual on-chain ILP transfer
 * always uses the quote's native asset code — this is display-only.
 *
 * Usage:
 *   FxService.convert(0.001, 'USD', 'NGN')  // → 1.6
 *   FxService.getRates()                     // → { USD: 1, NGN: 1600, ... }
 */

import { FX_RATES, CurrencyCode, isSupportedCurrency, SUPPORTED_CURRENCIES } from '../config/fx';
import { BadRequest } from '../utils/errors';

export interface ConversionResult {
  fromAmount:   number;
  fromCurrency: CurrencyCode;
  toAmount:     number;
  toCurrency:   CurrencyCode;
  rate:         number;        // how many toCurrency units per 1 fromCurrency
}

export class FxService {
  /**
   * Convert an amount from one currency to another.
   * Both currencies must be in the FX_RATES table.
   *
   * @param amount       The source amount (e.g. 0.001)
   * @param from         Source currency code (e.g. 'USD')
   * @param to           Target currency code (e.g. 'NGN')
   * @returns            ConversionResult with converted amount and effective rate
   */
  static convert(amount: number, from: string, to: string): ConversionResult {
    if (!isSupportedCurrency(from)) {
      throw BadRequest(`Unsupported source currency: ${from}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`);
    }
    if (!isSupportedCurrency(to)) {
      throw BadRequest(`Unsupported target currency: ${to}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`);
    }

    // All rates are relative to USD, so:
    //   from → USD → to
    const amountInUsd = amount / FX_RATES[from];
    const toAmount    = amountInUsd * FX_RATES[to];
    const rate        = FX_RATES[to] / FX_RATES[from];

    return {
      fromAmount:   amount,
      fromCurrency: from,
      toAmount:     parseFloat(toAmount.toFixed(6)),
      toCurrency:   to,
      rate:         parseFloat(rate.toFixed(6)),
    };
  }

  /**
   * Returns the full FX rate table (for the UI to display rates).
   */
  static getRates(): typeof FX_RATES {
    return { ...FX_RATES };
  }

  /**
   * Returns the list of supported currency codes.
   */
  static getSupportedCurrencies(): CurrencyCode[] {
    return [...SUPPORTED_CURRENCIES];
  }
}
