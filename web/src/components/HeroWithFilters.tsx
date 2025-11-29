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
  pageSize = 9,
}: {
  categories: Cat[];
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
}) {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  return (
    <>
    <section className="text-center max-w-4xl mx-auto py-12">
      <h1 className="font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tight text-[hsl(var(--fg))] dark:text-[hsl(var(--fg))]">
        {t("heroTitle")} <br />
        <span className="text-blue-600">German</span>
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
        initialEndCursor={initialEndCursor}
        initialHasNextPage={initialHasNextPage}
        pageSize={pageSize}
        // This component now supports filtering by tag via `tagSlug`.
        // The homepage now passes tag nodes into the hero pills so the
        // `selectedCategory` here is actually a tag slug. Use the tag prop
        // so the grid will fetch posts by tag.
        tagSlug={selectedCategory}
      />
    </>
  );
}
