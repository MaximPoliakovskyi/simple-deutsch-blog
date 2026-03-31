import { notFound } from "next/navigation";
import { assertLocale, type Locale, TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import PartnershipsClient from "./partnerships-page";

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
