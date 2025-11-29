// src/app/ru/posts/page.tsx
import PostsIndexPage from "../../posts/page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ru"].posts} — ${TRANSLATIONS["ru"].siteTitle}`,
};

export default async function RuPostsPage() {
  return <PostsIndexPage locale="ru" />;
}
