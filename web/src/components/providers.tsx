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

// ---------------------------------------------------------------------------
// I18nContext — locale + translator only (no postLangLinks to prevent
// global re-renders when a post page updates the language-switch links).
// ---------------------------------------------------------------------------

export type I18nContextValue = {
  locale: Locale;
  t: Translator;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: (key) => key,
});

// ---------------------------------------------------------------------------
// PostLangLinksContext — narrowly scoped so only the navigation language
// switcher re-renders when post translation links are set.
// ---------------------------------------------------------------------------

export type PostLangLinksContextValue = {
  postLangLinks: PostLangLinks | null;
  setPostLangLinks: (links: PostLangLinks | null) => void;
};

const PostLangLinksContext = createContext<PostLangLinksContextValue>({
  postLangLinks: null,
  setPostLangLinks: () => {},
});

// ---------------------------------------------------------------------------
// LocaleProvider — wraps both contexts so existing layout code is unchanged.
// ---------------------------------------------------------------------------

type LocaleProviderProps = {
  children: ReactNode;
  locale?: Locale;
};

export function LocaleProvider({ children, locale: providedLocale }: LocaleProviderProps) {
  const locale = providedLocale ?? DEFAULT_LOCALE;
  const [postLangLinks, setPostLangLinks] = useState<PostLangLinks | null>(null);

  // html[lang] is set by the inline script in [locale]/layout.tsx before
  // hydration; this effect keeps it in sync on soft navigations.
  useEffect(() => {
    document.documentElement.lang = locale === "uk" ? "uk" : locale === "ru" ? "ru" : "en";
  }, [locale]);

  const t = useMemo<Translator>(() => {
    const dictionary = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
    return (key) => dictionary[key] ?? key;
  }, [locale]);

  const i18nValue = useMemo<I18nContextValue>(() => ({ locale, t }), [locale, t]);

  const postLangLinksValue = useMemo<PostLangLinksContextValue>(
    () => ({ postLangLinks, setPostLangLinks }),
    [postLangLinks],
  );

  return (
    <I18nContext.Provider value={i18nValue}>
      <PostLangLinksContext.Provider value={postLangLinksValue}>
        {children}
      </PostLangLinksContext.Provider>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function usePostLangLinks() {
  return useContext(PostLangLinksContext);
}

export type { PostLangLinks, SiteLang };
