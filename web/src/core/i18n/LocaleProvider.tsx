"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";

type I18nContext = {
  locale: Locale;
  t: Translator;
  postLangLinks: PostLangLinks | null;
  setPostLangLinks: (links: PostLangLinks | null) => void;
};

export type SiteLang = Locale;

export type PostLangLinks = {
  currentLang: SiteLang;
  links: Record<SiteLang, string | null>;
};

type Translator = (k: string) => string;

const Context = createContext<I18nContext>({
  locale: DEFAULT_LOCALE,
  t: (k) => k,
  postLangLinks: null,
  setPostLangLinks: () => {},
});

export function LocaleProvider({
  children,
  locale: providedLocale,
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const [postLangLinks, setPostLangLinks] = useState<PostLangLinks | null>(null);

  const locale: Locale = providedLocale ?? DEFAULT_LOCALE;

  if (process.env.NODE_ENV !== "production" && !providedLocale) {
    // Developer reminder: locale should be resolved server-side and passed in explicitly
    // Avoid keeping implicit client-side detection.
    // eslint-disable-next-line no-console
    console.warn(
      "LocaleProvider: no locale provided — falling back to DEFAULT_LOCALE. Pass explicit locale (server-resolved).",
    );
  }

  // set html lang attribute on mount/update
  useEffect(() => {
    try {
      const html = document.documentElement;
      if (!html) return;
      html.lang = locale === "uk" ? "uk" : locale === "ru" ? "ru" : "en";
    } catch (_e) {
      // noop
    }
  }, [locale]);

  const t = useMemo<Translator>(() => {
    const dict = TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
    return (k) => dict[k] || k;
  }, [locale]);

  return (
    <Context.Provider value={{ locale, t, postLangLinks, setPostLangLinks }}>
      {children}
    </Context.Provider>
  );
}

export function useI18n() {
  return useContext(Context);
}
