// src/app/api/search/route.ts
import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/wp/api';

// Always dynamic (no cache)
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  const after = searchParams.get('after');

  if (!q) {
    return NextResponse.json({ posts: [], pageInfo: { endCursor: null, hasNextPage: false } }, { status: 200 });
  }

  try {
    const { posts, pageInfo } = await searchPosts({ query: q, first: 8, after });
    // Minimal payload for the overlay
    const slim = posts.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      image: p.featuredImage?.node?.sourceUrl ?? null,
    }));
    return NextResponse.json({ posts: slim, pageInfo }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Search failed' }, { status: 500 });
  }
}