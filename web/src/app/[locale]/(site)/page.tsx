// src/app/[locale]/(site)/page.tsx

import { notFound } from "next/navigation";
import HomePage from "@/components/pages/HomePageServer";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale);
    return {
      title: TRANSLATIONS[validated].siteTitle,
      alternates: buildI18nAlternates("/", validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return (
    <main data-testid="home-marker">
      <HomePage locale={validated} />
    </main>
  );
}
