"use client";

import React, { useCallback, useMemo, useState } from "react";
import PostCard, { type PostCardPost } from "@/components/features/posts/PostCard";
import { useI18n } from "@/core/i18n/LocaleProvider";
import type { PostListItem, WPPostCard } from "@/server/wp/api";

type Post = WPPostCard | PostListItem | PostCardPost;

type Props = {
  initialPosts: Post[];
  // kept for compatibility with existing callsites
  initialPageInfo?: { hasNextPage: boolean; endCursor: string | null } | undefined;
  pageSize?: number; // will default to 3
  query: { lang?: string; categorySlug?: string | null; tagSlug?: string | null; level?: string | null };
};

function stableKey(p: Post): string {
  const wp = p as WPPostCard;
  const id = (p as { id?: string }).id;
  const dbId = (wp as WPPostCard).databaseId;
  const slug = (p as { slug?: string }).slug;
  return id ?? (dbId !== undefined ? String(dbId) : slug ?? "");
}

export default function PostsGridWithPagination({ initialPosts, initialPageInfo, pageSize = 3, query }: Props) {
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>(() => initialPosts ?? []);
  const [pageInfo, setPageInfo] = useState<{ hasNextPage: boolean; endCursor: string | null }>(
    initialPageInfo ?? { hasNextPage: false, endCursor: null },
  );
  const [isLoading, setIsLoading] = useState(false);

  const keySet = useMemo(() => new Set(posts.map((p) => stableKey(p))), [posts]);

  const loadMore = useCallback(async () => {
    if (!pageInfo.hasNextPage || isLoading) return;
    setIsLoading(true);
    try {
      const mode = query.tagSlug ? "tag" : query.categorySlug ? "category" : "index";
      const body = {
        first: pageSize,
        after: pageInfo.endCursor,
        langSlug: query.lang,
        mode,
        categorySlug: query.categorySlug ?? null,
        tagSlug: query.tagSlug ?? null,
      };

      const res = await fetch(`/api/posts/load-more`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`Load more failed: ${res.status}`);
      const data = await res.json();
      const incoming: Post[] = data.posts ?? [];
      const incomingPageInfo = data.pageInfo ?? { hasNextPage: false, endCursor: null };

      const newItems: Post[] = [];
      for (const p of incoming) {
        const k = stableKey(p);
        if (!keySet.has(k)) {
          keySet.add(k);
          newItems.push(p);
        }
      }

      if (newItems.length) setPosts((s) => [...s, ...newItems]);
      setPageInfo(incomingPageInfo);
    } catch (err) {
      // swallow — UI stays stable; errors can be seen in console
      // eslint-disable-next-line no-console
      console.error("load more error", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageInfo, isLoading, pageSize, query, keySet]);

  if (!posts.length) return <div>{t("noPosts")}</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
        {posts.map((post) => (
          <div key={stableKey(post) || (post.slug as string)}>
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Load more button: strict rules
          - pageSize defaults to 3
          - show only when upstream indicates more and we have at least one full page already
      */}
      {pageInfo.hasNextPage && posts.length >= pageSize && (
        <div className="flex justify-center">
          <button
            className="mx-auto rounded-full px-5 py-2 text-sm font-medium transition duration-200 ease-out transform-gpu hover:scale-[1.03] motion-reduce:transform-none shadow-md hover:shadow-lg disabled:opacity-60 sd-pill focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: "oklch(0.371 0 0)", borderColor: "transparent" }}
            onClick={loadMore}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
