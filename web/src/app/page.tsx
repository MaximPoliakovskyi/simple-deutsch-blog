// src/app/page.tsx

import { headers } from "next/headers";
import LatestPostsSliderServer from "@/components/LatestPosts/LatestPostsSliderServer";
import HeroWithFilters from "@/components/HeroWithFilters";
import Pagination from "@/components/Pagination";
import SuccessStoriesSliderServer from "@/components/SuccessStories/SuccessStoriesSliderServer";
import type { PostListItem, WPPostCard } from "@/lib/wp/api";
import { getAllCategories } from "@/lib/wp/api";
import { extractConnectionNodes } from "@/lib/utils/normalizeConnection";

type PageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
};

type GetPostsResult = {
  posts: PostListItem[];
  pageInfo: PageInfo;
};

/** Build an absolute base URL from the incoming request (local + prod). */
async function getBaseUrl() {
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "");
  const proto = h.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
  if (!host) throw new Error("Cannot determine host for API fetch");
  return `${proto}://${host}`;
}

/** Fetch the first N posts (cursor-based). */
async function getPosts(first: number, after: string | null = null): Promise<GetPostsResult> {
  const base = await getBaseUrl();
  const url = new URL("/api/posts", base);
  url.searchParams.set("first", String(first));
  if (after) url.searchParams.set("after", after);

  const res = await fetch(url, {
    // Cache on the server for a short period; adjust as you like.
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    // Fallback empty shape so page still renders
    return { posts: [], pageInfo: { endCursor: null, hasNextPage: false } };
  }

  const json = await res.json();

  // Expecting { posts: [...], pageInfo: { endCursor, hasNextPage } }
  if (json && Array.isArray(json.posts) && json.pageInfo) {
    return { posts: json.posts, pageInfo: json.pageInfo as PageInfo };
  }

  // If your API still returns a bare array, adapt it here:
  if (Array.isArray(json)) {
    return { posts: json, pageInfo: { endCursor: null, hasNextPage: false } };
  }

  return { posts: [], pageInfo: { endCursor: null, hasNextPage: false } };
}

export const revalidate = 300; // optional: revalidate homepage every 5 minutes

export default async function HomePage() {
  const PAGE_SIZE = 9;
  const { posts, pageInfo } = await getPosts(PAGE_SIZE);

  // Fetch a small set of categories to display as hero pills
  const { categories } = await getAllCategories({ first: 12 });
  const categoryNodes = extractConnectionNodes<{ id: string; name: string; slug: string }>(
    categories,
  ).slice(0, 7);

  // The WP API sometimes returns `excerpt` as `null` and other optional
  // nested properties may be missing. Build a normalized `WPPostCard` for
  // the UI with safe fallbacks so TypeScript and runtime consumers are happy.
  const normalizedPosts: WPPostCard[] = posts.map((p) => {
    const featuredImage = p.featuredImage && p.featuredImage.node && p.featuredImage.node.sourceUrl
      ? {
          node: {
            sourceUrl: String(p.featuredImage.node.sourceUrl),
            altText: p.featuredImage.node.altText ?? null,
            // mediaDetails is optional; leave undefined if not present
          },
        }
      : null;

    const author = p.author && p.author.node && p.author.node.name
      ? { node: { name: String(p.author.node.name), slug: "" } }
      : null;

    return {
      id: String(p.id),
      databaseId: (p as any).databaseId, // optional and may not exist on this shape
      slug: String(p.slug),
      title: String(p.title),
      excerpt: p.excerpt ?? "",
      date: String(p.date),
      featuredImage,
      author,
      categories: p.categories
        ? { nodes: (p.categories.nodes || []).map((n) => ({ id: (n as any).id, name: n.name, slug: n.slug })) }
        : undefined,
    };
  });

  return (
    <>
  {/* homepage header removed (replaced by new hero in <main>) */}

      <main className="mx-auto max-w-7xl px-4 py-12">
        <HeroWithFilters
          categories={categoryNodes}
          initialPosts={normalizedPosts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={PAGE_SIZE}
        />
      </main>

      {/* ✅ Homepage-only Success stories slider — rendered before the global footer */}
      <SuccessStoriesSliderServer />

      {/* ✅ Homepage “Latest posts” slider */}
      <LatestPostsSliderServer />
    </>
  );
}
