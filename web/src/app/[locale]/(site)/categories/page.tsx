// src/app/[locale]/(site)/categories/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import { CategoriesIndexContent } from "../../../categories/CategoriesIndexContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale);
    return {
      title: `${TRANSLATIONS[validated].categories} — ${TRANSLATIONS[validated].siteTitle}`,
      alternates: buildI18nAlternates("/categories", validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedCategoriesPage({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return <CategoriesIndexContent locale={validated} />;
}
