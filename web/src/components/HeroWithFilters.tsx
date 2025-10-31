"use client";

import * as React from "react";
import CategoryPills from "@/components/CategoryPills";
import PostsGridWithPagination from "@/components/PostsGridWithPagination";
import type { WPPostCard } from "@/lib/wp/api";

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
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  return (
    <>
      <section className="text-center max-w-4xl mx-auto py-12">
        <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight text-[hsl(var(--fg))] dark:text-[hsl(var(--fg))]">
          Discover <span className="text-blue-600">Blogs</span> websites
          <br /> built by the Webflow community
        </h1>

        <p className="mt-6 text-[hsl(var(--fg-muted))] text-base sm:text-lg">
          Browse, clone, and customize thousands of websites #MadeinWebflow. <a className="text-blue-600 underline" href="#">Looking for templates?</a>
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
        categorySlug={selectedCategory}
      />
    </>
  );
}
