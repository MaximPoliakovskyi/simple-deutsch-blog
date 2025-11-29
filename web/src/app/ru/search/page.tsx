import SearchPage from "../../search/page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ru"].search} — ${TRANSLATIONS["ru"].siteTitle}`,
};

export default async function RuSearchWrapper({ searchParams }: { searchParams?: Record<string, any> } = {}) {
  return <SearchPage searchParams={searchParams as any} locale="ru" />;
}
