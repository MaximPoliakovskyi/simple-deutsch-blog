// src/app/[locale]/posts/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostPage, { generateMetadata as baseGenerateMetadata } from "../../../../posts/[slug]/page";

export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== "ru" && locale !== "ua") {
    return { title: "404" };
  }
  return baseGenerateMetadata({ params: Promise.resolve({ slug }) as any });
}

export default async function LocalizedPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }
  return PostPage({ params: Promise.resolve({ slug }) as any, locale: locale as any });
}
