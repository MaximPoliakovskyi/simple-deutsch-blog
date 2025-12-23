import { headers } from "next/headers";
import CategoriesBlock from "@/components/features/categories/CategoriesBlock";
import LatestPostsSliderServer from "@/components/features/posts/LatestPosts/LatestPostsSliderServer";
import HeroWithFilters from "@/components/features/search/HeroWithFilters";
import SuccessStoriesSliderServer from "@/components/features/stories/SuccessStories/SuccessStoriesSliderServer";
import { filterHiddenCategories } from "@/core/content/hiddenCategories";
import { getAllCategories } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";

async function getBaseUrl() {
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "");
  const proto = h.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
  if (!host) throw new Error("Cannot determine host");
  return `${proto}://${host}`;
}

async function getPosts(first: number, locale?: string) {
  const base = await getBaseUrl();
  const url = new URL("/api/posts", base);
  url.searchParams.set("first", String(first));
  if (locale) url.searchParams.set("lang", locale);

  const res = await fetch(url, { next: { revalidate: 60 } } as RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  });
  if (!res.ok) return { posts: [], pageInfo: { endCursor: null, hasNextPage: false } };

  const json = await res.json();
  return {
    posts: json.posts ?? json ?? [],
    pageInfo: json.pageInfo ?? { endCursor: null, hasNextPage: false },
  };
}

export const revalidate = 300;

export default async function HomePage({ locale }: { locale?: "en" | "ru" | "ua" } = {}) {
  const effectiveLocale = locale ?? "en";
  const PAGE_SIZE = 6;

  // Fetch more posts initially for client-side pagination
  const { posts, pageInfo } = await getPosts(100, effectiveLocale);

  const catsResp = await getAllCategories({ first: 12 });
  const categoryNodes = filterHiddenCategories(
    extractConnectionNodes<{ id: string; name: string; slug: string }>(catsResp?.categories),
  ).slice(0, 7);

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-12">
        <HeroWithFilters
          categories={categoryNodes}
          initialPosts={posts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={PAGE_SIZE}
          locale={effectiveLocale}
        />
      </main>

      <SuccessStoriesSliderServer locale={effectiveLocale} />
      <LatestPostsSliderServer locale={effectiveLocale} />
      <CategoriesBlock locale={effectiveLocale} />
    </>
  );
}
