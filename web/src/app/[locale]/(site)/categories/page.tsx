// src/app/[locale]/(site)/categories/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import CategoriesIndexPage from "../../../categories/page";

const SUPPORTED_LOCALES = ["ru", "ua"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  return {
    title: `${TRANSLATIONS[locale].categories} — ${TRANSLATIONS[locale].siteTitle}`,
  };
}

export default async function LocalizedCategoriesPage({ params }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <CategoriesIndexPage locale={locale} />;
}
