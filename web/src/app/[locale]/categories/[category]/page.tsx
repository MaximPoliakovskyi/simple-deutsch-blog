import { notFound } from "next/navigation";
import { assertLocale, type Locale, TRANSLATIONS } from "@/lib/i18n";
import { getCategoryBySlug } from "@/lib/posts";
import { buildI18nAlternates } from "@/lib/seo";
import { CategoryPageContent } from "./category-page-content";

type Props = {
  params: Promise<{ category: string; locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { category, locale } = await params;

  try {
    const validated = assertLocale(locale);
    const term = await getCategoryBySlug(category, validated);

    if (!term) {
      return {
        alternates: buildI18nAlternates(`/categories/${category}`, validated),
        title: TRANSLATIONS[validated].categoryNotFound,
      };
    }

    return {
      alternates: buildI18nAlternates(`/categories/${category}`, validated),
      title: `Category: ${term.name} — ${TRANSLATIONS[validated].siteTitle}`,
    };
  } catch {
    return {};
  }
}

export default async function LocalizedCategoryPage({ params }: Props) {
  const { category, locale } = await params;
  let validated: Locale;

  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return <CategoryPageContent category={category} locale={validated} />;
}
