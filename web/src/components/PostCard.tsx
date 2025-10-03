// src/components/PostCard.tsx
'use client';

import Link from "next/link";
import Image from "next/image";

export type PostCardPost = {
  id?: string;
  slug: string;
  title: string;
  date?: string | null;
  excerpt?: string | null; // intentionally unused
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
  /** Pass true for above-the-fold cards to improve LCP */
  priority?: boolean;
  /** Ignored (we removed excerpt rendering) */
  safeExcerpt?: boolean;
};

function extractImage(p: PostCardPost) {
  const n = (p.featuredImage as any)?.node;
  if (n?.sourceUrl) return { url: n.sourceUrl as string, alt: n.altText ?? "" };
  const flat = p.featuredImage as any;
  if (flat?.url) return { url: flat.url as string, alt: flat.alt ?? "" };
  return { url: "", alt: "" };
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
}: PostCardProps) {
  const img = extractImage(post);
  const minutes = estimateReadingMinutes(post);

  const dateText = post.date
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(post.date)
      )
    : "";

  const imageAlt = (img.alt?.trim() || post.title || "").slice(0, 280);

  // First category (if present)
  const firstCategory = post.categories?.nodes?.[0];

  return (
    <article className={["group", className].filter(Boolean).join(" ")}>
      <Link href={`/posts/${post.slug}`} className="block" aria-label={post.title}>
        {/* Media — smoother zoom wrapper */}
        <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-neutral-200 dark:bg-neutral-800">
          <div
            className="
              absolute inset-0
              transform-gpu will-change-transform origin-center
              group-hover:scale-[1.06] group-focus-within:scale-[1.06]
            "
            style={{
              transitionProperty: "transform, scale",
              transitionDuration: "1200ms",
              transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
            }}
          >
            {img.url ? (
              <Image
                src={img.url}
                alt={imageAlt}
                fill
                className="object-cover pointer-events-none select-none [backface-visibility:hidden]"
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0" />
            )}
          </div>
        </div>

        {/* Meta (date • reading time) */}
        {(dateText || minutes) && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            {dateText} {dateText && minutes ? <span aria-hidden>·</span> : null}{" "}
            {minutes ? `${minutes} min read` : null}
          </p>
        )}

        {/* Title */}
        <h3
          className="
            mt-1 text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold leading-snug tracking-tight
          "
        >
          <span
            className="
              transition-colors duration-300
              text-[hsl(var(--fg))]
              group-hover:text-slate-600 group-focus-within:text-slate-600
              dark:group-hover:text-slate-300 dark:group-focus-within:text-slate-300
            "
          >
            {post.title}
          </span>
        </h3>
      </Link>

      {/* Category chip (clickable) */}
      {firstCategory ? (
        <div className="pt-3">
          <Link
            href={`/categories/${firstCategory.slug}`}
            aria-label={`View category ${firstCategory.name}`}
            className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 
                       dark:border-white/10 dark:bg-white/5 dark:text-neutral-200
                       hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
          >
            {firstCategory.name}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
