// src/components/PostCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

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
  const fi = p.featuredImage;
  // shape: { node: { sourceUrl, altText } }
  if (fi && typeof fi === "object" && "node" in fi) {
    const node = (fi as Record<string, unknown>).node as Record<string, unknown> | undefined;
    if (node && typeof node === "object" && node.sourceUrl)
      return { url: String(node.sourceUrl), alt: String(node.altText ?? "") };
  }
  // shape: { url, alt }
  if (fi && typeof fi === "object" && "url" in fi && (fi as Record<string, unknown>).url) {
    const r = fi as Record<string, unknown>;
    return { url: String(r.url), alt: String(r.alt ?? "") };
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

export default function PostCard({ post, className, priority = false }: PostCardProps) {
  const img = extractImage(post);
  const minutes = estimateReadingMinutes(post);

  const dateText = post.date
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(post.date),
      )
    : "";

  const imageAlt = (img.alt?.trim() || post.title || "").slice(0, 280);

  // All categories (instead of only the first)
  const categories = post.categories?.nodes ?? [];

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

      {/* Category chips (clickable, multiple) */}
      {categories.length > 0 ? (
        <div className="pt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              aria-label={`View category ${cat.name}`}
              className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 
                         dark:border-white/10 dark:bg-white/5 dark:text-neutral-200
                         hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
