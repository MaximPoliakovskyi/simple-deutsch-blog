// Minimal translations for the site. Add keys as needed.
import contentEn from "@/lib/content/i18n/en.json";
import contentRu from "@/lib/content/i18n/ru.json";
import contentUk from "@/lib/content/i18n/uk.json";
import en from "@/lib/i18n/en";
import ru from "@/lib/i18n/ru";
import uk from "@/lib/i18n/uk";

export const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

type Translations = Record<string, string>;
export type TranslationDictionary = Translations;

function normalizeLocaleInput(value: string): string {
  const normalized = value.toLowerCase();
  return normalized === "ua" ? "uk" : normalized;
}

/** Checks whether a value is one of the supported locale codes. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALE_SET.has(value);
}

/** Converts an arbitrary string to a supported locale, falling back to `DEFAULT_LOCALE`. */
export function coerceLocale(value: string): Locale {
  const normalized = normalizeLocaleInput(value);
  return isLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

/** Asserts that `value` is a valid locale. Throws if missing or unsupported. */
export function assertLocale(value: string | undefined | null): Locale {
  if (!value) {
    throw new Error("Missing locale");
  }

  const normalized = normalizeLocaleInput(value);
  if (isLocale(normalized)) {
    return normalized;
  }

  throw new Error(`Unsupported locale: ${value}`);
}

export function parseLocaleFromPath(pathname: string | null | undefined): Locale | null {
  if (!pathname) {
    return null;
  }

  const match = pathname.match(/^\/(?<prefix>[a-zA-Z]{2})(?:\/|$)/);
  if (!match?.groups?.prefix) {
    return null;
  }

  const normalized = normalizeLocaleInput(match.groups.prefix);
  return isLocale(normalized) ? normalized : null;
}

export function defaultLocale(): Locale {
  return DEFAULT_LOCALE;
}

// Merge content JSON translations into locale dictionaries
type GroupedTranslations = Record<string, Record<string, string>>;

function flattenGroupedTranslations(grouped: GroupedTranslations): Translations {
  const flat: Translations = {};
  for (const [group, entries] of Object.entries(grouped)) {
    for (const [key, value] of Object.entries(entries)) {
      flat[`${group}.${key}`] = value;
    }
  }
  return flat;
}

Object.assign(en, flattenGroupedTranslations(contentEn as GroupedTranslations));
Object.assign(ru, flattenGroupedTranslations(contentRu as GroupedTranslations));
Object.assign(uk, flattenGroupedTranslations(contentUk as GroupedTranslations));

export const CEFR_LEVEL_CODES = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevelCode = (typeof CEFR_LEVEL_CODES)[number];

export const CEFR_LEVEL_LABELS: Record<Locale, Record<CefrLevelCode, string>> = {
  en: {
    A1: "A1 - Beginner",
    A2: "A2 - Elementary",
    B1: "B1 - Intermediate",
    B2: "B2 - Upper-Intermediate",
    C1: "C1 - Advanced",
    C2: "C2 - Proficient",
  },
  uk: {
    A1: "A1 - Початковий",
    A2: "A2 - Елементарний",
    B1: "B1 - Середній",
    B2: "B2 - Вище середнього",
    C1: "C1 - Просунутий",
    C2: "C2 - Вільне володіння",
  },
  ru: {
    A1: "A1 - Начальный",
    A2: "A2 - Элементарный",
    B1: "B1 - Средний",
    B2: "B2 - Выше среднего",
    C1: "C1 - Продвинутый",
    C2: "C2 - Свободное владение",
  },
};

export function getCefrLevelLabel(locale: Locale, level: CefrLevelCode): string {
  return CEFR_LEVEL_LABELS[locale]?.[level] ?? CEFR_LEVEL_LABELS[DEFAULT_LOCALE][level];
}

export const TRANSLATIONS: Record<Locale, Translations> = { en, uk, ru };

const _missingKeyWarned = new Set<string>();

function withMissingKeyDetection(
  dict: TranslationDictionary,
  locale: string,
): TranslationDictionary {
  if (process.env.NODE_ENV === "production") return dict;
  return new Proxy(dict, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && !(prop in target) && !prop.startsWith("__")) {
        const cacheKey = `${locale}:${prop}`;
        if (!_missingKeyWarned.has(cacheKey)) {
          _missingKeyWarned.add(cacheKey);
          console.warn(`[i18n] Missing key "${prop}" for locale "${locale}"`);
        }
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

export function getTranslations(locale: Locale = DEFAULT_LOCALE): TranslationDictionary {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
  return withMissingKeyDetection(dict, locale);
}

export function formatTranslation(
  template: string | null | undefined,
  values: Record<string, number | string>,
): string {
  if (typeof template !== "string") {
    return "";
  }

  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

const INTL_LOCALE_BY_LOCALE: Record<Locale, string> = {
  en: "en-US",
  ru: "ru-RU",
  uk: "uk-UA",
};

export function getIntlLocale(locale: Locale): string {
  return INTL_LOCALE_BY_LOCALE[locale];
}

export function formatLocalizedDate(
  value: Date | string | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "long" },
): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), options).format(date);
}

