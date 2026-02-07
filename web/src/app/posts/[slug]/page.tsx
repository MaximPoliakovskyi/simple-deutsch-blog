import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import { generatePostMetadata, renderPostPage } from "./postPage.server";

export const revalidate = 120;

type ParamsPromise = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: ParamsPromise }): Promise<Metadata> {
  return generatePostMetadata({ params, locale: DEFAULT_LOCALE });
}

export default async function PostPage({ params }: { params: ParamsPromise }) {
  return renderPostPage({ params, locale: DEFAULT_LOCALE });
}
