import { DEFAULT_LOCALE, type Locale, parseLocaleFromPath } from "./locale";

export type LocaleTranslationMap = Partial<Record<Locale, string | null>>;

type MapPathToLocaleOptions = {
  translationMap?: LocaleTranslationMap | null;
  fallbackPath?: string;
};

type ParsedPathInput = {
  pathname: string;
  search: string;
  hash: string;
};

function parsePathInput(input: string): ParsedPathInput {
  const raw = input?.trim() || "/";
  const normalized = /^https?:\/\//.test(raw)
    ? raw
    : `https://x${raw.startsWith("/") ? raw : `/${raw}`}`;
  const url = new URL(normalized);
  return {
    pathname: url.pathname || "/",
    search: url.search || "",
    hash: url.hash || "",
  };
}

function stripLocalePrefix(pathname: string): string {
  const normalizedPathname = pathname || "/";
  const currentLocale = parseLocaleFromPath(normalizedPathname);
  if (!currentLocale) return normalizedPathname;
  const stripped = normalizedPathname.replace(new RegExp(`^/${currentLocale}(?=/|$)`), "");
  return stripped || "/";
}

function withLocalePrefix(pathname: string, targetLocale: Locale): string {
  const stripped = stripLocalePrefix(pathname);
  return stripped === "/" ? `/${targetLocale}` : `/${targetLocale}${stripped}`;
}

function isPostDetailPath(strippedPathname: string): boolean {
  const segments = strippedPathname.split("/").filter(Boolean);
  return segments.length >= 2 && segments[0] === "posts";
}

function isSearchPath(strippedPathname: string): boolean {
  const segments = strippedPathname.split("/").filter(Boolean);
  return segments.length > 0 && segments[0] === "search";
}

function normalizeTranslatedPath(path: string, targetLocale: Locale): string {
  const translated = parsePathInput(path);
  // IMPORTANT: ensure exactly one targetLocale prefix (avoid /ru/ru/...)
  return withLocalePrefix(translated.pathname, targetLocale);
}

/**
 * Deterministically map a route path (optionally with query/hash) to the target locale.
 *
 * Rules:
 * - Post detail routes use translationMap when available.
 * - Missing post translation falls back to locale home (or opts.fallbackPath).
 * - Search query string is preserved.
 * - Other routes preserve path segments and switch locale prefix only.
 * - Query + hash are always preserved.
 */
export function mapPathToLocale(
  pathname: string,
  targetLocale: Locale,
  opts: MapPathToLocaleOptions = {},
): string {
  const parsed = parsePathInput(pathname);
  const stripped = stripLocalePrefix(parsed.pathname);

  const fallbackPathname =
    parsePathInput(opts.fallbackPath ?? `/${targetLocale}`).pathname || `/${targetLocale}`;

  if (isPostDetailPath(stripped)) {
    const translatedPath = opts.translationMap?.[targetLocale];
    if (!translatedPath) return `${fallbackPathname}${parsed.search}${parsed.hash}`;
    return `${normalizeTranslatedPath(translatedPath, targetLocale)}${parsed.search}${parsed.hash}`;
  }

  const mappedPath = withLocalePrefix(stripped, targetLocale);

  // Search route: keep query/hash (already appended below); explicit branch kept for clarity.
  if (isSearchPath(stripped)) {
    return `${mappedPath}${parsed.search}${parsed.hash}`;
  }

  return `${mappedPath}${parsed.search}${parsed.hash}`;
}

export function mapPathToDefaultLocale(
  pathname: string,
  opts: MapPathToLocaleOptions = {},
): string {
  return mapPathToLocale(pathname, DEFAULT_LOCALE, opts);
}
