// src/app/[locale]/posts/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { assertLocale, type Locale } from "@/i18n/locale";
import PostPage, { generateMetadata as baseGenerateMetadata } from "../../../../posts/[slug]/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// using central assertLocale; removed local SUPPORTED_LOCALES

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    assertLocale(locale);
  } catch {
    return { title: "404" };
  }
  return baseGenerateMetadata({ params: Promise.resolve({ slug }) });
}

export default async function LocalizedPostPage({ params }: Props) {
  const { locale, slug } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }
  return PostPage({ params: Promise.resolve({ slug }), locale: validated });
}
