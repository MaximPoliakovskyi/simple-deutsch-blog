import { notFound } from "next/navigation";
import { type Locale, TRANSLATIONS, translateCategory } from "@/lib/i18n";
import { getCategoryBySlug, getLocaleAwareTaxonomySlug, getPostsByCategory } from "@/lib/posts";
import PostsGridWithPagination from "../../_components/posts-grid-with-pagination";

export async function CategoryPageContent({
  category,
  locale,
}: {
  category: string;
  locale: Locale;
}) {
  const term = await getCategoryBySlug(category, locale);
  if (!term) return notFound();
  const lang: Locale = locale;

  const localeCategorySlug = getLocaleAwareTaxonomySlug(category, lang);
  const PAGE_SIZE = 3;
  const pageRes = await getPostsByCategory({
    first: PAGE_SIZE,
    after: null,
    locale: lang,
    categorySlug: localeCategorySlug,
  });
  const initialPosts = pageRes.posts;
  const initialPageInfo = pageRes.pageInfo;

  const t = TRANSLATIONS[lang];
  const translatedName = translateCategory(term.name, term.slug, lang);
  const label = t.categoryLabel ?? "Category:";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{`${label} ${translatedName}`}</h1>
      {category === "success-stories" && (
        <p className="mb-8 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
          {t.successStoriesDescription}
        </p>
      )}

      <PostsGridWithPagination
        key={`${lang}-${category}`}
        initialPosts={initialPosts}
        initialPageInfo={initialPageInfo}
        pageSize={PAGE_SIZE}
        query={{ lang, categorySlug: localeCategorySlug, tagSlug: null, level: null }}
      />
    </main>
  );
}
