// app/categories/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { translateCategory } from "@/core/i18n/categoryTranslations";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import { getCategoryBySlug, getPostsByCategory } from "@/server/wp/api";

export const revalidate = 600;

type Params = { category: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const term = await getCategoryBySlug(category);
  if (!term) return { title: TRANSLATIONS[DEFAULT_LOCALE].categoryNotFound };
  return {
    title: `Category: ${term.name} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
    description: term.description ?? `Posts in “${term.name}”`,
  };
}

export default async function CategoryPage({
  params,
  locale,
}: {
  params: Promise<Params>;
  locale?: Locale;
}) {
  const { category } = await params;

  const term = await getCategoryBySlug(category);
  if (!term) return notFound();
  // Derive current language for this page. Locale from App Router will be
  // provided for localized routes (/ru, /ua). Default to English.
  const lang: Locale = locale ?? DEFAULT_LOCALE;

  // Build locale-specific category slug (categories use language suffixes like tags)
  // English: "success-stories", Russian: "success-stories-ru", Ukrainian: "success-stories-uk"
  const localeCategorySlug = lang === "en" ? category : `${category}-${lang}`;

  // Fetch first paginated page upstream using locale-specific category slug
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
