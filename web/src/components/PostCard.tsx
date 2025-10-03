// src/components/PostCard.tsx
'use client';

import Link from "next/link";
import Image from "next/image";

export type PostCardPost = {
  id?: string;
  slug: string;
  title: string;
  date?: string | null; // ISO
  excerpt?: string | null; // may contain HTML from WP
  author?: { node?: { name?: string | null } | null } | null;
  categories?: { nodes: Array<{ name: string; slug: string }> } | null;

  featuredImage?:
    | {
        node?: {
          sourceUrl?: string | null;
          altText?: string | null;
          mediaDetails?: { width?: number | null; height?: number | null } | null;
        } | null;
      }
    | {
        url?: string | null;
        alt?: string | null;
        width?: number | null;
        height?: number | null;
      }
    | null;

  readingMinutes?: number | null;
};

export type PostCardProps = {
  post: PostCardPost;
  className?: string;
};

function extractImage(p: PostCardPost) {
  const n = (p.featuredImage as any)?.node;
  if (n?.sourceUrl) {
    return {
      url: n.sourceUrl as string,
      alt: (n.altText ?? "") as string,
      width: n.mediaDetails?.width ?? undefined,
      height: n.mediaDetails?.height ?? undefined,
    };
  }
  const flat = p.featuredImage as any;
  if (flat?.url) {
    return {
      url: flat.url as string,
      alt: (flat.alt ?? "") as string,
      width: flat.width ?? undefined,
      height: flat.height ?? undefined,
    };
  }
  return { url: "", alt: "" };
}

function estimateReadingMinutes(post: PostCardPost) {
  if (post.readingMinutes) return Math.max(1, Math.round(post.readingMinutes));
  const html = post.excerpt ?? post.title ?? "";
  const text = html.replace(/<[^>]+>/g, " ");
  const words = (text.trim().match(/\S+/g) ?? []).length;
  return Math.max(1, Math.round(words / 200));
}

export default function PostCard({ post, className }: PostCardProps) {
  const img = extractImage(post);
  const minutes = estimateReadingMinutes(post);

  // deterministic date string: pin locale + timezone
  const dateText = post.date
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(post.date)
      )
    : "";

  const pill =
    post.categories?.nodes?.[0]?.name ??
    (post.author?.node?.name ? post.author.node.name : "News");

  return (
    <article className={["group", className].filter(Boolean).join(" ")}>
      <Link href={`/posts/${post.slug}`} className="block">
        {/* Media */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="aspect-video">
            {img.url ? (
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                priority={false}
              />
            ) : (
              <div className="h-full w-full bg-gray-100" />
            )}
          </div>
        </div>

        {/* Meta + title + excerpt */}
        <div className="mt-4 space-y-2">
          {(dateText || minutes) && (
            <p className="text-sm text-neutral-500">
              {dateText} {dateText && minutes ? <span aria-hidden>·</span> : null}{" "}
              {minutes ? `${minutes} min read` : null}
            </p>
          )}

          <h3 className="text-xl font-semibold leading-snug tracking-tight line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt ? (
            <div
              className="prose prose-sm text-neutral-600 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
          ) : null}

          <div className="pt-2">
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm leading-none text-neutral-600">
              {pill}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}