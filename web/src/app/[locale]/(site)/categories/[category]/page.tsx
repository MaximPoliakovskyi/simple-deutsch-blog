// src/app/[locale]/(site)/categories/[category]/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { getCategoryBySlug } from "@/server/wp/api";
import CategoryPage from "../../../../categories/[category]/page";
import { assertLocale, type Locale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, category } = await params;
  try {
    const validated = assertLocale(locale as any);
    const term = await getCategoryBySlug(category);
    if (!term) return { title: TRANSLATIONS[validated].categoryNotFound };
    return { title: `Category: ${term.name} — ${TRANSLATIONS[validated].siteTitle}` };
  } catch {
    return {};
  }
}

export default async function LocalizedCategoryPage({ params }: Props) {
  const { locale, category } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale as any);
  } catch {
    notFound();
  }

  // Pass wrapped params to base CategoryPage
  return await CategoryPage({ params: Promise.resolve({ category }), locale: validated } as any);
}
