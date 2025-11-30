import PostsIndex from "../../posts/PostsIndex";
import type { Locale } from "@/lib/api";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ru"].posts} — ${TRANSLATIONS["ru"].siteTitle}`,
};

export default async function RuPostsPage() {
  const locale: Locale = "ru";
  return <PostsIndex locale={locale} />;
}
