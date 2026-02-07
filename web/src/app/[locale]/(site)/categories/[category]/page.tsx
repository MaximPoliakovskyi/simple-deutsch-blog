// src/app/[locale]/(site)/categories/[category]/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import { getCategoryBySlug } from "@/server/wp/api";
import CategoryPage from "../../../../categories/[category]/page";

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, category } = await params;
  try {
    const validated = assertLocale(locale);
    const term = await getCategoryBySlug(category, validated);
    if (!term) {
      return {
        title: TRANSLATIONS[validated].categoryNotFound,
        alternates: buildI18nAlternates(`/categories/${category}`, validated),
      };
    }

    return {
      title: `Category: ${term.name} — ${TRANSLATIONS[validated].siteTitle}`,
      alternates: buildI18nAlternates(`/categories/${category}`, validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedCategoryPage({ params }: Props) {
  const { locale, category } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return CategoryPage({ params: Promise.resolve({ category }), locale: validated });
}
