// src/components/Pagination.tsx
'use client';

import * as React from 'react';
import type { WPPostCard } from 'src/lib/wp/api';
import PostCard from './PostCard';

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
  pageSize = 10,
}: Props) {
  const [posts, setPosts] = React.useState<WPPostCard[]>(initialPosts);
  const [after, setAfter] = React.useState<string | null>(initialEndCursor);
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(initialHasNextPage);
  const [loading, setLoading] = React.useState(false);
  const seen = React.useRef<Set<string>>(new Set(initialPosts.map((p) => p.id)));

  const loadMore = async () => {
    if (!hasNextPage || loading) return;
    setLoading(true);
    try {
      const url = new URL('/api/posts', window.location.origin);
      if (after) url.searchParams.set('after', after);
      url.searchParams.set('first', String(pageSize));

      const res = await fetch(url.toString(), { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: { posts: WPPostCard[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } } =
        await res.json();

      // Deduplicate by post.id to avoid duplicates on fast clicks or WP reordering.
      const next: WPPostCard[] = [];
      for (const p of json.posts) {
        if (!seen.current.has(p.id)) {
          seen.current.add(p.id);
          next.push(p);
        }
      }
      setPosts((prev) => prev.concat(next));
      setAfter(json.pageInfo.endCursor);
      setHasNextPage(json.pageInfo.hasNextPage);
    } catch (e) {
      console.error('Load more failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ul className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={loadMore}
          disabled={!hasNextPage || loading}
          aria-disabled={!hasNextPage || loading}
          className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Loading…' : hasNextPage ? 'Load more' : 'No more posts'}
        </button>
      </div>
    </div>
  );
}