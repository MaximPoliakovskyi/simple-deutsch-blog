// src/components/PostCard.tsx
import Link from 'next/link';

export type PostCardPost = {
  id: string;
  slug: string;
  title: string;
  date?: string | null;
  excerpt?: string | null;
  featuredImage?: { node?: { sourceUrl?: string | null; altText?: string | null } | null } | null;
  author?: { node?: { name?: string | null } | null } | null;
  categories?: { nodes: Array<{ name: string; slug: string }> };
};

export type PostCardProps = {
  post: PostCardPost;
  className?: string;
};

export default function PostCard({ post, className }: PostCardProps) {
  const img = post.featuredImage?.node?.sourceUrl ?? null;
  const alt = post.featuredImage?.node?.altText ?? '';

  return (
    <article className={className}>
      <Link href={`/posts/${post.slug}`} className="group block overflow-hidden rounded-2xl border">
        {img ? (
          // Next/Image is fine too if you already use it; this keeps it simple.
          <img
            src={img}
            alt={alt}
            className="aspect-[16/9] w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="aspect-[16/9] w-full bg-gray-100" />
        )}
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 text-lg font-semibold">{post.title}</h3>
          {post.excerpt ? (
            <div
              className="line-clamp-3 text-sm text-gray-600"
              // Carefully render the short WP excerpt
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
          ) : null}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{post.author?.node?.name ?? '—'}</span>
            <time dateTime={post.date ?? undefined}>{post.date?.slice(0, 10) ?? ''}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}
