import HeroWithFilters from "@/components/features/search/HeroWithFilters";
import { deduplicateCategories, filterOutCEFRLevels } from "@/core/content/categoryUtils";
import { filterHiddenCategories } from "@/core/content/hiddenCategories";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getAllCategories } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";

type CategoryNode = { id: string; name: string; slug: string };

type Props = {
  initialPosts: any[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize: number;
  locale: "en" | "ru" | "uk";
};

export default async function DeferredHeroFilters({
  initialPosts,
  initialEndCursor,
  initialHasNextPage,
  pageSize,
  locale,
}: Props) {
  // Load categories on-demand; will be streamed separately
  const catsResp = await getAllCategories({ first: 50 });
  const allCategories = extractConnectionNodes<CategoryNode>(catsResp?.categories);

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
