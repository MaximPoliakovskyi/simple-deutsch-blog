// app/posts/page.tsx
import type { Metadata } from "next";
import PostsPage from "./PostsPage";
import type { Locale } from "@/lib/api";
import { TRANSLATIONS, DEFAULT_LOCALE } from "@/lib/i18n";

export const revalidate = 600;

export const metadata: Metadata = {
  title: `${TRANSLATIONS[DEFAULT_LOCALE].posts} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
  description: "Browse recent posts.",
};

export default function PostsIndexPage() {
  const locale: Locale = "en";
  return <PostsPage locale={locale} />;
}
