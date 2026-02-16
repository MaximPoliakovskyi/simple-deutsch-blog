import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import PartnershipsClient from "../../../(site)/partnerships/PartnershipsClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale);
    const dict = TRANSLATIONS[validated];
    return {
      title: `${dict["partnerships.meta.title"]} | ${dict.siteTitle}`,
      description: dict["partnerships.meta.description"],
      alternates: buildI18nAlternates("/partnerships", validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedPartnerships({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return <PartnershipsClient contactEmail="partnerships@simple-deutsch.de" locale={validated} />;
}
