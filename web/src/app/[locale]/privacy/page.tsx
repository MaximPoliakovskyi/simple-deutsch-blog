import { TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";
import PrivacyPage from "./privacy-page";

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
    title: `${TRANSLATIONS[validated]["privacy.title"]} — ${TRANSLATIONS[validated].siteTitle}`,
    alternates: buildI18nAlternates("/privacy", validated),
  };
}

export default async function LocalizedPrivacy({ params }: Props) {
  const { locale } = await params;

  return <PrivacyPage locale={getRequiredRouteLocale(locale)} />;
}
