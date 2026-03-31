import { notFound } from "next/navigation";
import { assertLocale } from "@/lib/i18n";

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
