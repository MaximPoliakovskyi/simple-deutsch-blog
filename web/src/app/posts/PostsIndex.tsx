import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { buildLocalizedHref } from "@/core/i18n/localeLinks";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import type { PostListItem, WPPostCard } from "@/server/wp/api";
import { getPostsIndex } from "@/server/wp/api";

const PAGE_SIZE = 3;

async function fetchFirstPage(lang?: Locale): Promise<{
  posts: Array<WPPostCard | PostListItem>;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  const res = await getPostsIndex({ first: PAGE_SIZE, after: null, locale: lang ?? undefined });
  return { posts: res.posts, pageInfo: res.pageInfo };
}

export default async function PostsIndex({ locale }: { locale?: Locale }) {
  const lang = locale ?? DEFAULT_LOCALE;
  const { posts, pageInfo } = await fetchFirstPage(lang);
  const t = TRANSLATIONS[lang];

  // Compute stable server-side labels and hrefs to avoid hydration mismatches
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

  const mappedPosts = posts.map((p) => {
    try {
      const minutes = estimateReadingMinutesFromContent(p);
      const dateText = p.date
        ? new Intl.DateTimeFormat(lang === "uk" ? "uk-UA" : lang === "ru" ? "ru-RU" : "en-US", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date(p.date))
        : null;
      const href = buildLocalizedHref(lang, `/posts/${p.slug}`);
      return { ...p, readingText: minutes ? `${minutes} ${t.minRead}` : null, dateText, href };
    } catch (_e) {
      const dateText = p.date
        ? new Intl.DateTimeFormat(lang === "uk" ? "uk-UA" : lang === "ru" ? "ru-RU" : "en-US", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date(p.date))
        : null;
      const href = buildLocalizedHref(lang, `/posts/${p.slug}`);
      return { ...p, readingText: null, dateText, href };
    }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{t.posts}</h1>
      <PostsGridWithPagination
        initialPosts={mappedPosts}
        initialPageInfo={pageInfo}
        pageSize={PAGE_SIZE}
        query={{ lang }}
      />
    </div>
  );
}
