import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getPosts, getPostsPage } from "@/server/wp/api";
import type { Locale } from "@/server/wp/fetchPosts";

const PAGE_SIZE = 6;

async function fetchFirstPage(lang?: string) {
  if (lang) {
    const res = await getPosts({ first: PAGE_SIZE, locale: lang });
    return {
      posts: res.posts?.nodes ?? [],
      pageInfo: res.posts?.pageInfo ?? { hasNextPage: false, endCursor: null },
    };
  }

  const { posts, pageInfo } = await getPostsPage({ first: PAGE_SIZE });
  return { posts, pageInfo };
}

export default async function PostsIndex({ locale }: { locale?: Locale }) {
  const lang = locale ?? "en";
  const { posts, pageInfo } = await fetchFirstPage(lang);
  const t = TRANSLATIONS[lang ?? DEFAULT_LOCALE];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{t.posts}</h1>
      <PostsGridWithPagination
        initialPosts={posts}
        initialPageInfo={pageInfo}
        pageSize={PAGE_SIZE}
        query={{ lang }}
      />
    </div>
  );
}
