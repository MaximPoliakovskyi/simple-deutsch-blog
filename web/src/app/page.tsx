// src/app/page.tsx
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { headers } from "next/headers";
import SuccessStoriesSliderServer from "@/components/SuccessStories/SuccessStoriesSliderServer";
import LatestPostsSliderServer from "@/components/LatestPosts/LatestPostsSliderServer";

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

/** Fetch posts from /api/posts and normalize to an array. */
async function getPosts(): Promise<any[]> {
  const base = await getBaseUrl();
  const res = await fetch(new URL("/api/posts", base), {
    next: { revalidate: 60 }, // adjust caching to taste
  });

  if (!res.ok) return [];
  const json = await res.json();

  // Some APIs return { posts: [...] }, others return []. Normalize to [].
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.posts)) return json.posts;

  return [];
}

export default async function HomePage() {
  const posts = await getPosts();
  const FIRST_ROW_COUNT = 3;

  return (
    <>
      {/* Header is outside <main> and exists only on this page */}
      <Header />

      <main id="main" role="main" className="mx-auto max-w-7xl px-4 py-6">
        <section aria-label="Latest posts" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any, i: number) => (
            <PostCard
              key={post.id ?? post.slug ?? i}
              post={post}
              priority={i < FIRST_ROW_COUNT}
            />
          ))}
        </section>
      </main>

      {/* ✅ Homepage-only Success stories slider — rendered before the global footer */}
      <SuccessStoriesSliderServer />
      
      {/* ✅ Homepage “Latest posts” slider */}
      <LatestPostsSliderServer />

    </>
  );
}
