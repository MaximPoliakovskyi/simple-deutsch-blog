import { SUPPORTED_LOCALES, TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";
import TermsPage from "./terms-page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const validated = getOptionalRouteLocale(locale);

  if (!validated) {
    return {};
  }

  return {
    title: `${TRANSLATIONS[validated]["terms.title"]} — ${TRANSLATIONS[validated].siteTitle}`,
    alternates: buildI18nAlternates("/terms", validated),
  };
}

export default async function LocalizedTerms({ params }: Props) {
  const { locale } = await params;

  return <TermsPage locale={getRequiredRouteLocale(locale)} />;
}
