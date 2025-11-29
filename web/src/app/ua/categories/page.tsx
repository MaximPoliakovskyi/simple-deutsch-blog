import CategoriesIndexPage from "../../categories/page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ua"].categories} — ${TRANSLATIONS["ua"].siteTitle}`,
};

export default async function UaCategoriesPage() {
  return <CategoriesIndexPage locale="ua" />;
}
