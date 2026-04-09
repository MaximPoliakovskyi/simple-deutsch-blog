/**
 * Shared helpers for Next.js API route handlers.
 * Provides consistent JSON response shapes and locale parsing.
 */

import { assertLocale, type Locale } from "@/lib/i18n";

// ── Locale parsing ───────────────────────────────────────────────────────

/**
 * Attempts to parse a locale from an arbitrary string value.
 * Returns `undefined` instead of throwing when the value is invalid.
 *
 * @example
 * tryParseLocale("ru") // "ru"
 * tryParseLocale("xx") // undefined
 */
export function tryParseLocale(value: string | null | undefined): Locale | undefined {
  if (!value) return undefined;
  try {
    return assertLocale(value);
  } catch {
    return undefined;
  }
}
