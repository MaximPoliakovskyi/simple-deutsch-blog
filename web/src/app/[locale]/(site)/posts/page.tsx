// src/app/[locale]/(site)/posts/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import PostsIndex from "../../../posts/PostsIndex";

type Props = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale);
    return {
      title: `${TRANSLATIONS[validated].posts} — ${TRANSLATIONS[validated].siteTitle}`,
      alternates: buildI18nAlternates("/posts", validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedPostsPage({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return <PostsIndex locale={validated} />;
}
