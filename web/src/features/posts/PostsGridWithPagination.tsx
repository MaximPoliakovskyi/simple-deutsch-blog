"use client";

import { useCallback, useState } from "react";
import PostCard, { type PostCardPost } from "@/features/posts/PostCard";
import type { PostListItem, WPPostCard } from "@/server/wp/types";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import Button from "@/shared/ui/Button";

type Post = WPPostCard | PostListItem | PostCardPost;

type Props = {
  initialPageInfo?: { endCursor: string | null; hasNextPage: boolean } | undefined;
  initialPosts: Post[];
  pageSize?: number;
  query: {
    categorySlug?: string | null;
    lang?: string;
    level?: string | null;
    tagSlug?: string | null;
  };
};

function stableKey(post: Post): string {
  const wpPost = post as WPPostCard;
  const id = (post as { id?: string }).id;
  const databaseId = wpPost.databaseId;
  const slug = (post as { slug?: string }).slug;
  return id ?? (databaseId !== undefined ? String(databaseId) : (slug ?? ""));
}

export default function PostsGridWithPagination({
  initialPosts,
  initialPageInfo,
  pageSize = 3,
  query,
}: Props) {
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>(() => initialPosts ?? []);
  const [pageInfo, setPageInfo] = useState<{ endCursor: string | null; hasNextPage: boolean }>(
    initialPageInfo ?? { endCursor: null, hasNextPage: false },
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!pageInfo.hasNextPage || isLoading) return;
    setIsLoading(true);

    try {
      const mode = query.tagSlug ? "tag" : query.categorySlug ? "category" : "index";
      const existingKeys = new Set(posts.map((post) => stableKey(post)));
      const body = {
        after: pageInfo.endCursor,
        categorySlug: query.categorySlug ?? null,
        first: pageSize,
        level: query.level ?? null,
        locale: query.lang,
        mode,
        skipIds: Array.from(existingKeys),
        tagSlug: query.tagSlug ?? null,
      };

      const response = await fetch(`/api/posts/load-more`, {
        body: JSON.stringify(body),
        headers: { accept: "application/json", "content-type": "application/json" },
        method: "POST",
      });

      if (!response.ok) throw new Error(`Load more failed: ${response.status}`);

      const data = await response.json();
      const incoming: Post[] = data.posts ?? [];
      const incomingPageInfo = data.pageInfo ?? { endCursor: null, hasNextPage: false };

      const newItems: Post[] = [];
      for (const post of incoming) {
        const key = stableKey(post);
        if (!existingKeys.has(key)) {
          existingKeys.add(key);
          newItems.push(post);
        }
      }

      if (newItems.length) setPosts((state) => [...state, ...newItems]);
      setPageInfo(incomingPageInfo);
    } catch (error) {
      console.error("load more error", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pageInfo, pageSize, posts, query]);

  if (!posts.length) return <div>{t("posts.empty")}</div>;

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="sd-post-grid">
        {posts.map((post) => (
          <div key={stableKey(post) || (post.slug as string)}>
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {pageInfo.hasNextPage && posts.length >= pageSize && (
        <div className="flex justify-center">
          <Button aria-busy={isLoading} disabled={isLoading} onClick={loadMore}>
            {t("common.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
