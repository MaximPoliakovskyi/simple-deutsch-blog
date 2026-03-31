"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  type Locale,
  type PostLangLinks,
  type SiteLang,
  TRANSLATIONS,
} from "@/lib/i18n";

type Translator = (key: string) => string;

export type I18nContextValue = {
  locale: Locale;
  t: Translator;
  postLangLinks: PostLangLinks | null;
  setPostLangLinks: (links: PostLangLinks | null) => void;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: (key) => key,
  postLangLinks: null,
  setPostLangLinks: () => {},
});

type LocaleProviderProps = {
  children: ReactNode;
  locale?: Locale;
};

export function LocaleProvider({ children, locale: providedLocale }: LocaleProviderProps) {
  const [postLangLinks, setPostLangLinks] = useState<PostLangLinks | null>(null);
  const locale = providedLocale ?? DEFAULT_LOCALE;

  useEffect(() => {
    const html = document.documentElement;
    if (!html) {
      return;
    }

    html.lang = locale === "uk" ? "uk" : locale === "ru" ? "ru" : "en";
  }, [locale]);

  const t = useMemo<Translator>(() => {
    const dictionary = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
    return (key) => dictionary[key] ?? key;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t, postLangLinks, setPostLangLinks }),
    [locale, t, postLangLinks],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const I18nProvider = LocaleProvider;

export function useI18n() {
  return useContext(I18nContext);
}

export function useTranslation() {
  const { t } = useI18n();
  return t;
}

export type { PostLangLinks, SiteLang };

export default function Providers({
  children,
  locale: _locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return <>{children}</>;
}
