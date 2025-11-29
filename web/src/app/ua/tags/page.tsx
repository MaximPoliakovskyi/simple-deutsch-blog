import TagsIndexPage from "../../tags/page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ua"].tags} — ${TRANSLATIONS["ua"].siteTitle}`,
};

export default async function UaTagsPage() {
  return <TagsIndexPage locale="ua" />;
}
