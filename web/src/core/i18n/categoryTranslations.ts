import type { Locale } from "@/i18n/locale";

type Translations = Partial<Record<Locale, string>>;

const MAP = {
  "exercises-practice": {
    en: "Exercises & Practice",
    uk: "Вправи та практика",
    ru: "Упражнения и практика",
  },
  grammar: {
    en: "Grammar",
    uk: "Граматика",
    ru: "Грамматика",
  },
  "success-stories": {
    en: "Success Stories",
    uk: "Історії успіху",
    ru: "Истории успеха",
  },
  "tips-motivation": {
    en: "Tips & Motivation",
    uk: "Поради та мотивація",
    ru: "Советы и мотивация",
  },
  blog: {
    en: "Blog",
    uk: "Блог",
    ru: "Блог",
  },
  vocabulary: {
    en: "Vocabulary",
    uk: "Словник",
    ru: "Словарь",
  },
  "speaking-pronunciation": {
    en: "Speaking & Pronunciation",
    uk: "Розмовна практика та вимова",
    ru: "Разговорная речь и произношение",
  },

  // Fallback keys by normalized English names.
  "exercises & practice": {
    en: "Exercises & Practice",
    uk: "Вправи та практика",
    ru: "Упражнения и практика",
  },
  "success stories": {
    en: "Success Stories",
    uk: "Історії успіху",
    ru: "Истории успеха",
  },
  "tips & motivation": {
    en: "Tips & Motivation",
    uk: "Поради та мотивація",
    ru: "Советы и мотивация",
  },
  exercises: {
    en: "Exercises & Practice",
    uk: "Вправи та практика",
    ru: "Упражнения и практика",
  },
  speaking: {
    en: "Speaking & Pronunciation",
    uk: "Розмовна практика та вимова",
    ru: "Разговорная речь и произношение",
  },
  tips: {
    en: "Tips & Motivation",
    uk: "Поради та мотивація",
    ru: "Советы и мотивация",
  },
  "tips-and-motivation": {
    en: "Tips & Motivation",
    uk: "Поради та мотивація",
    ru: "Советы и мотивация",
  },
} satisfies Record<string, Translations>;

const DESC_MAP = {
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
  exercises: {
    en: "Interactive tasks and quizzes to test your German grammar, vocabulary, and listening skills.",
    uk: "Інтерактивні вправи та тести для практики німецької граматики, словникового запасу та аудіювання.",
    ru: "Интерактивные задания и тесты для практики немецкой грамматики, словарного запаса и аудирования.",
  },
  speaking: {
    en: "Improve speaking confidence and pronunciation with practical dialogue-focused content.",
    uk: "Покращуйте вимову та впевненість у мовленні за допомогою практичних діалогів.",
    ru: "Улучшайте произношение и уверенность в речи с помощью практических диалогов.",
  },
  tips: {
    en: "Advice, strategies, and motivation to stay consistent while learning German.",
    uk: "Поради, стратегії та мотивація, щоб стабільно вивчати німецьку.",
    ru: "Советы, стратегии и мотивация, чтобы регулярно учить немецкий.",
  },
  "tips-and-motivation": {
    en: "Advice, strategies, and motivation to stay consistent while learning German.",
    uk: "Поради, стратегії та мотивація, щоб стабільно вивчати німецьку.",
    ru: "Советы, стратегии и мотивация, чтобы регулярно учить немецкий.",
  },
} satisfies Record<string, Translations>;

function makeLookupVariants(s: string | undefined | null) {
  if (!s) return [] as string[];
  const raw = String(s).trim().toLowerCase();
  const stripped = raw.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const hyphen = stripped.replace(/\s+/g, "-");
  const ampRemoved = raw
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
  const ampHyphen = ampRemoved.replace(/\s+/g, "-");
  return Array.from(new Set([raw, stripped, hyphen, ampRemoved, ampHyphen]));
}

function extractLeadingSymbols(s: string | undefined | null) {
  if (!s) return "";
  const str = String(s);
  let prefix = "";
  for (const ch of str) {
    if (/\p{L}|\p{N}/u.test(ch)) break;
    prefix += ch;
  }
  return prefix.replace(/\s+$/u, "");
}

export function translateCategory(
  name?: string | null,
  slug?: string | null,
  locale: Locale = "en",
) {
  const safeLocale = locale === "uk" || locale === "ru" ? locale : "en";
  const emojiPrefix = extractLeadingSymbols(name ?? slug ?? "");

  const slugCandidates = makeLookupVariants(slug);
  for (const key of slugCandidates) {
    const entry = MAP[key as keyof typeof MAP];
    if (key && entry && entry[safeLocale]) {
      return `${emojiPrefix} ${String(entry[safeLocale]).trimStart()}`;
    }
  }

  const nameCandidates = makeLookupVariants(name);
  for (const key of nameCandidates) {
    const entry = MAP[key as keyof typeof MAP];
    if (key && entry && entry[safeLocale]) {
      return `${emojiPrefix} ${String(entry[safeLocale]).trimStart()}`;
    }
  }

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
  const safeLocale = locale === "uk" || locale === "ru" ? locale : "en";
  const slugCandidates = makeLookupVariants(slug);
  for (const key of slugCandidates) {
    const entry = DESC_MAP[key as keyof typeof DESC_MAP];
    if (key && entry && entry[safeLocale]) return String(entry[safeLocale]).trim();
  }

  const nameCandidates = makeLookupVariants(original);
  for (const key of nameCandidates) {
    const entry = DESC_MAP[key as keyof typeof DESC_MAP];
    if (key && entry && entry[safeLocale]) return String(entry[safeLocale]).trim();
  }

  return undefined;
}

export default MAP;
