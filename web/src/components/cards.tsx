// cards.tsx — PostCard + CategoryPills combined (formerly post-card.tsx + category-pills.tsx)
"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/providers";
import {
  buildLocalizedHref,
  formatPostCardDate,
  getLevelDescription,
  getLevelLabel,
  translateCategory,
} from "@/lib/i18n";

// ---------------------------------------------------------------------------
// PostCard
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

type Categories = { nodes: Array<{ name: string; slug: string }> } | null;

function isHiddenCategory(name?: string | null, slug?: string | null) {
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

export type PostCardPost = {
  id?: string;
  slug: string;
  title: string;
  date?: string | null;
  excerpt?: string | null;
  content?: string | null;
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
  safeExcerpt?: boolean;
  /** Zero-based index used to stagger the fade-in animation delay */
  index?: number;
};

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

const PostCard = memo(function PostCard({
  post,
  className,
  priority = false,
  index = 0,
}: PostCardProps) {
  const img = extractImage(post);
  const { t, locale } = useI18n();
  const computedDateText = formatPostCardDate(post.date, locale) ?? "";
  const imageAlt = (img.alt?.trim() || post.title || "").slice(0, 280);
  const categories = (post.categories?.nodes ?? []).filter(
    (c) => !isHiddenCategory(c.name, c.slug),
  );
  const href = post.href ?? buildLocalizedHref(locale, `/posts/${post.slug}`);

  return (
    <article
      className={["group", "sd-fade-in-item", className].filter(Boolean).join(" ")}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <Link href={href} className="block" aria-label={post.title}>
        <div className="relative overflow-hidden rounded-2xl aspect-4/3 bg-neutral-200 dark:bg-neutral-800">
          <div
            className="absolute inset-0 transform-gpu will-change-transform origin-center group-hover:scale-[1.06] group-focus-within:scale-[1.06]"
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
        {((post.dateText ?? computedDateText) || post.readingText) && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            {post.dateText ?? computedDateText}{" "}
            {(post.dateText ?? computedDateText) && post.readingText ? (
              <span aria-hidden>{"\u00B7"}</span>
            ) : null}{" "}
            {post.readingText}
          </p>
        )}
        <h3 className="mt-1 text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold leading-snug tracking-tight">
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
              aria-label={`${t("viewCategoryAria")} ${getLevelLabel(cat.slug, locale) ?? translateCategory(cat.name, cat.slug, locale)}`}
              className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
            >
              {getLevelLabel(cat.slug, locale) ?? translateCategory(cat.name, cat.slug, locale)}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
});

export default PostCard;
// ---------------------------------------------------------------------------
// CategoryPills + CategoryPillsSkeleton
// ---------------------------------------------------------------------------

const DEFAULT_WIDTHS = ["w-36", "w-24", "w-32", "w-40", "w-28", "w-44"];

export function CategoryPillsSkeleton({
  count = 6,
  alignment = "center",
}: {
  count?: number;
  alignment?: "left" | "center";
}) {
  const containerClass = `mx-0 my-8 flex flex-wrap gap-3 ${alignment === "center" ? "justify-center" : "justify-start"}`;
  const items = Array.from({ length: count }, (_, index) => ({
    key: `${DEFAULT_WIDTHS[index % DEFAULT_WIDTHS.length]}-${Math.floor(index / DEFAULT_WIDTHS.length)}`,
    widthClass: DEFAULT_WIDTHS[index % DEFAULT_WIDTHS.length],
  }));

  return (
    <div className={containerClass} aria-hidden="true">
      {items.map((item) => (
        <div
          key={item.key}
          className={[
            "relative h-10 rounded-full overflow-hidden",
            item.widthClass,
            "border border-white/8 bg-neutral-900/90 shadow-sm",
            "sd-shimmer",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

type Category = { id: string; name: string; slug: string };

const CategoryPills = memo(function CategoryPills({
  categories,
  onSelect,
  initialSelected,
  selected,
  alignment = "center",
  required = false,
  loading = false,
  loadingCount = 6,
}: {
  categories: Category[];
  onSelect: (slug: string | null) => void;
  initialSelected?: string | null;
  selected?: string | null;
  alignment?: "left" | "center";
  required?: boolean;
  loading?: boolean;
  loadingCount?: number;
}) {
  const { t, locale } = useI18n();

  const CEFR_ORDER = useMemo(() => ["A1", "A2", "B1", "B2", "C1", "C2"], []);
  const CEFR_ORDER_MAP = useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < CEFR_ORDER.length; i++) {
      m.set(CEFR_ORDER[i], i);
    }
    return m;
  }, [CEFR_ORDER]);

  const CEFR_STICKER: Record<string, string> = useMemo(
    () => ({
      A1: "bg-green-500",
      A2: "bg-yellow-400",
      B1: "bg-orange-500",
      B2: "bg-red-500",
      C1: "bg-purple-500",
      C2: "bg-black",
    }),
    [],
  );

  const isCefrLevel = useCallback(
    (slug?: string): boolean => {
      if (!slug) return false;
      return CEFR_ORDER.includes(slug.toUpperCase());
    },
    [CEFR_ORDER],
  );

  const sortedCategories = useMemo(() => {
    const cefr = categories.filter((c) => isCefrLevel(c.slug));
    const nonCefr = categories.filter((c) => !isCefrLevel(c.slug));
    const sortedCefr = cefr.sort((a, b) => {
      const ia = CEFR_ORDER_MAP.get(a.slug?.toUpperCase() ?? "") ?? 999;
      const ib = CEFR_ORDER_MAP.get(b.slug?.toUpperCase() ?? "") ?? 999;
      return ia - ib;
    });
    return [...sortedCefr, ...nonCefr];
  }, [categories, CEFR_ORDER_MAP, isCefrLevel]);

  const getTagDescription = useCallback(
    (slug: string): string | undefined => {
      const fromLevels = getLevelDescription(slug, locale ?? "en");
      if (fromLevels) return fromLevels;
      return t(`${slug.toLowerCase()}Description`);
    },
    [t, locale],
  );

  const defaultSelected = useMemo(() => {
    if (initialSelected !== undefined && initialSelected !== null) return initialSelected;
    if (sortedCategories.some((c) => isCefrLevel(c.slug))) {
      const a1 = sortedCategories.find((c) => (c.slug ?? "").toLowerCase() === "a1");
      if (a1) return a1.slug;
    }
    if (required) return sortedCategories.length > 0 ? sortedCategories[0].slug : null;
    return null;
  }, [initialSelected, required, sortedCategories, isCefrLevel]);

  const [internalSelected, setInternalSelected] = useState<string | null>(
    defaultSelected ?? null,
  );
  const previousDefaultSelectedRef = useRef<string | null>(defaultSelected ?? null);
  const isControlled = selected !== undefined;
  const currentSelected = isControlled ? selected : internalSelected;

  useEffect(() => {
    if (isControlled) return;
    if (previousDefaultSelectedRef.current === (defaultSelected ?? null)) return;
    previousDefaultSelectedRef.current = defaultSelected ?? null;
    setInternalSelected(defaultSelected ?? null);
  }, [defaultSelected, isControlled]);

  const containerClass = `mx-0 my-8 flex flex-wrap gap-3 ${alignment === "center" ? "justify-center" : "justify-start"}`;

  if (loading) {
    return <CategoryPillsSkeleton count={loadingCount} alignment={alignment} />;
  }

  return (
    <div className={containerClass}>
      {sortedCategories.length === 0 ? (
        <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("noCategories")}</div>
      ) : (
        sortedCategories.map((cat) => {
          const active = currentSelected === cat.slug;
          const description = getTagDescription(cat.slug);
          const displayName =
            getLevelLabel(cat.slug, locale ?? "en") ??
            translateCategory(cat.name, cat.slug, locale);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                const next = required ? cat.slug : currentSelected === cat.slug ? null : cat.slug;
                if (!isControlled) setInternalSelected(next);
                onSelect(next);
              }}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border shadow-sm focus:outline-none focus-visible:outline-none transition-colors cursor-pointer ${
                active
                  ? "sd-pill ring-2 ring-blue-50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  : "sd-pill text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700 hover:opacity-95"
              }`}
              title={description}
              aria-label={description ? `${displayName}: ${description}` : displayName}
            >
              <span className="flex items-center">
                {(() => {
                  const stickerClass = CEFR_STICKER[cat.slug?.toUpperCase() ?? ""] ?? "";
                  return stickerClass ? (
                    <span className={`w-2.5 h-2.5 rounded-full ${stickerClass} mr-2`} />
                  ) : null;
                })()}
                <span>{displayName}</span>
              </span>
            </button>
          );
        })
      )}
    </div>
  );
});

export { CategoryPills };
