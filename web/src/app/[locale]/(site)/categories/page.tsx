// src/app/[locale]/(site)/categories/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import CategoriesIndexPage from "../../../categories/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (locale !== "ru" && locale !== "ua") return {};

  return {
    title: `${TRANSLATIONS[locale].categories} — ${TRANSLATIONS[locale].siteTitle}`,
  };
}

export default async function LocalizedCategoriesPage({ params }: Props) {
  const { locale } = await params;

  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }

  return <CategoriesIndexPage locale={locale} />;
}
