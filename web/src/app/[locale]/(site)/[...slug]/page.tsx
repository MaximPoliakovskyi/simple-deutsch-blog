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

  /*
   * This catch-all previously rendered the homepage for any unknown localized
   * path which caused random URLs (e.g. `/ru/asdf`) to show a blank/home page
   * while returning HTTP 200. Instead, if a slug is present here it means no
   * more-specific route matched; treat that as a real 404 for users and search
   * engines.
   */
  const { slug } = await params;
  if (slug && Array.isArray(slug) && slug.length > 0) {
    // Unknown localized path -> return a 404
    notFound();
  }

  // No slug present: render the homepage for the locale (should be handled
  // by the dedicated localized root, but keep this fallback safe).
  return <HomePage locale={locale} />;
}
