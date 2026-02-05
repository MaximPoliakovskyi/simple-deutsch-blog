import { isLocale, type Locale, SUPPORTED_LOCALES } from "@/i18n/locale";

export type PolylangTranslation = {
  id: number;
  slug: string;
  uri?: string;
};

export type PostLanguage = {
  code: "EN" | "RU" | "UK";
  slug: Locale;
  locale: string;
};

export type PostTranslation = {
  databaseId: number;
  slug: string;
  uri: string;
  language: PostLanguage;
};

/**
 * Maps UI locale codes (en, ru, uk) to GraphQL language enum codes (EN, RU, UK).
 * This is the primary mapping function for list page language filtering.
 */
export const mapUiToGraphQLEnum = (locale: Locale | null | undefined): "EN" | "RU" | "UK" => {
  if (!locale) return "EN";
  if (locale === "ru") return "RU";
  if (locale === "uk") return "UK";
  return "EN";
};

/**
 * Maps GraphQL language enum codes back to UI locale codes.
 */
export const mapGraphQLEnumToUi = (code: string | null | undefined): Locale => {
  if (!code) return "en";
  if (code === "RU") return "ru";
  if (code === "UK") return "uk";
  return "en";
};

// Safe parser for the Polylang translation JSON string
export function parseTranslations(
  raw: string | null | undefined,
): Partial<Record<Locale, PolylangTranslation>> {
  if (!raw || typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object") return {};

    const result: Partial<Record<Locale, PolylangTranslation>> = {};
    const validLangSet = new Set<Locale>(SUPPORTED_LOCALES);

    for (const [lang, value] of Object.entries(parsed)) {
      if (!isLocale(lang) || !validLangSet.has(lang)) continue; // Ignore unknown locales
      if (!value || typeof value !== "object") continue;
      const obj = value as Record<string, unknown>;
      const maybeId = obj.id;
      const maybeSlug = obj.slug;
      const maybeUri = obj.uri;
      if (typeof maybeId !== "number") continue;
      if (typeof maybeSlug !== "string") continue;
      result[lang] = {
        id: maybeId,
        slug: maybeSlug,
        uri: typeof maybeUri === "string" ? maybeUri : undefined,
      };
    }
    return result;
  } catch {
    return {};
  }
}
