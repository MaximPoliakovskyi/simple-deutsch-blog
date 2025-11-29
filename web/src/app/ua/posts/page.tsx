// src/app/ua/posts/page.tsx
import PostsIndexPage from "../../posts/page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ua"].posts} — ${TRANSLATIONS["ua"].siteTitle}`,
};

export default async function UaPostsPage() {
  return <PostsIndexPage locale="ua" />;
}
