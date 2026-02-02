// src/app/[locale]/(site)/categories/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import CategoriesIndexPage from "../../../categories/page";
import { assertLocale, type Locale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale as any);
    return { title: `${TRANSLATIONS[validated].categories} — ${TRANSLATIONS[validated].siteTitle}` };
  } catch {
    return {};
  }
}

export default async function LocalizedCategoriesPage({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale as any);
  } catch {
    notFound();
  }

  return <CategoriesIndexPage locale={validated} />;
}
