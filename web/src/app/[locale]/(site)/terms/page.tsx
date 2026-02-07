// src/app/[locale]/(site)/terms/page.tsx

import { notFound } from "next/navigation";
import { assertLocale, type Locale, SUPPORTED_LOCALES } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import TermsPage from "../../../terms/page";

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
      title: undefined,
      alternates: buildI18nAlternates("/terms", validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedTerms({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return <TermsPage locale={validated} />;
}
