// src/app/[locale]/(site)/search/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import SearchPage from "../../../search/page";

type SearchParams = Promise<{ q?: string; after?: string }>;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: SearchParams;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  try {
    const validated = assertLocale(locale);
    const query = new URLSearchParams();
    if (sp.q) query.set("q", sp.q);
    if (sp.after) query.set("after", sp.after);
    const suffix = query.toString();
    const path = suffix ? `/search?${suffix}` : "/search";

    return {
      title: `${TRANSLATIONS[validated].search} — ${TRANSLATIONS[validated].siteTitle}`,
      alternates: buildI18nAlternates(path, validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedSearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  const sp = searchParams ?? Promise.resolve({});

  return <SearchPage searchParams={sp} locale={validated} />;
}
