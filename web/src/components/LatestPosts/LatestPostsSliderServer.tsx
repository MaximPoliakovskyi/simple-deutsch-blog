import { headers } from "next/headers";
import type { WPPostCard } from "@/lib/wp/api";
import LatestPostsSlider from "./LatestPostsSlider";
import { TRANSLATIONS, DEFAULT_LOCALE } from "@/lib/i18n";

type Props = {
  locale?: "en" | "ru" | "ua";
};

async function getBaseUrl() {
  // Prefer an explicit public base URL when available (local dev or prod)
  const envBase = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  if (envBase) return envBase.replace(/\/$/, "");

  const h = await headers();
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "");
  const proto = h.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
  if (!host) throw new Error("Cannot determine host for Latest posts slider fetch");
  return `${proto}://${host}`;
}

async function getSliderPosts(locale?: string): Promise<unknown[]> {
  const base = await getBaseUrl();
  const url = new URL("/api/posts", base);
  url.searchParams.set("first", "8");
  // Always include lang when provided to ensure language-scoped posts
  if (locale) url.searchParams.set("lang", locale);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json?.posts ?? []);
}

export default async function LatestPostsSliderServer({ locale }: Props = {}) {
  const posts = (await getSliderPosts(locale)) as WPPostCard[];
  if (!posts.length) return null;
  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];
  return <LatestPostsSlider posts={posts} title={t.latestPosts} />;
}
