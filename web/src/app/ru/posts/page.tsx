import PostsPage from "../../posts/PostsPage";
import type { Locale } from "@/lib/api";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ru"].posts} — ${TRANSLATIONS["ru"].siteTitle}`,
};

export default function RuPostsPage() {
  const locale: Locale = "ru";
  return <PostsPage locale={locale} />;
}
