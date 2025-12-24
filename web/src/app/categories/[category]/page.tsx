// app/categories/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { translateCategory } from "@/core/i18n/categoryTranslations";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getCategoryBySlug, getPostsByCategory } from "@/server/wp/api";

export const revalidate = 600;

type Params = { category: string };
type LanguageSlug = "en" | "ru" | "ua";
type PageInfo = { hasNextPage: boolean; endCursor: string | null };

const PAGE_SIZE = 3;

// Language detection used across posts/category pages
const LANGUAGE_SLUGS: readonly LanguageSlug[] = ["en", "ru", "ua"] as const;

function getPostLanguage(post: {
  slug?: string;
  categories?: { nodes?: { slug?: string | null }[] } | null;
}): LanguageSlug | null {
  const catLang = post.categories?.nodes
    ?.map((c) => c?.slug)
    .find((s) => s && (LANGUAGE_SLUGS as readonly string[]).includes(s));
  if (catLang) return catLang as LanguageSlug;

  const prefix = post.slug?.split("-")[0];
  if (prefix && (LANGUAGE_SLUGS as readonly string[]).includes(prefix))
    return prefix as LanguageSlug;
  return null;
}

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
  locale?: "en" | "ru" | "ua";
}) {
  const { category } = await params;

  const term = await getCategoryBySlug(category);
  if (!term) return notFound();

  // Derive current language for this page. Locale from App Router will be
  // provided for localized routes (/ru, /ua). Default to English.
  const lang: LanguageSlug = (locale ?? "en") as LanguageSlug;

  // Fetch first paginated page upstream using slug-based taxQuery (lang + category)
  const PAGE_SIZE = 3;
  const pageRes = await getPostsByCategory({ first: PAGE_SIZE, after: null, langSlug: lang, categorySlug: category });
  const initialPosts = pageRes.posts;
  const initialPageInfo = pageRes.pageInfo;

  const t = TRANSLATIONS[lang ?? DEFAULT_LOCALE];
  const translatedName = translateCategory(term.name, term.slug, lang ?? "en");
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
        query={{ lang, categorySlug: category, tagSlug: null, level: null }}
      />
    </main>
  );
}
