import { TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";
import { CategoriesIndexContent } from "./categories-index-content";

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
    title: `${TRANSLATIONS[validated].categories} — ${TRANSLATIONS[validated].siteTitle}`,
    alternates: buildI18nAlternates("/categories", validated),
  };
}

export default async function LocalizedCategoriesPage({ params }: Props) {
  const { locale } = await params;

  return <CategoriesIndexContent locale={getRequiredRouteLocale(locale)} />;
}
