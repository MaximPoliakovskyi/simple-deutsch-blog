"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PostCard, { type PostCardPost } from "@/components/features/posts/PostCard";
import { useI18n } from "@/core/i18n/LocaleProvider";
import type { PostListItem, WPPostCard } from "@/server/wp/api";

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

type Post = WPPostCard | PostListItem | PostCardPost;

type NormalizedFetchResult = {
  posts: Post[];
  pageInfo: PageInfo;
};

type Query = {
  lang?: string;
  categorySlug?: string | null;
  tagSlug?: string | null;
  level?: string | null;
};

type Props = {
  initialPosts: Post[];
  initialPageInfo?: PageInfo;
  pageSize: number; // e.g. 6
  query: Query;
};

const EMPTY_PAGE_INFO: PageInfo = { hasNextPage: false, endCursor: null };

function normalizePostsResponse(payload: unknown): NormalizedFetchResult {
  if (Array.isArray(payload)) {
    return { posts: payload as Post[], pageInfo: EMPTY_PAGE_INFO };
  }

  if (payload && typeof payload === "object") {
    const { posts, pageInfo } = payload as { posts?: unknown; pageInfo?: PageInfo };
    return {
      posts: Array.isArray(posts) ? (posts as Post[]) : [],
      pageInfo: pageInfo ?? EMPTY_PAGE_INFO,
    };
  }

  return { posts: [], pageInfo: EMPTY_PAGE_INFO };
}

export function PostsGridWithPagination({ initialPosts, initialPageInfo, pageSize, query }: Props) {
  const { t } = useI18n();
  
  // Track if this is the first render to use initialPosts without re-fetching
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  // --- state ---
  // Initialize posts/buffer from server-provided initialPosts to avoid
  // a flash of the empty-state while the client effect hydrates.
  const [posts, setPosts] = useState<Post[]>(() =>
    initialPosts ? initialPosts.slice(0, pageSize) : [],
  );
  const [buffer, setBuffer] = useState<Post[]>(() =>
    initialPosts ? initialPosts.slice(pageSize) : [],
  );

  const safePageInfo: PageInfo = initialPageInfo ?? { hasNextPage: false, endCursor: null };
  const [serverHasNextPage, setServerHasNextPage] = useState<boolean>(safePageInfo.hasNextPage);
  const [endCursor, setEndCursor] = useState<string | null>(safePageInfo.endCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // key describing filters
  const _resetKey = useMemo(() => JSON.stringify(query), [query]);

  // --- reset when filters or initial data change ---
  useEffect(() => {
    let cancelled = false;

    async function resetOrFetch() {
      // On first render, if we have initialPosts, use them without fetching
      if (isFirstRender && initialPosts && initialPosts.length > 0) {
        setIsFirstRender(false);
        return;
      }
      
      setIsFirstRender(false);
      setIsLoading(true);
      setError(null);

      // If there are client-side filters (category/tag/level), fetch filtered
      // posts from the server. Otherwise use the server-provided initialPosts.
      const hasFilters = Boolean(query.categorySlug || query.tagSlug || query.level);

      if (!hasFilters) {
        const firstChunk = initialPosts.slice(0, pageSize);
        const rest = initialPosts.slice(pageSize);

        if (cancelled) return;

        setPosts(firstChunk);
        setBuffer(rest);
        setServerHasNextPage(safePageInfo.hasNextPage);
        setEndCursor(safePageInfo.endCursor);
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        const u = new URL("/api/posts", window.location.origin);
        // Fetch exactly pageSize posts (3 for categories block)
        u.searchParams.set("first", String(pageSize));
        if (query.lang) u.searchParams.set("lang", query.lang);
        if (query.categorySlug) u.searchParams.set("category", query.categorySlug);
        if (query.tagSlug) u.searchParams.set("tag", query.tagSlug);
        if (query.level) u.searchParams.set("level", query.level);

        const res = await fetch(u.toString(), { method: "GET" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (cancelled) return;

        const { posts: fetchedPosts, pageInfo } = normalizePostsResponse(json);
        const firstChunk = fetchedPosts.slice(0, pageSize);
        const rest = fetchedPosts.slice(pageSize);

        setPosts(firstChunk);
        setBuffer(rest);
        setServerHasNextPage(pageInfo.hasNextPage);
        setEndCursor(pageInfo.endCursor);
      } catch (err: unknown) {
        console.error("Failed to fetch filtered posts", err);
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load posts";
          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    resetOrFetch();

    return () => {
      cancelled = true;
    };
  }, [
    pageSize,
    query.categorySlug,
    query.lang,
    query.level,
    query.tagSlug,
    _resetKey,
  ]);

  const showLoadMore = buffer.length > 0 || serverHasNextPage;

  const loadMore = useCallback(async () => {
    if (isLoading) return;

    // 1) Use local buffer first
    if (buffer.length > 0) {
      setIsLoading(true);
      setError(null);

      const nextChunk = buffer.slice(0, pageSize);
      setPosts((prev) => [...prev, ...nextChunk]);
      setBuffer((prev) => prev.slice(pageSize));

      setIsLoading(false);
      return;
    }

    // 2) If no buffer and server says no more pages — exit
    if (!serverHasNextPage) return;

    // 3) Fetch next page from server
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/posts/load-more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first: pageSize, after: endCursor, ...query }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${res.statusText} – ${text}`);
      }

      const data: { posts: Post[]; pageInfo: PageInfo } = await res.json();

      // dedupe by id/slug
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id ?? p.slug));
        const fresh = (data.posts ?? []).filter((p) => !ids.has(p.id ?? p.slug));
        return [...prev, ...fresh];
      });

      setServerHasNextPage(data.pageInfo.hasNextPage);
      setEndCursor(data.pageInfo.endCursor);
    } catch (e: unknown) {
      console.error("loadMore error:", e);
      const message = e instanceof Error ? e.message : "Failed to load more posts";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [buffer, serverHasNextPage, endCursor, query, pageSize, isLoading]);

  if (!posts.length) {
    return <div>{t("noPosts")}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
        {posts.map((post) => (
          <div key={(post.id ?? post.slug) as string}>
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* error */}
      {error && <p className="text-sm text-red-500">Ошибка при загрузке постов: {error}</p>}

      {/* Load more button */}
      {showLoadMore && (
        <button
          onClick={loadMore}
          disabled={isLoading}
          aria-disabled={isLoading}
          className={[
            "mx-auto rounded-full px-5 py-2 text-sm font-medium",
            "transition duration-200 ease-out",
            "transform-gpu hover:scale-[1.03] motion-reduce:transform-none",
            "shadow-md hover:shadow-lg disabled:opacity-60",
            // use shared pill surface token so all pills match
            "sd-pill",
            // Focus outline for accessibility
            "focus-visible:outline-2 focus-visible:outline-offset-2",
          ].join(" ")}
          style={{ outlineColor: "oklch(0.371 0 0)", borderColor: "transparent" }}
        >
          {isLoading ? t("loading") || "Loading…" : t("loadMore") || "Load more"}
        </button>
      )}
    </div>
  );
}

export default PostsGridWithPagination;
