// src/app/[locale]/(site)/posts/page.tsx

import { notFound } from "next/navigation";
import type { Locale } from "@/server/wp/fetchPosts";
import PostsIndex from "../../../posts/PostsIndex";

const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedPostsPage({ params }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <PostsIndex locale={locale as Locale} />;
}
