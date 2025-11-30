import CategoryPage from "../../../categories/[category]/page";
import { getCategoryBySlug } from "@/lib/wp/api";
import { TRANSLATIONS } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const term = await getCategoryBySlug(category);
  if (!term) return { title: TRANSLATIONS["ua"].categoryNotFound };
  return { title: `Category: ${term.name} — ${TRANSLATIONS["ua"].siteTitle}` };
}

export default async function UaCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  return await CategoryPage({ params, locale: "ua" } as any);
}
