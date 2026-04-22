import Link from "next/link";
import {
  buildLocalizedHref,
  formatLocalizedPostCount,
  type Locale,
  TRANSLATIONS,
  translateCategory,
  translateCategoryDescription,
} from "@/lib/i18n";
import {
  deduplicateCategories,
  extractConnectionNodes,
  filterHiddenCategories,
  getAllCategories,
} from "@/lib/posts";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  count?: number | null;
};

export async function CategoriesIndexContent({ locale }: { locale: Locale }) {
  const { categories } = await getAllCategories({ first: 100, locale });
  const nodes = extractConnectionNodes<CategoryNode>(categories);

  const visible = filterHiddenCategories(deduplicateCategories(nodes));
  const t = TRANSLATIONS[locale];
  const countsMap = new Map(
    visible.map((category) => [category.slug, Math.max(0, Number(category.count ?? 0))] as const),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="type-display mb-8">{t.categoriesHeading}</h1>
      {visible.length === 0 ? (
        <p className="text-neutral-600">{t.noCategories}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((category, idx) => (
            <li
              key={category.id}
              className="sd-fade-in-item rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <Link
                href={buildLocalizedHref(locale, `/categories/${category.slug}`)}
                className="group block"
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <h2 className="type-heading-4 group-hover:underline">
                    {translateCategory(category.name, category.slug, locale)}
                  </h2>
                  <span className="type-caption text-neutral-500">
                    {formatLocalizedPostCount(countsMap.get(category.slug) ?? 0, locale)}
                  </span>
                </div>
                {(() => {
                  const translated = translateCategoryDescription(
                    category.description,
                    category.slug,
                    locale,
                  );
                  const final = translated ?? category.description ?? null;
                  if (final) {
                    return (
                      <p className="line-clamp-3 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                        {final}
                      </p>
                    );
                  }
                  return (
                    <p className="text-sm leading-7 text-neutral-500">
                      Browse articles in {translateCategory(category.name, category.slug, locale)}.
                    </p>
                  );
                })()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
