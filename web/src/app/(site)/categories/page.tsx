import type { Metadata } from "next";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/lib/i18n";
import { CategoriesIndexContent } from "../../[locale]/categories/categories-index-content";

export const revalidate = 600;

export const metadata: Metadata = {
  description: "Explore posts by category.",
  title: `${TRANSLATIONS[DEFAULT_LOCALE].categories} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
};

export default async function CategoriesIndexPage() {
  return <CategoriesIndexContent locale={DEFAULT_LOCALE} />;
}
