import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import {
  generateMetadata as generateSearchMetadata,
  SearchPageContent,
  type SearchParams,
} from "../../[locale]/search/search-page-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  return generateSearchMetadata({ searchParams });
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  return <SearchPageContent locale={DEFAULT_LOCALE} searchParams={searchParams} />;
}
