"use client";

import * as React from "react";
import { translateCategory } from "@/core/i18n/categoryTranslations";
import { getLevelLabel, getLevelDescription } from "@/core/cefr/levels";
import { useI18n } from "@/core/i18n/LocaleProvider";

type Category = { id: string; name: string; slug: string };

export default function CategoryPills({
  categories,
  onSelect,
  initialSelected,
  alignment = "center",
  required = false,
}: {
  categories: Category[];
  onSelect: (slug: string | null) => void;
  initialSelected?: string | null;
  /** Layout alignment for the pills: 'left' or 'center' (default: center) */
  alignment?: "left" | "center";
  /** When true, a category must always be selected and cannot be deselected */
  required?: boolean;
}) {
  const { t, locale } = useI18n();

  // Enforce fixed CEFR ordering on client-side (only for CEFR levels, not content categories)
  const CEFR_ORDER = React.useMemo(() => ["A1", "A2", "B1", "B2", "C1", "C2"], []);
  const CEFR_ORDER_MAP = React.useMemo(() => {
    const m = new Map<string, number>();
    CEFR_ORDER.forEach((s, i) => m.set(s, i));
    return m;
  }, [CEFR_ORDER]);

  // Map of sticker colors for each CEFR label (uppercase key)
  const CEFR_STICKER: Record<string, string> = React.useMemo(() => ({
    A1: "bg-green-500",
    A2: "bg-yellow-400",
    B1: "bg-orange-500",
    B2: "bg-red-500",
    C1: "bg-purple-500",
    C2: "bg-black",
  }), []);

  // Check if a category is a CEFR level
  const isCefrLevel = React.useCallback((slug?: string): boolean => {
    if (!slug) return false;
    const upperSlug = slug.toUpperCase();
    return CEFR_ORDER.includes(upperSlug);
  }, [CEFR_ORDER]);

  // Sorted categories: CEFR levels first (in order), then others
  const sortedCategories = React.useMemo(() => {
    const cefr = categories.filter(c => isCefrLevel(c.slug));
    const nonCefr = categories.filter(c => !isCefrLevel(c.slug));
    
    // Sort CEFR levels by CEFR_ORDER
    const sortedCefr = cefr.sort((a, b) => {
      const ia = CEFR_ORDER_MAP.get(a.slug?.toUpperCase() ?? "") ?? 999;
      const ib = CEFR_ORDER_MAP.get(b.slug?.toUpperCase() ?? "") ?? 999;
      return ia - ib;
    });

    // Keep non-CEFR categories in their original order
    return [...sortedCefr, ...nonCefr];
  }, [categories, CEFR_ORDER_MAP, isCefrLevel]);

  // Helper to get CEFR level description by tag slug
  const getTagDescription = React.useCallback((slug: string): string | undefined => {
    // Prefer centralized CEFR descriptions when available, fall back to translations
    const fromLevels = getLevelDescription(slug, locale ?? "en");
    if (fromLevels) return fromLevels;
    const normalized = slug.toLowerCase();
    const key = `${normalized}Description`;
    return t(key);
  }, [t, locale]);

  // If `required` is true and no explicit initialSelected was provided, default
  // to the first category's slug when categories are available.
  const defaultSelected = React.useMemo(() => {
    if (initialSelected !== undefined && initialSelected !== null) return initialSelected;

    // Only prefer A1 if we're actually dealing with CEFR levels
    if (sortedCategories.some(c => isCefrLevel(c.slug))) {
      const a1 = sortedCategories.find((c) => (c.slug ?? "").toLowerCase() === "a1");
      if (a1) return a1.slug;
    }

    if (required) return sortedCategories.length > 0 ? sortedCategories[0].slug : null;
    return null;
  }, [initialSelected, required, sortedCategories, isCefrLevel]);

  const [selected, setSelected] = React.useState<string | null>(defaultSelected ?? null);

  React.useEffect(() => {
    // keep parent in sync
    onSelect(selected);
  }, [selected, onSelect]);

  const containerClass = `mx-0 my-8 flex flex-wrap gap-3 ${alignment === "center" ? "justify-center" : "justify-start"}`;

  return (
    <div className={containerClass}>
      {sortedCategories.length === 0 ? (
        <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("noCategories")}</div>
      ) : (
        sortedCategories.map((cat) => {
          // active only when the category slug matches the selected value
          const active = selected === cat.slug;
          const description = getTagDescription(cat.slug);
          const displayName = getLevelLabel(cat.slug, locale ?? "en") ?? translateCategory(cat.name, cat.slug, locale);
          // compute sticker class safely to avoid 'undefined' being inserted
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                setSelected((s) => {
                  if (required) {
                    // If required, never clear selection; clicking the active stays active
                    return cat.slug;
                  }
                  return s === cat.slug ? null : cat.slug;
                })
              }
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border shadow-sm focus:outline-none transition-colors cursor-pointer ${
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
}
