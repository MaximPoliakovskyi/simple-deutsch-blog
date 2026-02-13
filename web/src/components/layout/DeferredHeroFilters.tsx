import HeroWithFilters from "@/components/features/search/HeroWithFilters";
import { deduplicateCategories, filterOutCEFRLevels } from "@/core/content/categoryUtils";
import { filterHiddenCategories } from "@/core/content/hiddenCategories";
import type { Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";
import { getAllCategories } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";

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
