import { headers } from "next/headers";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import type { WPPostCard } from "@/server/wp/api";
import SuccessStoriesSlider from "./SuccessStoriesSlider";

type Props = {
  locale?: "en" | "ru" | "ua";
};

/** Build an absolute origin for server-side fetches (local + prod). */
async function getBaseUrl() {
  // Prefer explicit public base URL when available
  const envBase = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  if (envBase) return envBase.replace(/\/$/, "");

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
async function getSliderPosts(locale?: string): Promise<WPPostCard[]> {
  const base = await getBaseUrl();
  const url = new URL("/api/posts", base); // adjust path if your API differs
  url.searchParams.set("first", "8");
  // Request posts specifically in the "success-stories" category so the
  // client-side filter has relevant posts to work with. Adjust slug if your
  // WP category uses a different slug.
  url.searchParams.set("category", "success-stories");
  // Always include lang when provided
  if (locale) url.searchParams.set("lang", locale);

  const res = await fetch(url.toString(), { 
    next: { revalidate: 0 } // No caching during development
  });
  if (!res.ok) return [];
  const json = await res.json();
  const posts = Array.isArray(json) ? json : (json?.posts ?? []);
  
  // Debug: log what we're getting
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SuccessStories] Fetched ${posts.length} posts for locale="${locale}"`);
    console.log(`[SuccessStories] Languages in posts:`, posts.map((p: any) => 
      p.categories?.nodes?.map((c: any) => c.slug).filter((s: string) => ['en', 'ru', 'ua'].includes(s))
    ));
  }
  
  return posts;
}

/** Server wrapper: fetch once, render the client slider. */
export default async function SuccessStoriesSliderServer({ locale }: Props = {}) {
  const posts = await getSliderPosts(locale);
  if (!posts.length) return null;
  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];
  return <SuccessStoriesSlider posts={posts} title={t.successStories} />;
}
