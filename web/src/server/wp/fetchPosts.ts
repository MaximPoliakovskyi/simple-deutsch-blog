// src/server/wp/fetchPosts.ts
import { headers } from "next/headers";

import type { Locale } from "@/i18n/locale";

async function resolveBaseUrl(): Promise<string> {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (envBase) return envBase.replace(/\/$/, "");

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() is only available in a request context; ignore if unavailable
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function fetchPosts(locale: Locale) {
  const base = await resolveBaseUrl();
  const url = new URL("/api/posts", base);
  url.searchParams.set("lang", locale);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch posts");
  const data = (await res.json()) as { posts?: unknown } | unknown[];
  if (Array.isArray(data)) return data;
  const posts = Array.isArray((data as { posts?: unknown }).posts)
    ? (data as { posts: unknown[] }).posts
    : [];
  return posts;
}
