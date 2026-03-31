import {
  buildLocalizedHref,
  DEFAULT_LOCALE,
  formatPostCardDate,
  type Locale,
  TRANSLATIONS,
} from "@/lib/i18n";
import { getPostsIndex, type PostListItem, type WPPostCard } from "@/lib/posts";
import PostsGridWithPagination from "@/components/posts-grid-with-pagination";

const PAGE_SIZE = 3;

async function fetchFirstPage(locale: Locale): Promise<{
  pageInfo: { endCursor: string | null; hasNextPage: boolean };
  posts: Array<WPPostCard | PostListItem>;
}> {
  const result = await getPostsIndex({ after: null, first: PAGE_SIZE, locale });
  return { pageInfo: result.pageInfo, posts: result.posts };
}

export default async function PostsIndex({ locale }: { locale?: Locale }) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const { posts, pageInfo } = await fetchFirstPage(effectiveLocale);
  const t = TRANSLATIONS[effectiveLocale];
  const mappedPosts = posts.map((post) => ({
    ...post,
    dateText: formatPostCardDate(post.date, effectiveLocale),
    href: buildLocalizedHref(effectiveLocale, `/posts/${post.slug}`),
    readingText: post.readingText ?? null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{t.posts}</h1>
      <PostsGridWithPagination
        initialPageInfo={pageInfo}
        initialPosts={mappedPosts}
        pageSize={PAGE_SIZE}
        query={{ lang: effectiveLocale }}
      />
    </div>
  );
}
