import CategoryPage, { generateMetadata as baseGenerateMetadata } from "../../../categories/[category]/page";
import { getCategoryBySlug } from "@/lib/wp/api";
import { TRANSLATIONS } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const term = await getCategoryBySlug(category);
  if (!term) return { title: TRANSLATIONS["ru"].categoryNotFound };
  return { title: `Category: ${term.name} — ${TRANSLATIONS["ru"].siteTitle}` };
}

export default async function RuCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  return await CategoryPage({ params, locale: "ru" } as any);
}
