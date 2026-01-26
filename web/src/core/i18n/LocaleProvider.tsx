"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/core/i18n/i18n";

type I18nContext = {
  locale: Locale;
  t: Translator;
  postLangLinks: PostLangLinks | null;
  setPostLangLinks: (links: PostLangLinks | null) => void;
};

export type SiteLang = "en" | "ru" | "uk";

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

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [postLangLinks, setPostLangLinks] = useState<PostLangLinks | null>(null);

  const locale: Locale = pathname?.startsWith("/ru")
    ? "ru"
    : pathname?.startsWith("/uk")
      ? "uk"
      : "en";

  // set html lang attribute on mount/update
  useEffect(() => {
    try {
      const html = document.documentElement;
      if (!html) return;
      if (locale === "uk")
        html.lang = "uk"; // Ukrainian language code
      else if (locale === "ru") html.lang = "ru";
      else html.lang = "en";
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
