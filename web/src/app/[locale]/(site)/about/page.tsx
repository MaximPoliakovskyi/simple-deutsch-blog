// src/app/[locale]/(site)/about/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import { AboutPageContent } from "../../../(site)/about/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale);
    return {
      title: `${TRANSLATIONS[validated].about} — ${TRANSLATIONS[validated].siteTitle}`,
      alternates: buildI18nAlternates("/about", validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedAbout({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return <AboutPageContent locale={validated} />;
}
