"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLanguage, type LocaleCode } from "./language";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "EGP" | "CHF";

export type ExchangeRate = {
  currency_code: CurrencyCode;
  currency_name: string;
  symbol: string;
  rate_to_usd: number;
  decimal_digits: number;
  is_active: boolean;
  updated_at?: string;
};

export const currencyOptions: ExchangeRate[] = [
  { currency_code: "USD", currency_name: "US Dollar", symbol: "$", rate_to_usd: 1, decimal_digits: 2, is_active: true },
  { currency_code: "EUR", currency_name: "Euro", symbol: "€", rate_to_usd: 0.92, decimal_digits: 2, is_active: true },
  { currency_code: "GBP", currency_name: "Pound Sterling", symbol: "£", rate_to_usd: 0.79, decimal_digits: 2, is_active: true },
  { currency_code: "EGP", currency_name: "Egyptian Pound", symbol: "ج.م", rate_to_usd: 49, decimal_digits: 0, is_active: true },
  { currency_code: "CHF", currency_name: "Swiss Franc", symbol: "CHF", rate_to_usd: 0.88, decimal_digits: 2, is_active: true },
];

const fallbackRates = Object.fromEntries(currencyOptions.map((item) => [item.currency_code, item.rate_to_usd])) as Record<CurrencyCode, number>;
const fallbackMeta = Object.fromEntries(currencyOptions.map((item) => [item.currency_code, item])) as Record<CurrencyCode, ExchangeRate>;
const localeCurrency: Record<LocaleCode, CurrencyCode> = { en: "USD", ar: "EGP", fr: "EUR", de: "CHF", es: "EUR", it: "EUR", zh: "USD", pl: "EUR", cs: "EUR" };
const localeMap: Record<LocaleCode, string> = { en: "en-US", ar: "ar-EG", fr: "fr-FR", de: "de-DE", es: "es-ES", it: "it-IT", zh: "zh-CN", pl: "pl-PL", cs: "cs-CZ" };

type CurrencyContextValue = {
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  rateRows: ExchangeRate[];
  loading: boolean;
  setCurrency: (currency: CurrencyCode) => void;
  convert: (amount: number, from?: CurrencyCode) => number;
  format: (amount: number, from?: CurrencyCode) => string;
  refreshRates: () => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function rateRowsFromMap(rates: Record<CurrencyCode, number>) {
  return currencyOptions.map((item) => ({ ...item, rate_to_usd: rates[item.currency_code] ?? item.rate_to_usd }));
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(fallbackRates);
  const [rateRows, setRateRows] = useState<ExchangeRate[]>(currencyOptions);
  const [hydrated, setHydrated] = useState(false);
  const [currencyLocked, setCurrencyLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshRates = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/currency", { credentials: "same-origin" });
      const rows = response.ok ? await response.json() as ExchangeRate[] : [];
      if (rows.length) {
      const nextRates = { ...fallbackRates };
      rows.forEach((row) => { if (row.currency_code in nextRates) nextRates[row.currency_code] = Number(row.rate_to_usd) || nextRates[row.currency_code]; });
      setRates(nextRates);
      setRateRows(rateRowsFromMap(nextRates).map((row) => rows.find((item) => item.currency_code === row.currency_code) ?? row));
      }
    } catch {
      // The static rates remain available while the database is unreachable.
    }
    setLoading(false);
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("alpnile-currency") as CurrencyCode | null;
    if (saved && saved in fallbackRates) {
      setCurrencyState(saved);
      setCurrencyLocked(true);
    }
    setHydrated(true);
    void refreshRates();
  }, []);

  useEffect(() => {
    if (hydrated && !currencyLocked) setCurrencyState(localeCurrency[locale] ?? "USD");
  }, [currencyLocked, hydrated, locale]);

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next);
    setCurrencyLocked(true);
    window.localStorage.setItem("alpnile-currency", next);
  };

  const convert = (amount: number, from: CurrencyCode = "USD") => {
    const sourceRate = rates[from] || 1;
    const targetRate = rates[currency] || 1;
    return amount / sourceRate * targetRate;
  };

  const format = (amount: number, from: CurrencyCode = "USD") => {
    const meta = rateRows.find((row) => row.currency_code === currency) ?? fallbackMeta[currency];
    return new Intl.NumberFormat(localeMap[locale] ?? "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: meta.decimal_digits,
      maximumFractionDigits: meta.decimal_digits,
    }).format(convert(amount, from));
  };

  const value = useMemo(() => ({ currency, rates, rateRows, loading, setCurrency, convert, format, refreshRates }), [currency, loading, rateRows, rates]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}

export function LocalizedPrice({ amount, from = "USD", className }: { amount: number; from?: CurrencyCode; className?: string }) {
  const { format } = useCurrency();
  return <span className={className}>{format(amount, from)}</span>;
}

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  return <div className="site-currency-picker" data-no-translate>
    <button type="button" className="site-currency-trigger" aria-label={`Currency: ${currency}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((value) => !value)}><span>{currency}</span><small aria-hidden="true">⌄</small></button>
    {open && <div className="site-currency-menu" role="listbox" aria-label="Currency">
      {currencyOptions.map((option) => <button type="button" role="option" aria-selected={currency === option.currency_code} className={currency === option.currency_code ? "active" : ""} key={option.currency_code} onClick={() => { setCurrency(option.currency_code); setOpen(false); }}><span>{option.currency_code}</span><small>{option.symbol} {option.currency_name}</small></button>)}
    </div>}
  </div>;
}
