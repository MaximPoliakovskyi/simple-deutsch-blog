import type { Locale } from "@/lib/i18n";
import {
  deduplicateCategories,
  extractConnectionNodes,
  filterHiddenCategories,
  filterOutCEFRLevels,
  getAllCategories,
  type WPPostCard,
} from "@/lib/posts";
import HeroWithFilters from "./hero-client";

type CategoryNode = { id: string; name: string; slug: string };

type Props = {
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize: number;
  locale: Locale;
};

export default async function DeferredHeroFilters({
  initialPosts,
  initialEndCursor,
  initialHasNextPage,
  pageSize,
  locale,
}: Props) {
  // Load categories on-demand; will be streamed separately
  let allCategories: CategoryNode[] = [];
  try {
    const catsResp = await getAllCategories({ first: 50, locale });
    allCategories = extractConnectionNodes<CategoryNode>(catsResp?.categories);
  } catch (error) {
    console.error("Failed to load hero categories:", error);
  }

  const categoryNodes = filterOutCEFRLevels(
    deduplicateCategories(filterHiddenCategories(allCategories)),
  ).slice(0, 7);

  return (
    <HeroWithFilters
      categories={categoryNodes}
      initialPosts={initialPosts}
      initialEndCursor={initialEndCursor}
      initialHasNextPage={initialHasNextPage}
      pageSize={pageSize}
      locale={locale}
    />
  );
}
