// src/app/page.tsx
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import { headers } from "next/headers";
import SuccessStoriesSliderServer from "@/components/SuccessStories/SuccessStoriesSliderServer";
import LatestPostsSliderServer from "@/components/LatestPosts/LatestPostsSliderServer";

type PageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
};

type GetPostsResult = {
  posts: any[];
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

  return (
    <>
      {/* Header is outside <main> and exists only on this page */}
      <Header />

      <main id="main" role="main" className="mx-auto max-w-7xl px-4 py-6">
        <Pagination
          initialPosts={posts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={PAGE_SIZE} // ← guarantees 9 per page including "Load more"
        />
      </main>

      {/* ✅ Homepage-only Success stories slider — rendered before the global footer */}
      <SuccessStoriesSliderServer />

      {/* ✅ Homepage “Latest posts” slider */}
      <LatestPostsSliderServer />
    </>
  );
}
