// src/app/[locale]/(site)/categories/[category]/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { getCategoryBySlug } from "@/server/wp/api";
import CategoryPage from "../../../../categories/[category]/page";

const SUPPORTED_LOCALES = ["ru", "ua"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, category } = await params;
  if (!isSupportedLocale(locale)) return {};

  const term = await getCategoryBySlug(category);
  if (!term) return { title: TRANSLATIONS[locale].categoryNotFound };

  return {
    title: `Category: ${term.name} — ${TRANSLATIONS[locale].siteTitle}`,
  };
}

export default async function LocalizedCategoryPage({ params }: Props) {
  const { locale, category } = await params;

  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }

  // Pass wrapped params to base CategoryPage
  return await CategoryPage({
    params: Promise.resolve({ category }),
    locale,
  } as any);
}
