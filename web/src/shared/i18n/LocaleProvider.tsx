"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getTranslations, type TranslationKey } from "@/shared/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";

type I18nContext = {
  locale: Locale;
  postLangLinks: PostLangLinks | null;
  setPostLangLinks: (links: PostLangLinks | null) => void;
  t: Translator;
};

export type SiteLang = Locale;

export type PostLangLinks = {
  currentLang: SiteLang;
  links: Record<SiteLang, string | null>;
};

type Translator = (key: TranslationKey, fallback?: string) => string;

const Context = createContext<I18nContext>({
  locale: DEFAULT_LOCALE,
  postLangLinks: null,
  setPostLangLinks: () => {},
  t: (key) => key,
});

export function LocaleProvider({
  children,
  locale: providedLocale,
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const [postLangLinks, setPostLangLinks] = useState<PostLangLinks | null>(null);
  const locale = providedLocale ?? DEFAULT_LOCALE;
  const dictionary = getTranslations(locale);
  const t: Translator = (key, fallback = key) => dictionary[key] ?? fallback;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <Context.Provider value={{ locale, postLangLinks, setPostLangLinks, t }}>
      {children}
    </Context.Provider>
  );
}

export function useI18n() {
  return useContext(Context);
}
