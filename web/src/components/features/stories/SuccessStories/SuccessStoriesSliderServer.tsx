import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import type { Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";
import SuccessStoriesSlider from "./SuccessStoriesSlider";

type Props = {
  locale?: Locale;
};

function normalizePosts(payload: unknown): WPPostCard[] {
  if (Array.isArray(payload)) return payload as WPPostCard[];
  if (payload && typeof payload === "object") {
    const maybe = payload as { posts?: unknown };
    if (Array.isArray(maybe.posts)) return maybe.posts as WPPostCard[];
  }
  return [];
}

/** Fetch success stories posts and swap to translated versions if needed */
async function getSuccessStoryPosts(locale?: string): Promise<WPPostCard[]> {
  // Always fetch English success-stories first (they have the category)
  // Note: Categories use language-specific slugs (e.g., "success-stories" vs "success-stories-uk")
  const categorySlug =
    locale === "uk"
      ? "success-stories-uk"
      : locale === "ru"
        ? "success-stories-ru"
        : "success-stories";

  const url = new URL("/api/posts", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
  url.searchParams.set("first", "8");
  url.searchParams.set("category", categorySlug);
  if (locale) {
    url.searchParams.set("lang", locale);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return [];

  const json = await res.json();
  const posts = normalizePosts(json);

  return posts;
}

/** Server wrapper: fetch once, render the client slider. */
export default async function SuccessStoriesSliderServer({ locale }: Props = {}) {
  const posts = await getSuccessStoryPosts(locale);

  if (!posts.length) return null;

  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];

  // Prepare posts for rendering
  const preparedPosts = posts.map((p) => {
    // Estimate reading time from excerpt
    let minutes: number | null = null;
    const html = p.excerpt ?? "";
    if (html) {
      const text = String(html).replace(/<[^>]+>/g, " ");
      const words = (text.trim().match(/\S+/g) ?? []).length;
      if (words >= 40) {
        minutes = Math.max(1, Math.ceil(words / 200));
      }
    }

    // Format date
    const dateText = p.date
      ? new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US", {
          dateStyle: "long",
          timeZone: "UTC",
        }).format(new Date(p.date))
      : null;

    // Build href
    const prefix = locale === "en" ? "" : `/${locale}`;
    const href = `${prefix}/posts/${p.slug}`;

    return {
      ...p,
      readingText: minutes ? `${minutes} ${t.minRead}` : null,
      dateText,
      href,
    };
  });

  return (
    <SuccessStoriesSlider
      posts={preparedPosts}
      title={t.successStories}
      description={t.successStoriesDescription}
    />
  );
}
