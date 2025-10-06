import { headers } from "next/headers";
import LatestPostsSlider from "./LatestPostsSlider";

async function getBaseUrl() {
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "");
  const proto = h.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
  if (!host) throw new Error("Cannot determine host for Latest posts slider fetch");
  return `${proto}://${host}`;
}

async function getSliderPosts(): Promise<any[]> {
  const base = await getBaseUrl();
  const url = new URL("/api/posts", base);
  url.searchParams.set("first", "8");

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : json?.posts ?? [];
}

export default async function LatestPostsSliderServer() {
  const posts = await getSliderPosts();
  if (!posts.length) return null;
  return <LatestPostsSlider posts={posts} title="Latest posts" />;
}