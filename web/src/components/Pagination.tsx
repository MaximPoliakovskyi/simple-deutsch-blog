// src/components/Pagination.tsx
"use client";

import * as React from "react";
import PostCard from "@/components/PostCard";
import { useI18n } from "@/components/LocaleProvider";
import type { WPPostCard } from "@/lib/wp/api";

type Props = {
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
};

// Small helper so each card animates in on mount
function PostListItem({ post }: { post: WPPostCard }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <li
      className={[
        "transition duration-700 ease-out will-change-transform",
        "opacity-0 translate-y-2",
        mounted ? "opacity-100 translate-y-0" : "",
        "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
      ].join(" ")}
    >
      <PostCard post={post} />
    </li>
  );
}

export default function Pagination({
  initialPosts,
  initialEndCursor,
  initialHasNextPage,
  pageSize = 9, // 9 posts per page
}: Props) {
  const { locale } = useI18n();
  const [items, setItems] = React.useState<WPPostCard[]>(initialPosts);
  const [after, setAfter] = React.useState<string | null>(initialEndCursor);
  const [hasNext, setHasNext] = React.useState<boolean>(initialHasNextPage);
  const [loading, setLoading] = React.useState(false);

  // Avoid duplicates if backend overlaps pages
  const seen = React.useRef<Set<string>>(
    new Set(initialPosts.map((p) => (p.id ?? p.slug) as string)),
  );

  const loadMore = async () => {
    if (!hasNext || loading) return;
    setLoading(true);
    try {
  const url = new URL("/api/posts", window.location.origin);
      if (after) url.searchParams.set("after", after);
      url.searchParams.set("first", String(pageSize));
  // Scope results to current locale
  url.searchParams.set("lang", locale ?? "en");

      const res = await fetch(url.toString(), { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: {
        posts: WPPostCard[];
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
      } = await res.json();

      const next: WPPostCard[] = [];
      for (const p of json.posts) {
        const key = p.id ?? p.slug;
        if (!seen.current.has(key)) {
          seen.current.add(key);
          next.push(p);
        }
      }

      setItems((prev) => prev.concat(next));
      setAfter(json.pageInfo.endCursor);
      setHasNext(json.pageInfo.hasNextPage);
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Accent color used for border/outline
  const accent = "oklch(0.371 0 0)";

  return (
    <div>
      {/* Grid: 1 → 2 → 3 columns responsively */}
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
        {items.map((post) => (
          <PostListItem key={(post.id ?? post.slug) as string} post={post} />
        ))}
      </ul>

      {hasNext && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            aria-disabled={loading}
            className={[
              "rounded-full border px-5 py-2 text-sm",
              "transition duration-300 ease-out",
              "hover:scale-[1.02] hover:bg-neutral-50 dark:hover:bg-white/10",
              "disabled:opacity-50",
              // ✅ Keep only one outline utility to avoid conflicts:
              "focus-visible:outline-2 focus-visible:outline-offset-2",
            ].join(" ")}
            style={{
              borderColor: accent,
              outlineColor: accent,
            }}
          >
            {loading ? "Loading…" : "View more"}
          </button>
        </div>
      )}
    </div>
  );
}
