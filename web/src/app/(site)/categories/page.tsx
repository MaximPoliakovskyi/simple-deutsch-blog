// app/categories/page.tsx
import type { Metadata } from "next";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import { CategoriesIndexContent } from "./CategoriesIndexContent";

export const revalidate = 600;

export const metadata: Metadata = {
  title: `${TRANSLATIONS[DEFAULT_LOCALE].categories} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
  description: "Explore posts by category.",
};

export default async function CategoriesIndexPage() {
  return <CategoriesIndexContent locale={DEFAULT_LOCALE} />;
}
