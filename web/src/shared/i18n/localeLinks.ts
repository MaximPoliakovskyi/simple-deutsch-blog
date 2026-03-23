import { type Locale, parseLocaleFromPath } from "./locale";

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

export function stripLocalePrefix(pathname: string | null | undefined): string {
  const normalizedPathname = pathname || "/";
  const currentLocale = parseLocaleFromPath(normalizedPathname);
  if (!currentLocale) return normalizedPathname;

  const stripped = normalizedPathname.replace(new RegExp(`^/${currentLocale}(?=/|$)`), "");
  return stripped || "/";
}

export function buildLocalizedHref(
  targetLocale: Locale,
  pathname: string | null | undefined,
): string {
  const stripped = stripLocalePrefix(pathname);
  return stripped === "/" ? `/${targetLocale}` : `/${targetLocale}${stripped}`;
}

function parsePathInput(input: string): ParsedPathInput {
  const raw = input?.trim() || "/";
  const normalized =
    /^https?:\/\//.test(raw) || raw.startsWith("//")
      ? raw
      : `https://x${raw.startsWith("/") ? raw : `/${raw}`}`;

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    return { pathname: "/", search: "", hash: "" };
  }

  return {
    pathname: url.pathname || "/",
    search: url.search || "",
    hash: url.hash || "",
  };
}

function isPostDetailPath(strippedPathname: string): boolean {
  const segments = strippedPathname.split("/").filter(Boolean);
  return segments.length >= 2 && segments[0] === "posts";
}

function normalizeTranslatedPath(path: string, targetLocale: Locale): string {
  const translated = parsePathInput(path);
  return buildLocalizedHref(targetLocale, translated.pathname);
}

export function mapPathToLocale(
  pathname: string,
  targetLocale: Locale,
  opts: MapPathToLocaleOptions = {},
): string {
  const parsed = parsePathInput(pathname);
  const stripped = stripLocalePrefix(parsed.pathname);
  const fallbackPathname = buildLocalizedHref(
    targetLocale,
    parsePathInput(opts.fallbackPath ?? "/").pathname,
  );

  if (isPostDetailPath(stripped)) {
    const translatedPath = opts.translationMap?.[targetLocale];
    if (!translatedPath) return `${fallbackPathname}${parsed.search}${parsed.hash}`;

    const mappedPathname = normalizeTranslatedPath(translatedPath, targetLocale);
    if (mappedPathname === "/") return `${fallbackPathname}${parsed.search}${parsed.hash}`;
    return `${mappedPathname}${parsed.search}${parsed.hash}`;
  }

  return `${buildLocalizedHref(targetLocale, stripped)}${parsed.search}${parsed.hash}`;
}
