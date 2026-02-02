// src/app/[locale]/(site)/[...slug]/page.tsx
// Catch-all for localized routes that don't have specific handlers

import { notFound } from "next/navigation";
import HomePage from "@/components/pages/HomePageServer";
import { assertLocale, type Locale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
};

export default async function LocalizedCatchAll({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale as any);
  } catch {
    notFound();
  }

  const { slug } = await params;
  if (slug && Array.isArray(slug) && slug.length > 0) {
    notFound();
  }

  return <HomePage locale={validated} />;
}
