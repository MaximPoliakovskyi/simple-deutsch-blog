export const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";
const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

function normalizeLocaleInput(value: string): string {
  return value.toLowerCase();
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
