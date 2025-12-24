import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getPostsIndex } from "@/server/wp/api";
import type { Locale } from "@/server/wp/fetchPosts";
import type { WPPostCard, PostListItem } from "@/server/wp/api";

const PAGE_SIZE = 3;

type PageInfo = { hasNextPage: boolean; endCursor: string | null };

async function fetchFirstPage(lang?: string): Promise<{ posts: Array<WPPostCard | PostListItem>; pageInfo: { hasNextPage: boolean; endCursor: string | null } }> {
  const res = await getPostsIndex({ first: PAGE_SIZE, after: null, langSlug: lang ?? null });
  return { posts: res.posts, pageInfo: res.pageInfo };
}

export default async function PostsIndex({ locale }: { locale?: Locale }) {
  const lang = locale ?? "en";
  const { posts, pageInfo } = await fetchFirstPage(lang);
  const t = TRANSLATIONS[lang ?? DEFAULT_LOCALE];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{t.posts}</h1>
      <PostsGridWithPagination initialPosts={posts} initialPageInfo={pageInfo} pageSize={PAGE_SIZE} query={{ lang }} />
    </div>
  );
}
