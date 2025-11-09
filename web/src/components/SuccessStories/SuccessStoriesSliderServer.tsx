import { headers } from "next/headers";
import type { WPPostCard } from "@/lib/wp/api";
import SuccessStoriesSlider from "./SuccessStoriesSlider";

/** Build an absolute origin for server-side fetches (local + prod). */
async function getBaseUrl() {
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "");
  const proto = h.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
  if (!host) throw new Error("Cannot determine host for Success stories slider fetch");
  return `${proto}://${host}`;
}

/** Fetch a small set of recent posts suitable for <PostCard/>. */
async function getSliderPosts(): Promise<WPPostCard[]> {
  const base = await getBaseUrl();
  const url = new URL("/api/posts", base); // adjust path if your API differs
  url.searchParams.set("first", "8");
  // Request posts specifically in the "success-stories" category so the
  // client-side filter has relevant posts to work with. Adjust slug if your
  // WP category uses a different slug.
  url.searchParams.set("category", "success-stories");

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json?.posts ?? []);
}

/** Server wrapper: fetch once, render the client slider. */
export default async function SuccessStoriesSliderServer() {
  const posts = await getSliderPosts();
  if (!posts.length) return null;
  return <SuccessStoriesSlider posts={posts} title="Success stories" />;
}
