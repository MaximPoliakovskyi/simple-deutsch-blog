import CategoriesIndexPage from "../../categories/page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ru"].categories} — ${TRANSLATIONS["ru"].siteTitle}`,
};

export default async function RuCategoriesPage() {
  return <CategoriesIndexPage locale="ru" />;
}
