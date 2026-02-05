import { headers } from "next/headers";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";
import LatestPostsSlider from "./LatestPostsSlider";

type Props = {
  locale?: Locale;
};

async function getBaseUrl(): Promise<string> {
  // Prefer an explicit public base URL when available (local dev or prod)
  const envBase = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  if (envBase) return envBase.replace(/\/$/, "");

  const h = await headers();
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "");
  const proto = h.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
  if (!host) throw new Error("Cannot determine host for Latest posts slider fetch");
  return `${proto}://${host}`;
}

function normalizePosts(payload: unknown): WPPostCard[] {
  if (Array.isArray(payload)) return payload as WPPostCard[];
  if (payload && typeof payload === "object") {
    const maybe = payload as { posts?: unknown };
    if (Array.isArray(maybe.posts)) return maybe.posts as WPPostCard[];
  }
  return [];
}

async function getSliderPosts(locale?: Locale): Promise<WPPostCard[]> {
  const base = await getBaseUrl();
  const url = new URL("/api/posts", base);
  url.searchParams.set("first", "8");
  // Always include lang when provided to ensure language-scoped posts
  if (locale) url.searchParams.set("lang", locale);

  // Cache for 1 hour to avoid repeated fetches; use revalidate tag for ISR
  const res = await fetch(url.toString(), {
    next: { revalidate: 3600, tags: ["posts-slider"] },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return normalizePosts(json);
}

export default async function LatestPostsSliderServer({ locale }: Props = {}) {
  const posts = await getSliderPosts(locale);
  if (!posts.length) return null;
  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];
  // Estimate reading minutes and compute stable date/href server-side
  function estimateReadingMinutesFromContent(post: unknown): number | null {
    if (!post || typeof post !== "object") return null;
    const maybe = post as {
      readingMinutes?: unknown;
      content?: unknown;
      excerpt?: unknown;
    };

    if (typeof maybe.readingMinutes === "number") {
      return Math.max(1, Math.ceil(maybe.readingMinutes));
    }

    const html =
      (typeof maybe.content === "string" ? maybe.content : null) ??
      (typeof maybe.excerpt === "string" ? maybe.excerpt : null) ??
      "";
    if (!html) return null;
    const text = String(html).replace(/<[^>]+>/g, " ");
    const words = (text.trim().match(/\S+/g) ?? []).length;
    const MIN_WORDS_FOR_ESTIMATE = 40;
    if (words < MIN_WORDS_FOR_ESTIMATE) return null;
    return Math.max(1, Math.ceil(words / 200));
  }

  const mapped = posts.map((p) => {
    try {
      const minutes = estimateReadingMinutesFromContent(p);
      const dateText = p.date
        ? new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date(p.date))
        : null;
      const prefix = locale === "en" ? "" : `/${locale}`;
      const href = `${prefix}/posts/${p.slug}`;
      return { ...p, readingText: minutes ? `${minutes} ${t.minRead}` : null, dateText, href };
    } catch (_e) {
      const dateText = p.date
        ? new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date(p.date))
        : null;
      const prefix = locale === "en" ? "" : `/${locale}`;
      const href = `${prefix}/posts/${p.slug}`;
      return { ...p, readingText: null, dateText, href };
    }
  });

  return <LatestPostsSlider posts={mapped} title={t.latestPosts} />;
}
