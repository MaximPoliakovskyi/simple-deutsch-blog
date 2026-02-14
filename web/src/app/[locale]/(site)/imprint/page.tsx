// src/app/[locale]/(site)/imprint/page.tsx
import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale, SUPPORTED_LOCALES } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import ImprintPage from "../../../(site)/imprint/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale);
    return {
      title: `${TRANSLATIONS[validated]["imprint.title"]} — ${TRANSLATIONS[validated].siteTitle}`,
      alternates: buildI18nAlternates("/imprint", validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedImprint({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return <ImprintPage locale={validated} />;
}
