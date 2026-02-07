import type { Metadata } from "next";
import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from "./locale";
import { type LocaleTranslationMap, mapPathToLocale } from "./pathMapping";

function getSiteOrigin(): string {
  const fallback = "http://localhost:3000";
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return fallback;

  const normalizedInput = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(normalizedInput);
    return parsed.origin;
  } catch {
    return fallback;
  }
}

function toAbsoluteUrl(pathname: string): string {
  const fixedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(fixedPath, getSiteOrigin()).toString();
}

type BuildI18nAlternatesOptions = {
  translationMap?: LocaleTranslationMap | null;
};

export function buildI18nAlternates(
  pathname: string,
  currentLocale: Locale,
  options: BuildI18nAlternatesOptions = {},
): Metadata["alternates"] {
  const languages: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = toAbsoluteUrl(
      mapPathToLocale(pathname, locale, { translationMap: options.translationMap }),
    );
  }

  languages["x-default"] = toAbsoluteUrl(
    mapPathToLocale(pathname, DEFAULT_LOCALE, { translationMap: options.translationMap }),
  );

  return {
    canonical: toAbsoluteUrl(
      mapPathToLocale(pathname, currentLocale, { translationMap: options.translationMap }),
    ),
    languages,
  };
}
