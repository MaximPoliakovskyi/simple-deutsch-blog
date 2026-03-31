import { TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import HomePage from "./home-page";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "./locale-route";

type Props = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const validated = getOptionalRouteLocale(locale);

  if (!validated) {
    return {};
  }

  return {
    title: TRANSLATIONS[validated].siteTitle,
    description: TRANSLATIONS[validated].heroDescription,
    alternates: buildI18nAlternates("/", validated),
  };
}

export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;

  return (
    <div data-testid="home-marker">
      <HomePage locale={getRequiredRouteLocale(locale)} />
    </div>
  );
}
