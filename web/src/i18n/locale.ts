export const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function assertLocale(value: string | undefined | null): Locale {
  if (!value) throw new Error("Missing locale");
  const v = value.toLowerCase();
  if (v === "ua") return "uk"; // legacy alias mapping
  if (v === "en" || v === "ru" || v === "uk") return v as Locale;
  throw new Error(`Unsupported locale: ${value}`);
}

/**
 * Parse a locale prefix from a pathname.
 * Examples:
 *  - "/en/posts" => "en"
 *  - "/ua/posts" => "uk" (legacy alias)
 *  - "/posts" => null
 */
export function parseLocaleFromPath(pathname: string | null | undefined): Locale | null {
  if (!pathname) return null;
  const m = pathname.match(/^\/(?<prefix>[a-zA-Z]{2})(?:\/|$)/);
  if (!m || !m.groups) return null;
  const p = m.groups.prefix.toLowerCase();
  if (p === "ua") return "uk";
  if (p === "en" || p === "ru" || p === "uk") return p as Locale;
  return null;
}

export function defaultLocale(): Locale {
  return DEFAULT_LOCALE;
}
