import SearchPage from "../../search/page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ua"].search} — ${TRANSLATIONS["ua"].siteTitle}`,
};

export default async function UaSearchWrapper({ searchParams }: { searchParams?: Record<string, any> } = {}) {
  return <SearchPage searchParams={searchParams as any} locale="ua" />;
}
