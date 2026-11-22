"use client";

import type { CurrencyCode } from "./currency";

const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  EGP: "ج.م",
  CHF: "CHF",
};

export function CurrencyCoin({ code, size = 42 }: { code: CurrencyCode; size?: number }) {
  return (
    <span
      className={`admin-currency-coin admin-currency-coin-${code.toLowerCase()}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${code} currency icon`}
    >
      <span>{currencySymbols[code]}</span>
      <i aria-hidden="true" />
    </span>
  );
}
