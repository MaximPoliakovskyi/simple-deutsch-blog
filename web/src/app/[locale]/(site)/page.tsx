// src/app/[locale]/(site)/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import HomePage from "../../page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const validLocale = locale === "ru" || locale === "ua" ? locale : null;

  if (!validLocale) return {};

  return {
    title: TRANSLATIONS[validLocale].siteTitle,
  };
}

export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;

  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }

  return <HomePage locale={locale} />;
}
