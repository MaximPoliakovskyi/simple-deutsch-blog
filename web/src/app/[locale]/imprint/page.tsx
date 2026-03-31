import { SUPPORTED_LOCALES, TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";
import ImprintPage from "./imprint-page";

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
    title: `${TRANSLATIONS[validated]["imprint.title"]} — ${TRANSLATIONS[validated].siteTitle}`,
    alternates: buildI18nAlternates("/imprint", validated),
  };
}

export default async function LocalizedImprint({ params }: Props) {
  const { locale } = await params;

  return <ImprintPage locale={getRequiredRouteLocale(locale)} />;
}