export function formatLongDate(
  value: Date | string | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {},
): string | null {
  return formatLocalizedDate(value, locale, { dateStyle: "long", ...options });
}

export function formatPostCardDate(
  value: Date | string | null | undefined,
  locale: Locale,
): string | null {
  return formatLongDate(value, locale, { timeZone: "UTC" });
}

export function formatReadingTime(
  minutes: number | null | undefined,
  locale: Locale,
): string | null {
  if (!Number.isFinite(minutes) || !minutes) {
    return null;
  }

  const safeMinutes = Math.max(1, Math.round(minutes));
  const dictionary = getTranslations(locale);

  if (locale === "en") {
    return (
      formatTranslation(dictionary["readingTime.other"], { count: safeMinutes }) ||
      `${safeMinutes} min read`
    );
  }

  const form = getSlavicPluralForm(safeMinutes);
  return (
    formatTranslation(dictionary[`readingTime.${form}`], { count: safeMinutes }) ||
    formatTranslation(dictionary["readingTime.other"], { count: safeMinutes }) ||
    `${safeMinutes}`
  );
}

export function resolveReadingTimeLabel(
  minutes: number | null | undefined,
  readingText: string | null | undefined,
  locale: Locale,
): string | null {
  const formatted = formatReadingTime(minutes, locale);
  if (formatted) {
    return formatted;
  }

  const fallback = typeof readingText === "string" ? readingText.trim() : "";
  return fallback || null;
}

function makeLookupVariants(value: string | undefined | null) {
  if (!value) {
    return [] as string[];
  }

  const raw = String(value).trim().toLowerCase();
  const stripped = raw.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return Array.from(
    new Set([
      raw,
      stripped,
      stripped.replace(/\s+/g, "-"),
      raw
        .replace(/&/g, "and")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim(),
      raw
        .replace(/&/g, "and")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim()
        .replace(/\s+/g, "-"),
    ]),
  );
}

function extractLeadingSymbols(value: string | undefined | null) {
  if (!value) {
    return "";
  }

  let prefix = "";
  for (const character of String(value)) {
    if (/\p{L}|\p{N}/u.test(character)) {
      break;
    }

    prefix += character;
  }

  return prefix.replace(/\s+$/u, "");
}

export function translateCategory(
  name?: string | null,
  slug?: string | null,
  locale: Locale = DEFAULT_LOCALE,
) {
  const safeLocale = locale === "uk" || locale === "ru" ? locale : "en";
  const emojiPrefix = extractLeadingSymbols(name ?? slug ?? "");

  for (const key of makeLookupVariants(slug)) {
    const translated = CATEGORY_TRANSLATIONS[key]?.[safeLocale];
    if (translated) {
      return `${emojiPrefix} ${translated}`.trim();
    }
  }

  for (const key of makeLookupVariants(name)) {
    const translated = CATEGORY_TRANSLATIONS[key]?.[safeLocale];
    if (translated) {
      return `${emojiPrefix} ${translated}`.trim();
    }
  }

  const original = name ?? slug ?? "";
  return emojiPrefix
    ? `${emojiPrefix} ${original.slice(emojiPrefix.length).trimStart()}`
    : original;
}

export function translateCategoryDescription(
  original?: string | null,
  slug?: string | null,
  locale: Locale = DEFAULT_LOCALE,
) {
  const safeLocale = locale === "uk" || locale === "ru" ? locale : "en";

  for (const key of makeLookupVariants(slug)) {
    const translated = CATEGORY_DESCRIPTIONS[key]?.[safeLocale];
    if (translated) {
      return translated;
    }
  }

  for (const key of makeLookupVariants(original)) {
    const translated = CATEGORY_DESCRIPTIONS[key]?.[safeLocale];
    if (translated) {
      return translated;
    }
  }

  return undefined;
}

type CategoryTranslations = Partial<Record<Locale, string>>;

/** Expand canonical entries with alias slugs pointing to the same translation. */
function withAliases(
  canonical: Record<string, CategoryTranslations>,
  aliases: Record<string, string>,
): Record<string, CategoryTranslations> {
  const result = { ...canonical };
  for (const [alias, target] of Object.entries(aliases)) {
    const entry = canonical[target];
    if (entry) result[alias] = entry;
  }
  return result;
}

const CATEGORY_ALIASES: Record<string, string> = {
  "exercises & practice": "exercises-practice",
  exercises: "exercises-practice",
  "success stories": "success-stories",
  "tips & motivation": "tips-motivation",
  tips: "tips-motivation",
  "tips-and-motivation": "tips-motivation",
  speaking: "speaking-pronunciation",
};

