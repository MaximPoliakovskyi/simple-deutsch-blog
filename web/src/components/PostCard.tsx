// src/components/PostCard.tsx
'use client';

import Link from "next/link";
import Image from "next/image";

export type PostCardPost = {
  id?: string;
  slug: string;
  title: string;
  date?: string | null;
  excerpt?: string | null;
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
  priority?: boolean;
  safeExcerpt?: boolean;
};

function extractImage(p: PostCardPost) {
  const n = (p.featuredImage as any)?.node;
  if (n?.sourceUrl) {
    return {
      url: n.sourceUrl as string,
      alt: n.altText ?? "",
      width: n.mediaDetails?.width ?? undefined,
      height: n.mediaDetails?.height ?? undefined,
    };
  }
  const flat = p.featuredImage as any;
  if (flat?.url) {
    return {
      url: flat.url as string,
      alt: flat.alt ?? "",
      width: flat.width ?? undefined,
      height: flat.height ?? undefined,
    };
  }
  return { url: "", alt: "", width: undefined, height: undefined };
}

function estimateReadingMinutes(post: PostCardPost) {
  if (post.readingMinutes) return Math.max(1, Math.round(post.readingMinutes));
  const html = post.excerpt ?? post.title ?? "";
  const text = html.replace(/<[^>]+>/g, " ");
  const words = (text.trim().match(/\S+/g) ?? []).length;
  return Math.max(1, Math.round(words / 200));
}

export default function PostCard({
  post,
  className,
  priority = false,
  safeExcerpt = false,
}: PostCardProps) {
  const img = extractImage(post);
  const minutes = estimateReadingMinutes(post);

  const dateText = post.date
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(post.date)
      )
    : "";

  const pill =
    post.categories?.nodes?.[0]?.name ??
    (post.author?.node?.name ? post.author.node.name : "News");

  const imageAlt = img.alt?.trim() || post.title || "";

  return (
    <article className={["group", className].filter(Boolean).join(" ")}>
      <Link href={`/posts/${post.slug}`} className="block" aria-label={post.title}>
        {/* Media */}
        <div className="overflow-hidden rounded-2xl">
          {img.url ? (
            img.width && img.height ? (
              // ✅ Intrinsic sizing (preferred)
              <Image
                src={img.url}
                alt={imageAlt}
                width={img.width}
                height={img.height}
                className="h-auto w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            ) : (
              // ✅ Fallback to fill when no dimensions
              <div className="relative aspect-video">
                <Image
                  src={img.url}
                  alt={imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03] rounded-2xl"
                  priority={priority}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              </div>
            )
          ) : (
            <div className="aspect-video w-full bg-gray-100 rounded-2xl" />
          )}
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
            safeExcerpt ? (
              <p className="prose prose-sm text-neutral-600 line-clamp-3">
                {post.excerpt.replace(/<[^>]+>/g, "").trim()}
              </p>
            ) : (
              <div
                className="prose prose-sm text-neutral-600 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
            )
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
