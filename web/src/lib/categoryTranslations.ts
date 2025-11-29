import type { Locale } from "./i18n";

// Minimal mapping of category identifiers (slug preferred) to translated titles.
// Add or adjust entries to match your WordPress category slugs.
// Use the slug as the primary key; if slug is unknown use a normalized name.

type Translations = Partial<Record<Locale, string>>;

const MAP: Record<string, Translations> = {
  // example entries (update slugs to match your WordPress site)
  // keys here should be category slugs where possible
  "exercises-practice": { en: "Exercises & Practice", ua: "Вправи та практика", ru: "Упражнения и практика" },
  grammar: { en: "Grammar", ua: "Граматика", ru: "Грамматика" },
  "success-stories": { en: "Success stories", ua: "Історії успіху", ru: "Истории успеха" },
  "tips-motivation": { en: "Tips & Motivation", ua: "Поради та мотивація", ru: "Советы и мотивация" },
  blog: { en: "Blog", ua: "Блог", ru: "Блог" },
  vocabulary: { en: "Vocabulary", ua: "Словник", ru: "Словарь" },
  "speaking-pronunciation": { en: "Speaking & Pronunciation", ua: "Говоріння та вимова", ru: "Разговорная речь и произношение" },

  // Fallbacks by normalized english name (lowercase, spaces -> hyphen)
  "exercises & practice": { en: "Exercises & Practice", ua: "Вправи та практика", ru: "Упражнения и практика" },
  "success stories": { en: "Success stories", ua: "Історії успіху", ru: "Истории успеха" },
  "tips & motivation": { en: "Tips & Motivation", ua: "Поради та мотивація", ru: "Советы и мотивация" },
};


function makeLookupVariants(s: string | undefined | null) {
  if (!s) return [] as string[];
  const raw = String(s).trim().toLowerCase();
  // keep raw, and produce stripped (letters/numbers + spaces) and hyphen form
  // remove punctuation and symbols (including emoji) by keeping only letters/numbers
  // and replacing other chars with space. Use Unicode property escapes.
  const stripped = raw.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const hyphen = stripped.replace(/\s+/g, "-");
  // also try a simple ampersand removal variant
  const ampRemoved = raw.replace(/&/g, "and").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const ampHyphen = ampRemoved.replace(/\s+/g, "-");
  const variants = Array.from(new Set([raw, stripped, hyphen, ampRemoved, ampHyphen]));
  return variants;
}

export function translateCategory(name?: string | null, slug?: string | null, locale: Locale = "en") {
  // extract any leading emoji/symbol prefix from the original name so we
  // can re-attach it to translated labels (matches screenshot UX)
  function extractLeadingSymbols(s: string | undefined | null) {
    if (!s) return "";
    const str = String(s);
    let prefix = "";
    for (const ch of str) {
      // stop when we hit any letter or number
      if (/\p{L}|\p{N}/u.test(ch)) break;
      prefix += ch;
    }
    // Trim trailing whitespace from prefix
    return prefix.replace(/\s+$/u, "");
  }

  const emojiPrefix = extractLeadingSymbols(name ?? slug ?? "");

  const slugCandidates = makeLookupVariants(slug);
  for (const k of slugCandidates) {
    if (k && MAP[k] && MAP[k][locale]) return `${emojiPrefix} ${String(MAP[k][locale]).trimStart()}`;
  }

  const nameCandidates = makeLookupVariants(name);
  for (const k of nameCandidates) {
    if (k && MAP[k] && MAP[k][locale]) return `${emojiPrefix} ${String(MAP[k][locale]).trimStart()}`;
  }

  // No translation found — fall back to the provided name or slug
  const original = name ?? slug ?? "";
  if (!emojiPrefix) return original;
  const core = original.slice(emojiPrefix.length).trimStart();
  return `${emojiPrefix} ${core}`;
}

export default MAP;
