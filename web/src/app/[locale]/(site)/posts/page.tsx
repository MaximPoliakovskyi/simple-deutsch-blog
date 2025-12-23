// src/app/[locale]/(site)/posts/page.tsx

import { notFound } from "next/navigation";
import type { Locale } from "@/server/wp/fetchPosts";
import PostsIndex from "../../../posts/PostsIndex";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedPostsPage({ params }: Props) {
  const { locale } = await params;

  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }

  return <PostsIndex locale={locale as Locale} />;
}
