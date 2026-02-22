import Link from "next/link";
import { deduplicateCategories } from "@/core/content/categoryUtils";
import { filterHiddenCategories } from "@/core/content/hiddenCategories";
import { translateCategory, translateCategoryDescription } from "@/core/i18n/categoryTranslations";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import type { Locale } from "@/i18n/locale";
import { getAllCategories } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  count?: number | null;
};

function formatPostCount(count: number, localeForCount: Locale) {
  if (localeForCount === "en") {
    return `${count} ${count === 1 ? "post" : "posts"}`;
  }

  if (localeForCount === "ru") {
    const mod10 = count % 10;
    const mod100 = count % 100;
    let word = "\u043f\u043e\u0441\u0442\u043e\u0432";
    if (mod10 === 1 && mod100 !== 11) word = "\u043f\u043e\u0441\u0442";
    else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = "\u043f\u043e\u0441\u0442\u0430";
    return `${count} ${word.charAt(0).toUpperCase() + word.slice(1)}`;
  }

  const mod10 = count % 10;
  const mod100 = count % 100;
  let word = "\u043f\u043e\u0441\u0442\u0456\u0432";
  if (mod10 === 1 && mod100 !== 11) word = "\u043f\u043e\u0441\u0442";
  else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = "\u043f\u043e\u0441\u0442\u0438";
  return `${count} ${word.charAt(0).toUpperCase() + word.slice(1)}`;
}

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
      <h1 className="mb-8 text-3xl font-semibold">{t.categoriesHeading}</h1>
      {visible.length === 0 ? (
        <p className="text-neutral-600">{t.noCategories}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((category) => (
            <li
              key={category.id}
              className="rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
              <Link
                href={
                  locale === "en"
                    ? `/categories/${category.slug}`
                    : `/${locale}/categories/${category.slug}`
                }
                className="group block"
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <h2 className="text-lg font-medium group-hover:underline">
                    {translateCategory(category.name, category.slug, locale)}
                  </h2>
                  <span className="text-xs text-neutral-500">
                    {formatPostCount(countsMap.get(category.slug) ?? 0, locale)}
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
                      <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                        {final}
                      </p>
                    );
                  }
                  return (
                    <p className="text-sm text-neutral-500">
                      Browse posts in {translateCategory(category.name, category.slug, locale)}.
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
