import type { Locale } from "./i18n";

// Minimal mapping of category identifiers (slug preferred) to translated titles.
// Add or adjust entries to match your WordPress category slugs.
// Use the slug as the primary key; if slug is unknown use a normalized name.

type Translations = Partial<Record<Locale, string>>;

const MAP = {
  // example entries (update slugs to match your WordPress site)
  // keys here should be category slugs where possible
  "exercises-practice": {
    en: "Exercises & Practice",
    uk: "Вправи та практика",
    ru: "Упражнения и практика",
  },
  grammar: { en: "Grammar", uk: "Граматика", ru: "Грамматика" },
  "success-stories": { en: "Success stories", uk: "Історії успіху", ru: "Истории успеха" },
  "tips-motivation": {
    en: "Tips & Motivation",
    uk: "Поради та мотивація",
    ru: "Советы и мотивация",
  },
  blog: { en: "Blog", uk: "Блог", ru: "Блог" },
  vocabulary: { en: "Vocabulary", uk: "Словник", ru: "Словарь" },
  "speaking-pronunciation": {
    en: "Speaking & Pronunciation",
    uk: "Говоріння та вимова",
    ru: "Разговорная речь и произношение",
  },

  // Fallbacks by normalized english name (lowercase, spaces -> hyphen)
  "exercises & practice": {
    en: "Exercises & Practice",
    uk: "Вправи та практика",
    ru: "Упражнения и практика",
  },
  "success stories": { en: "Success stories", uk: "Історії успіху", ru: "Истории успеха" },
  "tips & motivation": {
    en: "Tips & Motivation",
    uk: "Поради та мотивація",
    ru: "Советы и мотивация",
  },
} satisfies Record<string, Translations>;

// Optional longer descriptions per category. Use the same lookup strategy
// as titles above. If a description is missing for a locale we fall back
// to the original WP-provided description (handled by callers).
const DESC_MAP = {
  "exercises-practice": {
    en: "Interactive tasks and quizzes to test your German grammar, vocabulary, and listening skills. Perfect for self-study and daily practice.",
    uk: "Інтерактивні вправи та тести для перевірки граматики, словникового запасу та навичок аудіювання німецької мови. Ідеально підходить для самостійного вивчення та щоденної практики.",
    ru: "Интерактивные задания и тесты для проверки вашей немецкой грамматики, словарного запаса и навыков аудирования. Отлично подходит для самостоятельного изучения и ежедневной практики.",
  },
  // common alternative slugs
  exercises: {
    en: "Interactive tasks and quizzes to test your German grammar, vocabulary, and listening skills. Perfect for self-study and daily practice.",
    uk: "Інтерактивні вправи та тести для перевірки граматики, словникового запасу та навичок аудіювання німецької мови. Ідеально підходить для самостійного вивчення та щоденної практики.",
    ru: "Интерактивные задания и тесты для проверки вашей немецкой грамматики, словарного запаса и навыков аудирования. Отлично подходит для самостоятельного изучения и ежедневной практики.",
  },
  grammar: {
    en: "Learn German grammar easily with clear explanations, examples, and simple rules. From articles and cases to tenses and sentence structure — everything you need.",
    uk: "Вивчайте німецьку граматику з простими поясненнями, прикладами та правилами. Від артиклів і відмінків до часів і структури речення — все необхідне.",
    ru: "Изучайте немецкую грамматику с понятными объяснениями, примерами и простыми правилами. От артиклей и падежей до времен и структуры предложений — всё, что нужно.",
  },
  "success-stories": {
    en: "Describes the experiences of people who learned German as adults",
    uk: "Описує досвід людей, які вчили німецьку дорослими",
    ru: "Описывает опыт людей, которые выучили немецкий во взрослом возрасте",
  },
  "tips-motivation": {
    en: "Advice, strategies, and motivation for learning German effectively. Stay consistent, inspired, and confident on your learning journey.",
    uk: "Поради, стратегії та мотивація для ефективного вивчення німецької. Залишайтеся послідовними, натхненними та впевненими у своїй подорожі навчання.",
    ru: "Советы, стратегии и мотивация для эффективного изучения немецкого. Оставайтесь последовательными, вдохновлёнными и уверенными в своём обучении.",
  },
  blog: {
    en: "Your blog category",
    uk: "Категорія блогу",
    ru: "Категория блога",
  },
  // alternative keys
  speaking: {
    en: "Improve your German speaking skills and pronunciation. Learn how to sound natural, practice dialogues, and gain confidence in real conversations.",
    uk: "Покращуйте свої розмовні навички та вимову німецької. Дізнайтеся, як звучати природно, практикуйте діалоги та набувайте впевненості у розмовах.",
    ru: "Улучшайте свои навыки разговорной речи и произношения на немецком. Учитесь звучать естественно, практикуйте диалоги и обретайте уверенность в реальных разговорах.",
  },
  vocabulary: {
    en: "Build your German vocabulary through themed word lists, practical expressions, and everyday phrases for travel, work, and daily life.",
    uk: "Розвивайте свій німецький словниковий запас за допомогою тематичних списків слів, практичних виразів та фраз на кожен день для подорожей, роботи та повсякденного життя.",
    ru: "Развивайте свой немецкий словарный запас с помощью тематических списков слов, практичных выражений и повседневных фраз для путешествий, работы и жизни.",
  },
  "speaking-pronunciation": {
    en: "Improve your German speaking skills and pronunciation. Learn how to sound natural, practice dialogues, and gain confidence in real conversations.",
    uk: "Покращуйте свої розмовні навички та вимову німецької. Дізнайтеся, як звучати природно, практикуйте діалоги та набувайте впевненості у розмовах.",
    ru: "Улучшайте свои навыки разговорной речи и произношения на немецком. Учитесь звучать естественно, практикуйте диалоги и обретайте уверенность в реальных разговорах.",
  },
  tips: {
    en: "Advice, strategies, and motivation for learning German effectively. Stay consistent, inspired, and confident on your learning journey.",
    uk: "Поради, стратегії та мотивація для ефективного вивчення німецької. Залишайтеся послідовними, натхненними та впевненими у своїй подорожі навчання.",
    ru: "Советы, стратегии и мотивация для эффективного изучения немецкого. Оставайтесь последовательными, вдохновлёнными и уверенными в своём обучении.",
  },
  "tips-and-motivation": {
    en: "Advice, strategies, and motivation for learning German effectively. Stay consistent, inspired, and confident on your learning journey.",
    uk: "Поради, стратегії та мотивація для ефективного вивчення німецької. Залишайтеся послідовними, натхненними та впевненими у своїй подорожі навчання.",
    ru: "Советы, стратегии и мотивация для эффективного изучения немецкого. Оставайтесь последовательными, вдохновлёнными и уверенными в своём обучении.",
  },
} satisfies Record<string, Translations>;

