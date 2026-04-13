import { SUPPORTED_LOCALES, TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import { toAbsoluteSiteUrl } from "@/lib/site-url";
import HomePage from "../home-page";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  ru: "ru_RU",
  uk: "uk_UA",
};

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

  const t = TRANSLATIONS[validated];
  const title = t.siteTitle;
  const description = t.heroDescription;
  const url = toAbsoluteSiteUrl(`/${validated}`);

  return {
    title,
    description,
    alternates: buildI18nAlternates("/", validated),
    openGraph: {
      title,
      description,
      url,
      siteName: "Simple Deutsch",
      type: "website" as const,
      locale: OG_LOCALE_MAP[validated] ?? "en_US",
      alternateLocale: SUPPORTED_LOCALES.filter((l) => l !== validated).map(
        (l) => OG_LOCALE_MAP[l] ?? "en_US",
      ),
    },
    twitter: {
      card: "summary" as const,
      title,
      description,
    },
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
