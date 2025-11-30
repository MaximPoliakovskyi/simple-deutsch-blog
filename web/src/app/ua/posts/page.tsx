import PostsIndex from "../../posts/PostsIndex";
import type { Locale } from "@/lib/api";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ua"].posts} — ${TRANSLATIONS["ua"].siteTitle}`,
};

export default async function UaPostsPage() {
  const locale: Locale = "ua";
  return <PostsIndex locale={locale} />;
}
