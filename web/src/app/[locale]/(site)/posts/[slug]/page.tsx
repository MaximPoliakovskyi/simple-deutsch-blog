// src/app/[locale]/posts/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostPage, { generateMetadata as baseGenerateMetadata } from "../../../../posts/[slug]/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SUPPORTED_LOCALES = ["ru", "uk"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) {
    return { title: "404" };
  }
  return baseGenerateMetadata({ params: Promise.resolve({ slug }) as any });
}

export default async function LocalizedPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }
  return PostPage({ params: Promise.resolve({ slug }) as any, locale: locale as any });
}