const CATEGORY_TRANSLATIONS = withAliases(
  {
    "exercises-practice": {
      en: "Exercises & Practice",
      uk: "Вправи та практика",
      ru: "Упражнения и практика",
    },
    grammar: { en: "Grammar", uk: "Граматика", ru: "Грамматика" },
    "success-stories": { en: "Success Stories", uk: "Історії успіху", ru: "Истории успеха" },
    "tips-motivation": {
      en: "Tips & Motivation",
      uk: "Поради та мотивація",
      ru: "Советы и мотивация",
    },
    blog: { en: "Blog", uk: "Блог", ru: "Блог" },
    vocabulary: { en: "Vocabulary", uk: "Словник", ru: "Словарь" },
    "speaking-pronunciation": {
      en: "Speaking & Pronunciation",
      uk: "Розмовна практика та вимова",
      ru: "Разговорная речь и произношение",
    },
  },
  CATEGORY_ALIASES,
);

const CATEGORY_DESCRIPTIONS = withAliases(
  {
    "exercises-practice": {
      en: "Interactive tasks and quizzes to test your German grammar, vocabulary, and listening skills.",
      uk: "Інтерактивні вправи та тести для практики німецької граматики, словникового запасу та аудіювання.",
      ru: "Интерактивные задания и тесты для практики немецкой грамматики, словарного запаса и аудирования.",
    },
    grammar: {
      en: "Clear explanations and examples for German grammar, from articles and cases to tenses.",
      uk: "Зрозумілі пояснення та приклади німецької граматики: від артиклів і відмінків до часів.",
      ru: "Понятные объяснения и примеры немецкой грамматики: от артиклей и падежей до времен.",
    },
    "success-stories": {
      en: "Stories and experiences from people who learned German as adults.",
      uk: "Історії та досвід людей, які вивчили німецьку в дорослому віці.",
      ru: "Истории и опыт людей, выучивших немецкий во взрослом возрасте.",
    },
    "tips-motivation": {
      en: "Advice, strategies, and motivation to stay consistent while learning German.",
      uk: "Поради, стратегії та мотивація, щоб стабільно вивчати німецьку.",
      ru: "Советы, стратегии и мотивация, чтобы регулярно учить немецкий.",
    },
    vocabulary: {
      en: "Themed vocabulary lists and practical phrases for daily communication.",
      uk: "Тематичні списки слів і практичні фрази для щоденного спілкування.",
      ru: "Тематические списки слов и практичные фразы для ежедневного общения.",
    },
    "speaking-pronunciation": {
      en: "Improve speaking confidence and pronunciation with practical dialogue-focused content.",
      uk: "Покращуйте вимову та впевненість у мовленні за допомогою практичних діалогів.",
      ru: "Улучшайте произношение и уверенность в речи с помощью практических диалогов.",
    },
  },
  CATEGORY_ALIASES,
);

type SlavicPluralForm = "few" | "many" | "one";

function getSlavicPluralForm(count: number): SlavicPluralForm {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "one";
  }

  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return "few";
  }

  return "many";
}

export function formatLocalizedPostCount(count: number, locale: Locale) {
  const dictionary = getTranslations(locale);

  if (locale === "en") {
    return `${count} ${count === 1 ? "article" : "articles"}`;
  }

  const form = getSlavicPluralForm(count);
  const fallback = form === "one" ? "стаття" : form === "few" ? "статті" : "статей";
  return `${count} ${dictionary[`post.count.${form}`] ?? fallback}`;
}

export function buildSearchMetadataCopy(locale: Locale, query?: string | null) {
  const dictionary = getTranslations(locale);
  const trimmedQuery = (query ?? "").trim();

  if (!trimmedQuery) {
    return {
      description: dictionary["search.meta.description"] ?? "Search articles.",
      title: dictionary.search ?? "Search",
    };
  }

  return {
    description:
      formatTranslation(dictionary["search.meta.descriptionWithQuery"], { query: trimmedQuery }) ||
      `Results for "${trimmedQuery}".`,
    title:
      formatTranslation(dictionary["search.meta.titleWithQuery"], { query: trimmedQuery }) ||
      `Search: ${trimmedQuery}`,
  };
}

export function buildLocalizedHref(target: Locale, pathname: string | null | undefined): string {
  const current = parseLocaleFromPath(pathname ?? "/");
  const stripped = current
    ? (pathname ?? "/").replace(new RegExp(`^/${current}(?=/|$)`), "") || "/"
    : (pathname ?? "/");
  const rest = stripped === "/" ? "" : stripped;
  return `/${target}${rest}`;
}

// -- i18n Provider (client-only) ---------------------------------------------
export type SiteLang = Locale;

export type PostLangLinks = {
  currentLang: SiteLang;
  links: Record<SiteLang, string | null>;
};
