import { notFound } from "next/navigation";
import { assertLocale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import PartnershipsPage, { metadata as partnershipsMetadata } from "../../../(site)/partnerships/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale);
    return {
      ...partnershipsMetadata,
      alternates: buildI18nAlternates("/partnerships", validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedPartnerships({ params }: Props) {
  const { locale } = await params;
  try {
    assertLocale(locale);
  } catch {
    notFound();
  }

  return <PartnershipsPage />;
}
