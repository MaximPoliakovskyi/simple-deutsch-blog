"use client";

import * as React from "react";
import CategoryPills from "@/components/CategoryPills";
import PostsGridWithPagination from "@/components/PostsGridWithPagination";
import type { WPPostCard } from "@/lib/wp/api";

type Cat = { id: string; name: string; slug: string };

export default function CategoriesBlockClient({
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
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  return (
    <div>
      <div className="mb-4">
        {/* Render pills; categories should be left aligned and selection required here */}
        <CategoryPills
          categories={categories}
          initialSelected={categories.length > 0 ? categories[0].slug : null}
          onSelect={(slug) => setSelectedCategory(slug)}
          alignment="left"
          required={true}
        />
      </div>

      <div>
        <PostsGridWithPagination
          initialPosts={initialPosts}
          initialPageInfo={{ hasNextPage: initialHasNextPage, endCursor: initialEndCursor }}
          pageSize={pageSize}
          query={{ lang: locale ?? "en", categorySlug: null, tagSlug: selectedCategory, level: null }}
        />
      </div>
    </div>
  );
}
