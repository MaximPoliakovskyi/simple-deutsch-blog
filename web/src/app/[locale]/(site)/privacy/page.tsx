// src/app/[locale]/(site)/privacy/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import PrivacyPage from "../../../(site)/privacy/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale);
    return {
      title: `${TRANSLATIONS[validated]["privacy.title"]} — ${TRANSLATIONS[validated].siteTitle}`,
      alternates: buildI18nAlternates("/privacy", validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedPrivacy({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return <PrivacyPage locale={validated} />;
}
