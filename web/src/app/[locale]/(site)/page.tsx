// src/app/[locale]/(site)/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import HomePage from "../../page";

const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
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
    title: TRANSLATIONS[locale].siteTitle,
  };
}

export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <HomePage locale={locale} />;
}
