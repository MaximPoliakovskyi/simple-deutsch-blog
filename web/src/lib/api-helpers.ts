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

// ── Response helpers ─────────────────────────────────────────────────────

type ApiErrorBody = {
  data: null;
  error: { code: string; message: string };
};

/**
 * Returns a typed JSON error response with a consistent shape.
 *
 * @example return apiErrorResponse("Failed to fetch posts", 500);
 */
export function apiErrorResponse(
  message: string,
  status: number,
  code = "INTERNAL_ERROR",
): Response {
  const body: ApiErrorBody = { data: null, error: { code, message } };
  return Response.json(body, { status });
}

/**
 * Extracts a human-readable message from an unknown thrown value.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}
