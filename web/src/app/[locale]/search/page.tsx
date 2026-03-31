import { TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";
import { SearchPageContent, type SearchParams } from "./search-page-content";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: SearchParams;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params;
  const validated = getOptionalRouteLocale(locale);

  if (!validated) {
    return {};
  }

  const sp = (await searchParams) ?? {};
  const query = new URLSearchParams();
  if (sp.q) query.set("q", sp.q);
  if (sp.after) query.set("after", sp.after);
  const suffix = query.toString();
  const path = suffix ? `/search?${suffix}` : "/search";

  return {
    title: `${TRANSLATIONS[validated].search} — ${TRANSLATIONS[validated].siteTitle}`,
    alternates: buildI18nAlternates(path, validated),
  };
}

export default async function LocalizedSearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = searchParams ?? Promise.resolve({});

  return <SearchPageContent searchParams={sp} locale={getRequiredRouteLocale(locale)} />;
}
