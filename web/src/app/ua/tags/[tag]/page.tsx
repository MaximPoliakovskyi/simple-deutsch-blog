import TagPage from "../../tags/[tag]/page";
import { getTagBySlug } from "@/lib/wp/api";
import { TRANSLATIONS } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const term = (await getTagBySlug(tag)) as any;
  if (!term) return { title: TRANSLATIONS["ua"].tagNotFound };
  return { title: `Tag: ${term.name} — ${TRANSLATIONS["ua"].siteTitle}` };
}

export default async function UaTagPage({ params }: { params: Promise<{ tag: string }> }) {
  return await TagPage({ params, locale: "ua" } as any);
}
