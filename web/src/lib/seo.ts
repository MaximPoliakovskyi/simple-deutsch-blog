import type { Metadata } from "next";
import { DEFAULT_LOCALE, type Locale, parseLocaleFromPath, SUPPORTED_LOCALES } from "@/lib/i18n";
import { toAbsoluteSiteUrl } from "@/lib/site-url";

export type LocaleTranslationMap = Partial<Record<Locale, string | null>>;

type MapPathToLocaleOptions = {
  fallbackPath?: string;
  translationMap?: LocaleTranslationMap | null;
};

function toAbsoluteUrl(pathname: string): string {
  return toAbsoluteSiteUrl(pathname);
}

type ParsedPathInput = {
  hash: string;
  pathname: string;
  search: string;
};

function parsePathInput(input: string): ParsedPathInput {
  const raw = input?.trim() || "/";
  const normalized = /^https?:\/\//.test(raw)
    ? raw
    : `https://x${raw.startsWith("/") ? raw : `/${raw}`}`;
  const url = new URL(normalized);

  return {
    hash: url.hash || "",
    pathname: url.pathname || "/",
    search: url.search || "",
  };
}

function stripLocalePrefix(pathname: string): string {
  const currentLocale = parseLocaleFromPath(pathname);
  if (!currentLocale) {
    return pathname || "/";
  }

  const stripped = pathname.replace(new RegExp(`^/${currentLocale}(?=/|$)`), "");
  return stripped || "/";
}

function withLocalePrefix(pathname: string, targetLocale: Locale): string {
  const stripped = stripLocalePrefix(pathname);
  return stripped === "/" ? `/${targetLocale}` : `/${targetLocale}${stripped}`;
}

function isPostDetailPath(strippedPathname: string): boolean {
  const segments = strippedPathname.split("/").filter(Boolean);
  return segments.length >= 2 && (segments[0] === "articles" || segments[0] === "posts");
}

function isLevelDetailPath(strippedPathname: string): boolean {
  const segments = strippedPathname.split("/").filter(Boolean);
  return segments.length >= 2 && (segments[0] === "levels" || segments[0] === "tags");
}

function normalizeTranslatedPath(path: string, targetLocale: Locale): string {
  return withLocalePrefix(parsePathInput(path).pathname, targetLocale);
}

/**
 * Maps a pathname to its equivalent in the target locale.
 * Handles translated detail paths (using translation map) and general routes (prefix swap).
 */
export function mapPathToLocale(
  pathname: string,
  targetLocale: Locale,
  options: MapPathToLocaleOptions = {},
): string {
  const parsed = parsePathInput(pathname);
  const strippedPathname = stripLocalePrefix(parsed.pathname);
  const postDetail = isPostDetailPath(strippedPathname);
  const levelDetail = isLevelDetailPath(strippedPathname);
  const defaultFallbackPath = levelDetail ? `/${targetLocale}/levels` : `/${targetLocale}`;
  const fallbackPathname =
    parsePathInput(options.fallbackPath ?? defaultFallbackPath).pathname || defaultFallbackPath;

  if (postDetail || levelDetail) {
    const translatedPath = options.translationMap?.[targetLocale];
    if (!translatedPath) {
      return `${withLocalePrefix(strippedPathname, targetLocale)}${parsed.search}${parsed.hash}`;
    }

    return `${normalizeTranslatedPath(translatedPath, targetLocale)}${parsed.search}${parsed.hash}`;
  }

  return `${withLocalePrefix(strippedPathname, targetLocale)}${parsed.search}${parsed.hash}`;
}

/**
 * Builds `alternates` metadata for i18n SEO, including canonical URL
 * and hreflang entries for all supported locales plus `x-default`.
 */
export function buildI18nAlternates(
  pathname: string,
  currentLocale: Locale,
  options: { translationMap?: LocaleTranslationMap | null } = {},
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
