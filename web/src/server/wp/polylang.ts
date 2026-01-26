export type PolylangTranslation = {
  id: number;
  slug: string;
  uri?: string;
};

export type PostLanguage = {
  code: "EN" | "RU" | "UK";
  slug: "en" | "ru" | "uk";
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
export const mapUiToGraphQLEnum = (
  locale: "en" | "ru" | "uk" | null | undefined
): "EN" | "RU" | "UK" => {
  if (!locale) return "EN";
  if (locale === "ru") return "RU";
  if (locale === "uk") return "UK";
  return "EN";
};

/**
 * Maps GraphQL language enum codes back to UI locale codes.
 */
export const mapGraphQLEnumToUi = (code: string | null | undefined): "en" | "ru" | "uk" => {
  if (!code) return "en";
  if (code === "RU") return "ru";
  if (code === "UK") return "uk";
  return "en";
};

// Safe parser for the Polylang translation JSON string
export function parseTranslations(
  raw: string | null | undefined
): Partial<Record<"en" | "ru" | "uk", PolylangTranslation>> {
  if (!raw || typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object") return {};

    const result: Partial<Record<"en" | "ru" | "uk", PolylangTranslation>> = {};
    const validLangs = ["en", "ru", "uk"] as const;
    
    for (const [lang, value] of Object.entries(parsed)) {
      if (!validLangs.includes(lang as any)) continue; // Ignore unknown locales
      if (!value || typeof value !== "object") continue;
      const maybeId = (value as any).id;
      const maybeSlug = (value as any).slug;
      const maybeUri = (value as any).uri;
      if (typeof maybeId !== "number") continue;
      if (typeof maybeSlug !== "string") continue;
      result[lang as "en" | "ru" | "uk"] = {
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
