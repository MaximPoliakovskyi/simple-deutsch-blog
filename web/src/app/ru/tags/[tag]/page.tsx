import TagPage from "../../../tags/[tag]/page";
import { getTagBySlug } from "@/lib/wp/api";
import { TRANSLATIONS } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const term = (await getTagBySlug(tag)) as any;
  if (!term) return { title: TRANSLATIONS["ru"].tagNotFound };
  return { title: `Tag: ${term.name} — ${TRANSLATIONS["ru"].siteTitle}` };
}

export default async function RuTagPage({ params }: { params: Promise<{ tag: string }> }) {
  return await TagPage({ params, locale: "ru" } as any);
}
