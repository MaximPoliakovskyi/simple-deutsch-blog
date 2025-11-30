"use client";

import * as React from "react";
import CategoryPills from "@/components/CategoryPills";
import PostsGridWithPagination from "@/components/PostsGridWithPagination";
import type { WPPostCard } from "@/lib/wp/api";
import { useI18n } from "@/components/LocaleProvider";

type Cat = { id: string; name: string; slug: string };

export default function HeroWithFilters({
  categories,
  initialPosts,
  initialEndCursor,
  initialHasNextPage,
  pageSize = 6,
  locale,
}: {
  categories: Cat[];
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
  locale?: "en" | "ru" | "ua";
}) {
  const { t, locale: uiLocale } = useI18n();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  return (
    <>
    <section className="text-center max-w-4xl mx-auto py-12">
      <h1 className="font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tight text-[hsl(var(--fg))] dark:text-[hsl(var(--fg))]">
        {
          (() => {
            const raw = t("heroTitle");
            // Words to highlight per locale
            const highlightMap: Record<"en" | "ua" | "ru", string> = {
              en: "practical",
              ua: "практичні",
              ru: "практичные",
            };
            const highlight = highlightMap[uiLocale] ?? "practical";
            const idx = raw.indexOf(highlight);
            if (idx === -1) return raw;
            return (
              <>
                {raw.slice(0, idx)}
                <span className="text-blue-600">{highlight}</span>
                {raw.slice(idx + highlight.length)}
              </>
            );
          })()
        }
      </h1>

      <p className="mt-6 text-[hsl(var(--fg-muted))] text-base sm:text-xl">
        {t("heroDescription")} <a className="text-blue-600 underline" href="#">{t("promoCta")}</a>
      </p>

        <CategoryPills
          categories={categories}
          initialSelected={null}
          onSelect={(slug) => setSelectedCategory(slug)}
        />
      </section>

      <PostsGridWithPagination
        initialPosts={initialPosts}
        initialPageInfo={{ hasNextPage: initialHasNextPage, endCursor: initialEndCursor }}
        pageSize={pageSize}
        query={{ lang: locale ?? "en", categorySlug: selectedCategory, tagSlug: null, level: null }}
      />
    </>
  );
}
