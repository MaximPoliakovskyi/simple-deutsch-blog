import { notFound } from "next/navigation";
import { assertLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
};

export default async function LocalizedUnknownRoute({ params }: Props) {
  const { locale } = await params;

  try {
    assertLocale(locale);
  } catch {
    notFound();
  }

  notFound();
}
