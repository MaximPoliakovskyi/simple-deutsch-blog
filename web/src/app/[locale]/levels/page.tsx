import { TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";
import { LevelsIndexContent } from "./levels-index-content";

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
    title: `${TRANSLATIONS[validated].levels} — ${TRANSLATIONS[validated].siteTitle}`,
    alternates: buildI18nAlternates("/levels", validated),
  };
}

export default async function LocalizedLevelsPage({ params }: Props) {
  const { locale } = await params;

  return <LevelsIndexContent locale={getRequiredRouteLocale(locale)} />;
}
