"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/providers";
import { normalizeLevelSlug, sortWordPressBadgesByCefr } from "@/lib/cefr";
import { type CefrLevelCode, getCefrLevelLabel, translateCategory } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// CategoryPillsSkeleton
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

// ---------------------------------------------------------------------------
// CategoryPills
// ---------------------------------------------------------------------------

type Category = { id: string; name: string; slug: string };

export const CategoryPills = memo(function CategoryPills({
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

// ---------------------------------------------------------------------------
// WordPressBadgePills
// ---------------------------------------------------------------------------

type WordPressBadgePill = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  levelColor?: string | null;
};

export const WordPressBadgePills = memo(function WordPressBadgePills({
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
