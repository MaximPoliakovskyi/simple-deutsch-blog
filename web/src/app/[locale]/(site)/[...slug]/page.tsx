// src/app/[locale]/(site)/[...slug]/page.tsx
// Catch-all for localized routes that don't have specific handlers

import { notFound } from "next/navigation";
import HomePage from "../../../page";

const SUPPORTED_LOCALES = ["ru", "ua"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
};

export default async function LocalizedCatchAll({ params }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  // Fallback: render homepage with locale
  return <HomePage locale={locale} />;
}
