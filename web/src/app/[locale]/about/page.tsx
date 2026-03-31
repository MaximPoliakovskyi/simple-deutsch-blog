import { TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";
import AboutPage from "./about-page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const validated = getOptionalRouteLocale(locale);

  if (!validated) {
    return {};
  }

  return {
    title: `${TRANSLATIONS[validated].about} — ${TRANSLATIONS[validated].siteTitle}`,
    alternates: buildI18nAlternates("/about", validated),
  };
}

export default async function LocalizedAbout({ params }: Props) {
  const { locale } = await params;

  return <AboutPage locale={getRequiredRouteLocale(locale)} />;
}
