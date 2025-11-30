import PostsPage from "../../posts/PostsPage";
import type { Locale } from "@/lib/api";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ua"].posts} — ${TRANSLATIONS["ua"].siteTitle}`,
};

export default function UaPostsPage() {
  const locale: Locale = "ua";
  return <PostsPage locale={locale} />;
}
