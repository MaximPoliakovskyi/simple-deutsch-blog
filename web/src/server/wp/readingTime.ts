import type { Locale } from "@/i18n/locale";

type ReadingLocale = Locale | "de" | string;

type ReadingTimeResult = {
  minutes: number;
  words: number;
  wordsPerMinute: number;
  text: string;
};

type ReadablePost = {
  content?: string | null;
  excerpt?: string | null;
};

const WORD_RE = /[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu;

function normalizeLocale(locale?: ReadingLocale | null): "en" | "de" | "ru" | "uk" {
  const normalized = String(locale ?? "en").toLowerCase();
  if (normalized === "ua") return "uk";
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uk")) return "uk";
  if (normalized.startsWith("de")) return "de";
  return "en";
}

function wordsPerMinuteForLocale(locale: "en" | "de" | "ru" | "uk"): number {
  if (locale === "en") return 220;
  return 200;
}

function decodeHtmlEntities(input: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };

  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (full, entity: string) => {
    const lower = entity.toLowerCase();
    if (lower.startsWith("#x")) {
      const value = Number.parseInt(lower.slice(2), 16);
      return Number.isFinite(value) ? String.fromCodePoint(value) : full;
    }
    if (lower.startsWith("#")) {
      const value = Number.parseInt(lower.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : full;
    }
    return named[lower] ?? full;
  });
}

function htmlToVisibleText(html: string): string {
  const withoutCode = html
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, " ")
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, " ");

  const withoutNonContent = withoutCode
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");

  const textOnly = withoutNonContent.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(textOnly);
  return decoded.replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  const matches = text.match(WORD_RE);
  return matches?.length ?? 0;
}

function pluralRuUk(value: number): "one" | "few" | "many" {
  const n10 = value % 10;
  const n100 = value % 100;
  if (n10 === 1 && n100 !== 11) return "one";
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "few";
  return "many";
}

function formatReadingTime(minutes: number, locale: "en" | "de" | "ru" | "uk"): string {
  if (locale === "de") return `${minutes} Min. Lesezeit`;
  if (locale === "ru") {
    const form = pluralRuUk(minutes);
    const unit =
      form === "one"
        ? "\u043c\u0438\u043d\u0443\u0442\u0430"
        : form === "few"
          ? "\u043c\u0438\u043d\u0443\u0442\u044b"
          : "\u043c\u0438\u043d\u0443\u0442";
    return `${minutes} ${unit} \u0447\u0442\u0435\u043d\u0438\u044f`;
  }
  if (locale === "uk") {
    const form = pluralRuUk(minutes);
    const unit =
      form === "one"
        ? "\u0445\u0432\u0438\u043b\u0438\u043d\u0430"
        : form === "few"
          ? "\u0445\u0432\u0438\u043b\u0438\u043d\u0438"
          : "\u0445\u0432\u0438\u043b\u0438\u043d";
    return `${minutes} ${unit} \u0447\u0438\u0442\u0430\u043d\u043d\u044f`;
  }
  return `${minutes} min read`;
}

export function calculateReadingTimeFromHtml(
  html: string,
  locale?: ReadingLocale | null,
): ReadingTimeResult {
  const normalizedLocale = normalizeLocale(locale);
  const wordsPerMinute = wordsPerMinuteForLocale(normalizedLocale);
  const words = countWords(htmlToVisibleText(html));
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  return {
    minutes,
    words,
    wordsPerMinute,
    text: formatReadingTime(minutes, normalizedLocale),
  };
}

export function withReadingTime<T extends ReadablePost>(post: T, locale?: ReadingLocale | null) {
  const sourceHtml = post.content ?? post.excerpt ?? "";
  const reading = calculateReadingTimeFromHtml(String(sourceHtml), locale);
  return {
    ...post,
    readingMinutes: reading.minutes,
    readingWords: reading.words,
    readingWordsPerMinute: reading.wordsPerMinute,
    readingText: reading.text,
  };
}

export function withReadingTimeForList<T extends ReadablePost>(
  posts: T[],
  locale?: ReadingLocale | null,
) {
  return posts.map((post) => withReadingTime(post, locale));
}
