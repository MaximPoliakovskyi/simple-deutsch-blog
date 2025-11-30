import { headers } from "next/headers";
import type { WPPostCard } from "@/lib/wp/api";
import SuccessStoriesSlider from "./SuccessStoriesSlider";
import { TRANSLATIONS, DEFAULT_LOCALE } from "@/lib/i18n";

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

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json?.posts ?? []);
}

/** Server wrapper: fetch once, render the client slider. */
export default async function SuccessStoriesSliderServer({ locale }: Props = {}) {
  const posts = await getSliderPosts(locale);
  if (!posts.length) return null;
  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];
  return <SuccessStoriesSlider posts={posts} title={t.successStories} />;
}
