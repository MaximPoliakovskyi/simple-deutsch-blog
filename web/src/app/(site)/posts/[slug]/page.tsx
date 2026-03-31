import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { generatePostMetadata, renderPostPage } from "../../../[locale]/posts/[slug]/post-page";

export const revalidate = 120;

type ParamsPromise = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: ParamsPromise }): Promise<Metadata> {
  return generatePostMetadata({ locale: DEFAULT_LOCALE, params });
}

export default async function PostPage({ params }: { params: ParamsPromise }) {
  return renderPostPage({ locale: DEFAULT_LOCALE, params });
}
