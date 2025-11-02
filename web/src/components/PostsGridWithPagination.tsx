"use client";

import * as React from "react";
import PostCard from "@/components/PostCard";
import type { WPPostCard } from "@/lib/wp/api";

type Props = {
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
  // controlled category or tag prop - when provided, component fetches posts for
  // the given category slug (categorySlug) or tag slug (tagSlug). If both are
  // provided, tagSlug takes precedence.
  categorySlug?: string | null;
  tagSlug?: string | null;
};

export default function PostsGridWithPagination({
  initialPosts,
  initialEndCursor,
  initialHasNextPage,
  pageSize = 9,
  categorySlug = null,
  tagSlug = null,
}: Props) {
  const [items, setItems] = React.useState<WPPostCard[]>(initialPosts);
  const [after, setAfter] = React.useState<string | null>(initialEndCursor);
  const [hasNext, setHasNext] = React.useState<boolean>(initialHasNextPage);
  const [loading, setLoading] = React.useState(false);
  // category or tag is controlled via prop
  const category = categorySlug ?? null;
  const tag = tagSlug ?? null;

  // refs to track seen ids and the initial server-provided posts
  const seen = React.useRef<Set<string>>(new Set(initialPosts.map((p) => (p.id ?? p.slug) as string)));
  const initialRef = React.useRef({ posts: initialPosts, endCursor: initialEndCursor, hasNext: initialHasNextPage });

  React.useEffect(() => {
    // When category or tag changes, fetch fresh posts for that filter (or restore initial)
    let cancelled = false;

    async function fetchForFilter() {
      setLoading(true);
      try {
        // If neither category nor tag is selected, restore initial server render
        if (!category && !tag) {
          seen.current = new Set(initialRef.current.posts.map((p) => (p.id ?? p.slug) as string));
          setItems(initialRef.current.posts);
          setAfter(initialRef.current.endCursor);
          setHasNext(initialRef.current.hasNext);
          return;
        }

        const url = new URL("/api/posts", window.location.origin);
        url.searchParams.set("first", String(pageSize));
        // Prefer tag filter when provided
        if (tag) {
          url.searchParams.set("tag", tag);
        } else if (category) {
          url.searchParams.set("category", category);
        }

        const res = await fetch(url.toString(), { method: "GET" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: { posts: WPPostCard[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } } = await res.json();

        if (cancelled) return;

        seen.current = new Set(json.posts.map((p) => (p.id ?? p.slug) as string));
        setItems(json.posts);
        setAfter(json.pageInfo.endCursor);
        setHasNext(json.pageInfo.hasNextPage);
      } catch (err) {
        console.error("Failed to load posts for filter", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchForFilter();

    return () => {
      cancelled = true;
    };
  }, [category, tag, pageSize]);

  const loadMore = async () => {
    if (!hasNext || loading) return;
    setLoading(true);
    try {
      const url = new URL("/api/posts", window.location.origin);
      if (after) url.searchParams.set("after", after);
      url.searchParams.set("first", String(pageSize));
      if (tag) {
        url.searchParams.set("tag", tag);
      } else if (category) {
        url.searchParams.set("category", category);
      }

      const res = await fetch(url.toString(), { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: { posts: WPPostCard[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } } = await res.json();

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

  return (
    <div>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
        {items.map((post) => (
          <li key={(post.id ?? post.slug) as string} className="transition duration-700 ease-out will-change-transform">
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
            className={[
              "rounded-full border px-5 py-2 text-sm",
              "transition duration-300 ease-out",
              "hover:scale-[1.02] hover:bg-neutral-50 dark:hover:bg-white/10",
              "disabled:opacity-50",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
            ].join(" ")}
          >
            {loading ? "Loading…" : "View more"}
          </button>
        </div>
      )}
    </div>
  );
}