function makeLookupVariants(s: string | undefined | null) {
  if (!s) return [] as string[];
  const raw = String(s).trim().toLowerCase();
  // keep raw, and produce stripped (letters/numbers + spaces) and hyphen form
  // remove punctuation and symbols (including emoji) by keeping only letters/numbers
  // and replacing other chars with space. Use Unicode property escapes.
  const stripped = raw.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const hyphen = stripped.replace(/\s+/g, "-");
  // also try a simple ampersand removal variant
  const ampRemoved = raw
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
  const ampHyphen = ampRemoved.replace(/\s+/g, "-");
  const variants = Array.from(new Set([raw, stripped, hyphen, ampRemoved, ampHyphen]));
  return variants;
}

export function translateCategory(
  name?: string | null,
  slug?: string | null,
  locale: Locale = "en",
) {
  const safeLocale = (locale === "de" ? "en" : locale) as "en" | "ua" | "ru";
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
    const entry = MAP[k as keyof typeof MAP];
    if (k && entry && entry[safeLocale])
      return `${emojiPrefix} ${String(entry[safeLocale]).trimStart()}`;
  }

  const nameCandidates = makeLookupVariants(name);
  for (const k of nameCandidates) {
    const entry = MAP[k as keyof typeof MAP];
    if (k && entry && entry[safeLocale])
      return `${emojiPrefix} ${String(entry[safeLocale]).trimStart()}`;
  }

  // No translation found — fall back to the provided name or slug
  const original = name ?? slug ?? "";
  if (!emojiPrefix) return original;
  const core = original.slice(emojiPrefix.length).trimStart();
  return `${emojiPrefix} ${core}`;
}

export function translateCategoryDescription(
  original?: string | null,
  slug?: string | null,
  locale: Locale = "en",
) {
  const safeLocale = (locale === "de" ? "en" : locale) as "en" | "ua" | "ru";
  const slugCandidates = makeLookupVariants(slug);
  for (const k of slugCandidates) {
    const entry = DESC_MAP[k as keyof typeof DESC_MAP];
    if (k && entry && entry[safeLocale]) return String(entry[safeLocale]).trim();
  }

  const nameCandidates = makeLookupVariants(original);
  for (const k of nameCandidates) {
    const entry = DESC_MAP[k as keyof typeof DESC_MAP];
    if (k && entry && entry[safeLocale]) return String(entry[safeLocale]).trim();
  }

  // No translation found — return undefined so callers can fall back to WP description
  return undefined as string | undefined;
}

export default MAP;
