// src/lib/api.ts
export type Locale = "en" | "ru" | "ua";

export async function fetchPosts(locale: Locale) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const url = `${base}/api/posts?lang=${locale}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch posts");
  const data = await res.json();
  return Array.isArray(data) ? data : data.posts ?? [];
}

export default fetchPosts;
