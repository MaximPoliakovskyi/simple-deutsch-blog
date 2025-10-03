// src/components/Pagination.tsx
"use client";

import * as React from "react";
import PostCard from "@/components/PostCard";
// ✅ Use the exact post type from your API layer
import type { WPPostCard } from "@/lib/wp/api";

type Props = {
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
};

export default function Pagination({
  initialPosts,
  initialEndCursor,
  initialHasNextPage,
  pageSize = 12,
}: Props) {
  const [items, setItems] = React.useState<WPPostCard[]>(initialPosts);
  const [after, setAfter] = React.useState<string | null>(initialEndCursor);
  const [hasNext, setHasNext] = React.useState<boolean>(initialHasNextPage);
  const [loading, setLoading] = React.useState(false);

  // Avoid duplicate posts when pages overlap
  const seen = React.useRef<Set<string>>(
    new Set(initialPosts.map((p) => (p as any).id ?? p.slug))
  );

  const loadMore = async () => {
    if (!hasNext || loading) return;
    setLoading(true);
    try {
      const url = new URL("/api/posts", window.location.origin);
      if (after) url.searchParams.set("after", after);
      url.searchParams.set("first", String(pageSize));

      const res = await fetch(url.toString(), { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: {
        posts: WPPostCard[];
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
      } = await res.json();

      const next: WPPostCard[] = [];
      for (const p of json.posts) {
        const key = (p as any).id ?? p.slug;
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

  return (
    <div>
      {/* Single render: 1 → 2 → 3 columns responsively */}
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
        {items.map((post) => (
          <li key={(post as any).id ?? post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>

      {hasNext && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            aria-disabled={loading}
            className="rounded-full border px-5 py-2 text-sm disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
