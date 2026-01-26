// src/components/PostCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { getLevelLabel } from "@/core/cefr/levels";
import { isHiddenCategory } from "@/core/content/hiddenCategories";
import { translateCategory } from "@/core/i18n/categoryTranslations";
import { useI18n } from "@/core/i18n/LocaleProvider";

type FeaturedImageNode = {
  node?: {
    sourceUrl?: string | null;
    altText?: string | null;
    mediaDetails?: { width?: number | null; height?: number | null } | null;
  } | null;
};

type FeaturedImageFlat = {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type Categories = { nodes: Array<{ name: string; slug: string }> } | null;

export type PostCardPost = {
  id?: string;
  slug: string;
  title: string;
  date?: string | null;
  excerpt?: string | null; // intentionally unused
  content?: string | null;
  author?: { node?: { name?: string | null } | null } | null;
  categories?: Categories;
  featuredImage?: FeaturedImageNode | FeaturedImageFlat | null;
  featuredImageUrl?: string | null;
  readingMinutes?: number | null;
  readingText?: string | null;
  dateText?: string | null;
  href?: string | null;
};

export type PostCardProps = {
  post: PostCardPost;
  className?: string;
  /** Pass true for above-the-fold cards to improve LCP */
  priority?: boolean;
  /** Ignored (we removed excerpt rendering) */
  safeExcerpt?: boolean;
};

function hasNode(fi: unknown): fi is FeaturedImageNode {
  return Boolean(fi && typeof fi === "object" && "node" in fi);
}

function hasFlatUrl(fi: unknown): fi is FeaturedImageFlat {
  return Boolean(fi && typeof fi === "object" && "url" in fi);
}

function extractImage(p: PostCardPost) {
  const fi = p.featuredImage;
  // shape: { node: { sourceUrl, altText } }
  if (hasNode(fi)) {
    const node = fi.node;
    if (node?.sourceUrl) return { url: String(node.sourceUrl), alt: String(node.altText ?? "") };
  }
  // shape: { url, alt }
  if (hasFlatUrl(fi) && fi.url) {
    return { url: String(fi.url), alt: String(fi.alt ?? "") };
  }
  // Fallback: use featuredImageUrl from custom WP field (bypasses broken MediaItem)
  if (p.featuredImageUrl) {
    return { url: p.featuredImageUrl, alt: "" };
  }
  return { url: "", alt: "" };
}

function estimateReadingMinutes(post: PostCardPost): number | null {
  // Prefer an explicit readingMinutes field from the API.
  if (post.readingMinutes != null) return Math.max(1, Math.ceil(post.readingMinutes));

  // Calculate from the full content for accuracy. With the updated queries,
  // content should now be available in all list views.
  const html = post.content ?? post.excerpt ?? "";

  // If no content or excerpt available, don't show reading time
  if (!html) return null;

  // Strip HTML tags and count words
  const text = html.replace(/<[^>]+>/g, " ");
  const words = (text.trim().match(/\S+/g) ?? []).length;

  // Only show reading time if there's meaningful content (at least 40 words)
  // This avoids showing "1 min read" for very short posts or excerpts
  const MIN_WORDS_FOR_ESTIMATE = 40;
  if (words < MIN_WORDS_FOR_ESTIMATE) return null;

  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(words / 200));
}

export default function PostCard({ post, className, priority = false }: PostCardProps) {
  const img = extractImage(post);
  const minutes = estimateReadingMinutes(post);

  const { t, locale } = useI18n();

  const computedDateText = post.date
    ? new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(new Date(post.date))
    : "";

  const imageAlt = (img.alt?.trim() || post.title || "").slice(0, 280);

  // All categories (instead of only the first)
  const categories = (post.categories?.nodes ?? []).filter(
    (c) => !isHiddenCategory(c.name, c.slug),
  );

  const prefix = locale === "en" ? "" : `/${locale}`;
  const href = post.href ?? `${prefix}/posts/${post.slug}`;

  return (
    <article className={["group", className].filter(Boolean).join(" ")}>
      <Link href={href} className="block" aria-label={post.title}>
        {/* Media — smoother zoom wrapper */}
        <div className="relative overflow-hidden rounded-2xl aspect-4/3 bg-neutral-200 dark:bg-neutral-800">
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
                className="object-cover pointer-events-none select-none backface-hidden"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0" />
            )}
          </div>
        </div>

        {/* Meta (date • reading time) */}
        {((post.dateText ?? computedDateText) || minutes) && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            {post.dateText ?? computedDateText}{" "}
            {(post.dateText ?? computedDateText) &&
            (post.readingText ?? (minutes ? `${minutes} ${t("minRead")}` : null)) ? (
              <span aria-hidden>·</span>
            ) : null}{" "}
            {post.readingText ?? (minutes ? `${minutes} ${t("minRead")}` : null)}
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
              href={`${prefix}/categories/${cat.slug}`}
              aria-label={`${t("viewCategoryAria")} ${getLevelLabel(cat.slug, locale) ?? translateCategory(cat.name, cat.slug, locale)}`}
              className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 
                         dark:border-white/10 dark:bg-white/5 dark:text-neutral-200
                         hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
            >
              {getLevelLabel(cat.slug, locale) ?? translateCategory(cat.name, cat.slug, locale)}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
