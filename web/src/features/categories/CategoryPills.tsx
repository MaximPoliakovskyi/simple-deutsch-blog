"use client";

import * as React from "react";
import CategoryPillsSkeleton from "@/features/categories/CategoryPillsSkeleton";
import { translateCategory, translateCategoryDescription } from "@/shared/i18n/i18n";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { cn } from "@/shared/lib/cn";
import {
  CEFR_UI_CONFIG,
  getCefrCodeFromSlug,
  getCefrOrderIndex,
  getLevelDescription,
  getLevelLabel,
  isCefrLevelSlug,
} from "@/shared/lib/levels";
import Button from "@/shared/ui/Button";

type Category = { id: string; name: string; slug: string };

const CategoryPills = React.memo(function CategoryPills({
  categories,
  onSelect,
  initialSelected,
  selected,
  alignment = "center",
  className,
  variant = "default",
  required = false,
  loading = false,
  loadingCount = 6,
}: {
  categories: Category[];
  onSelect: (slug: string | null) => void;
  initialSelected?: string | null;
  selected?: string | null;
  alignment?: "left" | "center";
  className?: string;
  variant?: "default" | "level";
  required?: boolean;
  loading?: boolean;
  loadingCount?: number;
}) {
  const { t, locale } = useI18n();

  const sortedCategories = React.useMemo(() => {
    const cefr: Category[] = [];
    const nonCefr: Category[] = [];

    for (const category of categories) {
      if (isCefrLevelSlug(category.slug)) {
        cefr.push(category);
      } else {
        nonCefr.push(category);
      }
    }

    const sortedCefr = [...cefr].sort(
      (left, right) => getCefrOrderIndex(left.slug) - getCefrOrderIndex(right.slug),
    );

    return [...sortedCefr, ...nonCefr];
  }, [categories]);

  const getTagDescription = React.useCallback(
    (slug: string): string | undefined => {
      const fromLevels = getLevelDescription(slug, locale);
      if (fromLevels) return fromLevels;
      return translateCategoryDescription(undefined, slug, locale);
    },
    [locale],
  );

  const defaultSelected = React.useMemo(() => {
    if (initialSelected !== undefined && initialSelected !== null) return initialSelected;

    if (sortedCategories.some((category) => isCefrLevelSlug(category.slug))) {
      const a1 = sortedCategories.find((category) => (category.slug ?? "").toLowerCase() === "a1");
      if (a1) return a1.slug;
    }

    if (required) return sortedCategories.length > 0 ? sortedCategories[0].slug : null;
    return null;
  }, [initialSelected, required, sortedCategories]);

  const [internalSelected, setInternalSelected] = React.useState<string | null>(
    defaultSelected ?? null,
  );
  const previousDefaultSelectedRef = React.useRef<string | null>(defaultSelected ?? null);
  const isControlled = selected !== undefined;
  const currentSelected = isControlled ? selected : internalSelected;

  React.useEffect(() => {
    if (isControlled) return;
    if (previousDefaultSelectedRef.current === (defaultSelected ?? null)) return;
    previousDefaultSelectedRef.current = defaultSelected ?? null;
    setInternalSelected(defaultSelected ?? null);
  }, [defaultSelected, isControlled]);

  if (loading) {
    return <CategoryPillsSkeleton count={loadingCount} alignment={alignment} />;
  }

  const isLevelVariant = variant === "level";

  return (
    <div
      className={cn(
        "sd-chip-group",
        alignment === "center" ? "sd-chip-group--center" : "sd-chip-group--start",
        className,
      )}
    >
      {sortedCategories.length === 0 ? (
        <div className="text-sm text-[var(--sd-text-muted)]">{t("categories.empty")}</div>
      ) : (
        sortedCategories.map((category) => {
          const active = currentSelected === category.slug;
          const description = getTagDescription(category.slug);
          const displayName =
            getLevelLabel(category.slug, locale) ??
            translateCategory(category.name, category.slug, locale);

          return (
            <Button
              key={category.id}
              active={active}
              aria-label={description ? `${displayName}: ${description}` : displayName}
              onClick={() => {
                const next = required
                  ? category.slug
                  : currentSelected === category.slug
                    ? null
                    : category.slug;
                if (!isControlled) {
                  setInternalSelected(next);
                }
                onSelect(next);
              }}
              size="md"
              title={description}
              variant={isLevelVariant ? "ghost" : "filter"}
              className={cn(
                isLevelVariant
                  ? "h-[37.6px] gap-2 rounded-full border-[0.8px] border-[#404040] bg-transparent px-[16.8px] py-[0.8px] text-[14px] leading-5 text-[#d4d4d4] shadow-[var(--shadow-sm)]"
                  : "h-[38.6px] gap-1 rounded-full border-[0.8px] px-[16.8px] py-[0.8px] text-[14px] leading-5 shadow-[var(--shadow-xs)]",
                active &&
                  (isLevelVariant
                    ? "border-[#193cb8] text-[#51a2ff]"
                    : "border-[#193cb8] text-[#155dfc]"),
              )}
            >
              <span className={cn("flex items-center", isLevelVariant ? "gap-2" : "gap-1")}>
                {(() => {
                  const levelCode = getCefrCodeFromSlug(category.slug);
                  const stickerClass = levelCode ? CEFR_UI_CONFIG[levelCode]?.dotClass : null;
                  return stickerClass ? (
                    <span
                      className={cn(
                        isLevelVariant ? "h-[10px] w-[10px]" : "h-2.5 w-2.5",
                        "rounded-full",
                        stickerClass,
                      )}
                    />
                  ) : null;
                })()}
                <span>{displayName}</span>
              </span>
            </Button>
          );
        })
      )}
    </div>
  );
});

export default CategoryPills;
