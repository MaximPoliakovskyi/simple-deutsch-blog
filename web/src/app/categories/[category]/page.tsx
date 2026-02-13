// app/categories/[category]/page.tsx
import type { Metadata } from "next";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import { getCategoryBySlug } from "@/server/wp/api";
import { CategoryPageContent } from "./CategoryPageContent";

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

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  return <CategoryPageContent category={category} locale={DEFAULT_LOCALE} />;
}
