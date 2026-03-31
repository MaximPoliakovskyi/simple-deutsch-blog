import type { Metadata } from "next";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../../locale-route";
import { generatePostMetadata, renderPostPage } from "./post-page";

export const revalidate = 120;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const validated = getOptionalRouteLocale(locale);

  if (!validated) {
    return { title: "404" };
  }

  return generatePostMetadata({ params: Promise.resolve({ slug }), locale: validated });
}

export default async function LocalizedPostPage({ params }: Props) {
  const { locale, slug } = await params;

  return renderPostPage({
    params: Promise.resolve({ slug }),
    locale: getRequiredRouteLocale(locale),
  });
}
