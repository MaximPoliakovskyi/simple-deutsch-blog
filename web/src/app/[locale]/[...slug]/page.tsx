import type { Metadata } from "next";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";
import { generateMappedMetadata, renderMappedPage } from "../_lib/page-map";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
  searchParams?: Promise<{ q?: string; after?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const validated = getOptionalRouteLocale(locale);

  if (!validated) return {};

  return generateMappedMetadata({ locale: validated, slug, searchParams });
}

export default async function CatchAllRoute({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const validated = getRequiredRouteLocale(locale);

  return renderMappedPage({ locale: validated, slug, searchParams });
}
