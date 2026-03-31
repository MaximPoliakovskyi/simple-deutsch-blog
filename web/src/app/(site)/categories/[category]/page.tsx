import type { Metadata } from "next";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/lib/i18n";
import { getCategoryBySlug } from "@/lib/posts";
import { CategoryPageContent } from "../../../[locale]/categories/[category]/category-page-content";

export const revalidate = 600;

type Params = { category: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const term = await getCategoryBySlug(category);

  if (!term) {
    return { title: TRANSLATIONS[DEFAULT_LOCALE].categoryNotFound };
  }

  return {
    description: term.description ?? `Posts in “${term.name}”`,
    title: `Category: ${term.name} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  return <CategoryPageContent category={category} locale={DEFAULT_LOCALE} />;
}
