"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, createElement } from "react";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Locale = "en" | "ru";

const LOCALES: Record<Locale, Record<string, unknown>> = { en, ru };
const STORAGE_KEY = "contentdash_locale";
const FALLBACK: Locale = "en";

// ─── Dot-path resolver ────────────────────────────────────────────────────────

function resolve(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur === null || typeof cur !== "object") return path;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (typeof cur === "string") return cur;
  if (Array.isArray(cur)) return JSON.stringify(cur);
  return path;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(FALLBACK);

  // Hydrate from localStorage once on the client
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && stored in LOCALES) setLocaleState(stored);
    } catch {
      // localStorage may be unavailable (SSR safety)
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const dict = LOCALES[locale] as Record<string, unknown>;
      let value = resolve(dict, key);

      // Fallback to English if key is missing
      if (value === key) {
        const fallbackDict = LOCALES[FALLBACK] as Record<string, unknown>;
        value = resolve(fallbackDict, key);
      }

      // Variable interpolation: {varName} → value
      if (vars) {
        value = value.replace(/\{(\w+)\}/g, (_, k) =>
          vars[k] !== undefined ? String(vars[k]) : `{${k}}`
        );
      }

      return value;
    },
    [locale]
  );

  return createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
