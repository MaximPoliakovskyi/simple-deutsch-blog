// cards.tsx — PostCard + CategoryPills combined (formerly post-card.tsx + category-pills.tsx)
"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/providers";
import { normalizeLevelSlug, sortWordPressBadgesByCefr } from "@/lib/cefr";
import {
  buildLocalizedHref,
  type CefrLevelCode,
  formatPostCardDate,
  getCefrLevelLabel,
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

type Categories = {
  nodes: Array<{ name: string; slug: string }>;
} | null;

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

const PostCard = memo(function PostCard({ post, className, priority = false }: PostCardProps) {
  const img = extractImage(post);
  const { locale } = useI18n();
  const computedDateText = formatPostCardDate(post.date, locale) ?? "";
  const imageAlt = (img.alt?.trim() || post.title || "").slice(0, 280);
  const titleId = useId();
  const categories = (post.categories?.nodes ?? []).filter(
    (c) => !isHiddenCategory(c.name, c.slug),
  );
  const href = post.href ?? buildLocalizedHref(locale, `/posts/${post.slug}`);

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
        {((post.dateText ?? computedDateText) || post.readingText) && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            {post.dateText ?? computedDateText}{" "}
            {(post.dateText ?? computedDateText) && post.readingText ? (
              <span aria-hidden>{"\u00B7"}</span>
            ) : null}{" "}
            {post.readingText}
          </p>
        )}
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
          className={["h-10 rounded-full", item.widthClass, "sd-skeleton"].join(" ")}
        />
      ))}
    </div>
  );
}

type Category = { id: string; name: string; slug: string };
type WordPressBadgePill = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  levelColor?: string | null;
};

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

  const getTagDescription = useCallback(
    (slug: string): string | undefined => t(`${slug.toLowerCase()}Description`),
    [t],
  );

  const defaultSelected = useMemo(() => {
    if (initialSelected !== undefined && initialSelected !== null) return initialSelected;
    if (required) return categories.length > 0 ? categories[0].slug : null;
    return null;
  }, [categories, initialSelected, required]);

  const [internalSelected, setInternalSelected] = useState<string | null>(defaultSelected ?? null);
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
      {categories.length === 0 ? (
        <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("noCategories")}</div>
      ) : (
        categories.map((cat) => {
          const active = currentSelected === cat.slug;
          const description = getTagDescription(cat.slug);
          const displayName = translateCategory(cat.name, cat.slug, locale);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                const next = required ? cat.slug : currentSelected === cat.slug ? null : cat.slug;
                if (!isControlled) setInternalSelected(next);
                onSelect(next);
              }}
              className={`type-button inline-flex items-center px-4 py-2 rounded-full border shadow-sm focus:outline-none focus-visible:outline-none transition-colors cursor-pointer ${
                active
                  ? "sd-pill ring-2 ring-blue-50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  : "sd-pill text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700 hover:opacity-95"
              }`}
              title={description}
              aria-label={description ? `${displayName}: ${description}` : displayName}
            >
              <span>{displayName}</span>
            </button>
          );
        })
      )}
    </div>
  );
});

const WordPressBadgePills = memo(function WordPressBadgePills({
  badges,
  onSelect,
  initialSelected,
  selected,
  alignment = "center",
  required = false,
  loading = false,
  loadingCount = 6,
}: {
  badges: WordPressBadgePill[];
  onSelect: (slug: string | null) => void;
  initialSelected?: string | null;
  selected?: string | null;
  alignment?: "left" | "center";
  required?: boolean;
  loading?: boolean;
  loadingCount?: number;
}) {
  const { locale } = useI18n();
  const sortedBadges = useMemo(() => sortWordPressBadgesByCefr(badges), [badges]);

  const defaultSelected = useMemo(() => {
    if (initialSelected !== undefined && initialSelected !== null) return initialSelected;
    if (required) return sortedBadges[0]?.slug ?? null;
    return null;
  }, [initialSelected, required, sortedBadges]);

  const [internalSelected, setInternalSelected] = useState<string | null>(defaultSelected ?? null);
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

  if (sortedBadges.length === 0) {
    return null;
  }

  return (
    <div className={containerClass}>
      {sortedBadges.map((badge) => {
        const active = currentSelected === badge.slug;
        const description = badge.description?.trim() || undefined;
        const cefrCode = normalizeLevelSlug(badge.slug)?.toUpperCase() as CefrLevelCode | undefined;
        const emojiPrefix = (() => {
          const m = badge.name?.match(/^\p{Emoji_Presentation}/u);
          return m ? m[0] : null;
        })();
        const displayName = cefrCode
          ? (() => {
              const full = getCefrLevelLabel(locale, cefrCode);
              const label = full.replace(/^[A-C][12]\s*[—–-]\s*/i, "").trim();
              const localized = `${cefrCode} (${label})`;
              return emojiPrefix ? `${emojiPrefix} ${localized}` : localized;
            })()
          : badge.name;

        return (
          <button
            key={badge.id}
            type="button"
            onClick={() => {
              const next = required
                ? badge.slug
                : currentSelected === badge.slug
                  ? null
                  : badge.slug;
              if (!isControlled) setInternalSelected(next);
              onSelect(next);
            }}
            className={`type-button inline-flex items-center px-4 py-2 rounded-full border shadow-sm focus:outline-none focus-visible:outline-none transition-colors cursor-pointer ${
              active
                ? "sd-pill ring-2 ring-blue-50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                : "sd-pill text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700 hover:opacity-95"
            }`}
            title={description}
            aria-label={description ? `${displayName}: ${description}` : displayName}
          >
            <span>{displayName}</span>
          </button>
        );
      })}
    </div>
  );
});

export { CategoryPills, WordPressBadgePills };
