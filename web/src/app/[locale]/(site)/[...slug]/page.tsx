// src/app/[locale]/(site)/[...slug]/page.tsx
// Catch-all for localized routes that don't have specific handlers

import { notFound } from "next/navigation";
import HomePage from "../../../page";

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
};

export default async function LocalizedCatchAll({ params }: Props) {
  const { locale } = await params;

  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }

  // Fallback: render homepage with locale
  return <HomePage locale={locale} />;
}
