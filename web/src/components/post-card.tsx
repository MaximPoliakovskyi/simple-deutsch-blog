import Image from "next/image";
import Link from "next/link";
import {
  buildLocalizedHref,
  formatPostCardDate,
  type Locale,
  resolveReadingTimeLabel,
  translateCategory,
} from "@/lib/i18n";
import ReadStatusIndicator from "./read-status-indicator";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Inline to avoid importing @/lib/posts (which drags in server-only modules).
function isHiddenCategory(name?: string | null, slug?: string | null): boolean {
  const hiddenKeys = [
    "english",
    "russian",
    "ukrainian",
    "ÑƒÐºÑ€Ð°Ñ—Ð½ÑÑŒÐºÐ°",
    "Ñ€ÑƒÑÑÐºÐ¸Ð¹",
    "Ð°Ð½Ð³Ð»Ð¸Ð¹ÑÐºÐ¸Ð¹",
    "Ð°Ð½Ð³Ð»",
    "blog",
  ] as const;
  const nameLower = (name ?? "").toLowerCase();
  const slugLower = (slug ?? "").toLowerCase();
  return hiddenKeys.some(
    (key) => nameLower.includes(key) || slugLower === key || slugLower.includes(key),
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

type Categories = {
  nodes: Array<{ name: string; slug: string }>;
} | null;

export type PostCardPost = {
  id?: string;
  slug: string;
  title: string;
  date?: string | null;
  excerpt?: string | null;
  author?: { node?: { name?: string | null } | null } | null;
  categories?: Categories;
  featuredImage?: FeaturedImageNode | FeaturedImageFlat | null;
  featuredImageUrl?: string | null;
  readingMinutes?: number | null;
  readingWords?: number | null;
  readingWordsPerMinute?: number | null;
  readingText?: string | null;
  dateText?: string | null;
  href?: string | null;
};

export type PostCardProps = {
  post: PostCardPost;
  className?: string;
  priority?: boolean;
  /** Locale used to build localized hrefs and format date. Defaults to "en". */
  locale?: Locale;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasNode(fi: unknown): fi is FeaturedImageNode {
  return Boolean(fi && typeof fi === "object" && "node" in fi);
}

function hasFlatUrl(fi: unknown): fi is FeaturedImageFlat {
  return Boolean(fi && typeof fi === "object" && "url" in fi);
}

function extractImage(p: PostCardPost) {
  const fi = p.featuredImage;
  if (hasNode(fi)) {
    const node = fi.node;
    if (node?.sourceUrl) return { url: String(node.sourceUrl), alt: String(node.altText ?? "") };
  }
  if (hasFlatUrl(fi) && fi.url) {
    return { url: String(fi.url), alt: String(fi.alt ?? "") };
  }
  if (p.featuredImageUrl) return { url: p.featuredImageUrl, alt: "" };
  return { url: "", alt: "" };
}

// ---------------------------------------------------------------------------
// PostCard — no "use client": renders on server when used in Server Components,
// and on client when imported by Client Components.
// ---------------------------------------------------------------------------

export default function PostCard({
  post,
  className,
  priority = false,
  locale = "en",
}: PostCardProps) {
  const img = extractImage(post);
  const computedDateText = formatPostCardDate(post.date, locale) ?? "";
  const imageAlt = (img.alt?.trim() || post.title || "").slice(0, 280);
  // Use a deterministic ID derived from the post identifier so the element
  // is stable across server and client renders without needing useId().
  const titleId = `post-card-title-${post.id ?? post.slug}`;
  const categories = (post.categories?.nodes ?? []).filter(
    (c) => !isHiddenCategory(c.name, c.slug),
  );
  const href = post.href ?? buildLocalizedHref(locale, `/posts/${post.slug}`);
  const readingLabel = resolveReadingTimeLabel(post.readingMinutes, post.readingText, locale);
  const metaDateText = post.dateText ?? computedDateText;
  const primaryMetadata = [
    { key: "date", value: metaDateText },
    { key: "reading", value: readingLabel },
  ].filter((item): item is { key: string; value: string } => Boolean(item.value));

  return (
    <article
      className={[
        "group",
        "transition-transform duration-300 ease-out hover:-translate-y-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link href={href} className="block" aria-labelledby={titleId}>
        <div className="relative overflow-hidden rounded-2xl aspect-4/3 bg-neutral-200 dark:bg-neutral-800">
          <div
            className="absolute inset-0 transform-gpu will-change-transform origin-center group-hover:scale-[1.06] group-focus-within:scale-[1.06]"
            style={{
              transitionProperty: "transform, scale",
              transitionDuration: "1200ms",
              transitionTimingFunction: "var(--motion-spring)",
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
        <div className="type-ui-label mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 leading-6 text-neutral-500 dark:text-neutral-400">
          {primaryMetadata.length > 0 ? (
            <span className="flex min-w-0 max-w-full flex-wrap items-baseline gap-x-2 gap-y-1 leading-6">
              {primaryMetadata.map((item, index) => (
                <span
                  key={item.key}
                  className="inline-flex min-w-0 max-w-full items-baseline gap-2 leading-6"
                >
                  {index > 0 ? (
                    <span aria-hidden className="shrink-0 leading-none">
                      {"\u00B7"}
                    </span>
                  ) : null}
                  <span className="min-w-0">{item.value}</span>
                </span>
              ))}
            </span>
          ) : null}
          <span className="min-w-0 max-w-full leading-6">
            <ReadStatusIndicator identifier={href} variant="inline" />
          </span>
        </div>
        <h3 id={titleId} className="mt-1 type-card-title">
          <span className="transition-colors duration-300 text-[hsl(var(--fg))] group-hover:text-slate-600 group-focus-within:text-slate-600 dark:group-hover:text-slate-300 dark:group-focus-within:text-slate-300">
            {post.title}
          </span>
        </h3>
      </Link>
      {categories.length > 0 ? (
        <div className="pt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={buildLocalizedHref(locale, `/categories/${cat.slug}`)}
              className="type-ui-label inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10"
            >
              {translateCategory(cat.name, cat.slug, locale)}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
