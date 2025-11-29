import TagsIndexPage from "../../tags/page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ru"].tags} — ${TRANSLATIONS["ru"].siteTitle}`,
};

export default async function RuTagsPage() {
  return <TagsIndexPage locale="ru" />;
}
