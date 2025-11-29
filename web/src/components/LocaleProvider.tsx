"use client";

import { createContext, useContext, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TRANSLATIONS, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

type I18nContext = {
  locale: Locale;
  t: (k: string) => string;
};

const Context = createContext<I18nContext>({
  locale: DEFAULT_LOCALE,
  t: (k) => k,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const locale: Locale = pathname?.startsWith("/ru")
    ? "ru"
    : pathname?.startsWith("/ua")
    ? "ua"
    : "en";

  // set html lang attribute on mount/update
  useEffect(() => {
    try {
      const html = document.documentElement;
      if (!html) return;
      if (locale === "ua") html.lang = "uk"; // Ukrainian language code
      else if (locale === "ru") html.lang = "ru";
      else html.lang = "en";
    } catch (e) {
      // noop
    }
  }, [locale]);

  const t = useMemo(() => {
    const dict = TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
    return (k: string) => dict[k] || k;
  }, [locale]);

  return <Context.Provider value={{ locale, t }}>{children}</Context.Provider>;
}

export function useI18n() {
  return useContext(Context);
}
