import { TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";
import PostsIndex from "./posts-index";

type Props = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const validated = getOptionalRouteLocale(locale);

  if (!validated) {
    return {};
  }

  return {
    title: `${TRANSLATIONS[validated].posts} — ${TRANSLATIONS[validated].siteTitle}`,
    alternates: buildI18nAlternates("/posts", validated),
  };
}

export default async function LocalizedPostsPage({ params }: Props) {
  const { locale } = await params;

  return <PostsIndex locale={getRequiredRouteLocale(locale)} />;
}
