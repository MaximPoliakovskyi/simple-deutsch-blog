import { type NextRequest, NextResponse } from "next/server";
import { getPostsByCategory, getPostsByTag, getPostsIndex } from "@/server/wp/api";
import { assertLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/locale";

type PageInfo = { hasNextPage: boolean; endCursor: string | null };
type LoadMoreBody = {
  first?: number;
  after?: string | null;
  locale?: string; // language locale: en | ru | uk
  mode?: "index" | "category" | "tag";
  categorySlug?: string | null;
  tagSlug?: string | null;
  level?: string | null;
  skipIds?: string[];
};

// Removed local SUPPORTED_LOCALES helper; using assertLocale instead

export async function POST(req: NextRequest) {
  try {
    const {
      first = 3,
      after = null,
      locale,
      mode = "index",
      categorySlug,
      tagSlug,
      level,
      skipIds,
    }: LoadMoreBody = await req.json();

    if (!first || first <= 0) {
      return NextResponse.json({ message: "Invalid first param" }, { status: 400 });
    }

    // Validate locale (map legacy aliases via assertLocale)
    let validLocale: Locale | undefined = undefined;
    try {
      validLocale = assertLocale(locale as any);
    } catch {
      validLocale = undefined;
    }

    let res;
    if (mode === "category" && categorySlug) {
      res = await getPostsByCategory({ first, after, locale: validLocale, categorySlug });
    } else if (mode === "tag" && tagSlug) {
      // getPostsByTag now handles iterative fetching internally
      res = await getPostsByTag({ first, after, locale: validLocale, tagSlug });
    } else {
      // Index mode; optionally filter by a CEFR level tag when provided.
      // To ensure we actually fill the requested "first" items when the index page
      // contains few matching posts, we iterate forward across index pages until
      // we collect enough or run out of pages.
      const normalizeLevelSlug = (slug?: string | null): string | null => {
        if (!slug) return null;
        const s = slug.toLowerCase().trim().replace(/_/g, "-");
        const cleaned = s
          .replace(/^(?:cefrlevel-)/, "")
          .replace(/^(?:cefr-)/, "")
          .replace(/^(?:level-)/, "")
          .replace(/^(?:ger-)/, "");
        const tokens = cleaned.split(/[^a-z0-9]+/).filter(Boolean);
        for (const tok of tokens) {
          if (["a1", "a2", "b1", "b2", "c1", "c2"].includes(tok)) return tok;
        }
        if (/\bc2\b/.test(cleaned)) return "c2";
        if (/\bc1\b/.test(cleaned)) return "c1";
        if (/\bb2\b/.test(cleaned)) return "b2";
        if (/\bb1\b/.test(cleaned)) return "b1";
        if (/\ba2\b/.test(cleaned)) return "a2";
        if (/\ba1\b/.test(cleaned)) return "a1";
        return null;
      };

      const target = level?.toLowerCase() ?? null;

      const collected: any[] = [];
      let cursor = after ?? null;
      let hasNext = true;
      let lastPageInfo: PageInfo = { hasNextPage: false, endCursor: null };

      // Use a larger per-page fetch to improve odds of matches
      const pageFetchSize = Math.max(first, 10);

      while (hasNext && collected.length < first) {
        const r = await getPostsIndex({ first: pageFetchSize, after: cursor, locale: validLocale });
        const nodes = r.posts ?? [];

        let matching = nodes;
        if (target) {
          matching = nodes.filter((p: any) => {
            const nodes = p?.tags?.nodes ?? [];
            for (const t of nodes) {
              const m = normalizeLevelSlug(t?.slug ?? "") ?? normalizeLevelSlug(t?.name ?? "");
              if (m && m === target) return true;
            }
            return false;
          });
        }

        // Skip any posts already visible on the client
        const seen = new Set(skipIds ?? []);
        const keyOf = (p: any) =>
          p?.id ?? (p?.databaseId !== undefined ? String(p.databaseId) : (p?.slug ?? ""));

        for (const m of matching) {
          if (collected.length >= first) break;
          const mk = keyOf(m);
          if (mk && seen.has(mk)) continue;
          collected.push(m);
        }

        lastPageInfo = r.pageInfo ?? { hasNextPage: false, endCursor: null };
        hasNext = Boolean(lastPageInfo.hasNextPage);
        cursor = lastPageInfo.endCursor ?? null;

        // If no matches on this page and we still have next, continue to fetch.
        // If we hit no next page, break.
      }

      return NextResponse.json({
        posts: collected,
        pageInfo: { hasNextPage: hasNext, endCursor: cursor },
      });
    }

    return NextResponse.json({ posts: res.posts, pageInfo: res.pageInfo });
  } catch (err) {
    console.error("/api/posts/load-more error:", err);
    return NextResponse.json({ error: "Failed to load more posts" }, { status: 500 });
  }
}
