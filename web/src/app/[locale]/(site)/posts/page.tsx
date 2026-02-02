// src/app/[locale]/(site)/posts/page.tsx

import { notFound } from "next/navigation";
import PostsIndex from "../../../posts/PostsIndex";
import { assertLocale, type Locale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedPostsPage({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale as any);
  } catch {
    notFound();
  }

  return <PostsIndex locale={validated} />;
}
