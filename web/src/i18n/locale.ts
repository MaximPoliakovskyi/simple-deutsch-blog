export const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

function normalizeLocaleInput(value: string): string {
  const normalized = value.toLowerCase();
  return normalized === "ua" ? "uk" : normalized; // legacy alias mapping
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALE_SET.has(value);
}

export function coerceLocale(value: string): Locale {
  const normalized = normalizeLocaleInput(value);
  return isLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

export function assertLocale(value: string | undefined | null): Locale {
  if (!value) throw new Error("Missing locale");
  const normalized = normalizeLocaleInput(value);
  if (isLocale(normalized)) return normalized;
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
  const normalized = normalizeLocaleInput(m.groups.prefix);
  if (isLocale(normalized)) return normalized;
  return null;
}

export function defaultLocale(): Locale {
  return DEFAULT_LOCALE;
}
