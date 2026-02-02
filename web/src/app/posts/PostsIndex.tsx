import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import type { PostListItem, WPPostCard } from "@/server/wp/api";
import { getPostsIndex } from "@/server/wp/api";
import type { Locale } from "@/i18n/locale";
import { buildLocalizedHref } from "@/core/i18n/localeLinks";

const PAGE_SIZE = 3;

type PageInfo = { hasNextPage: boolean; endCursor: string | null };

async function fetchFirstPage(
  lang?: Locale,
): Promise<{
  posts: Array<WPPostCard | PostListItem>;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  const res = await getPostsIndex({ first: PAGE_SIZE, after: null, locale: lang ?? undefined });
  return { posts: res.posts, pageInfo: res.pageInfo };
}

export default async function PostsIndex({ locale }: { locale?: Locale }) {
  const lang = locale ?? "en";
  const { posts, pageInfo } = await fetchFirstPage(lang);
  const t = TRANSLATIONS[lang ?? DEFAULT_LOCALE];

  // Compute stable server-side labels and hrefs to avoid hydration mismatches
  function estimateReadingMinutesFromContent(post: any): number | null {
    if (post.readingMinutes != null) return Math.max(1, Math.ceil(post.readingMinutes));
    const html = post.content ?? post.excerpt ?? "";
    if (!html) return null;
    const text = String(html).replace(/<[^>]+>/g, " ");
    const words = (text.trim().match(/\S+/g) ?? []).length;
    const MIN_WORDS_FOR_ESTIMATE = 40;
    if (words < MIN_WORDS_FOR_ESTIMATE) return null;
    return Math.max(1, Math.ceil(words / 200));
  }

  const mappedPosts = posts.map((p: any) => {
    try {
      const minutes = estimateReadingMinutesFromContent(p);
      const dateText = p.date
        ? new Intl.DateTimeFormat(lang === "uk" ? "uk-UA" : lang === "ru" ? "ru-RU" : "en-US", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date(p.date))
        : null;
      const href = buildLocalizedHref(lang === "en" ? "en" : (lang as any), `/posts/${p.slug}`);
      return { ...p, readingText: minutes ? `${minutes} ${t.minRead}` : null, dateText, href };
    } catch (e) {
      const dateText = p.date
        ? new Intl.DateTimeFormat(lang === "uk" ? "uk-UA" : lang === "ru" ? "ru-RU" : "en-US", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date(p.date))
        : null;
      const href = buildLocalizedHref(lang === "en" ? "en" : (lang as any), `/posts/${p.slug}`);
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
