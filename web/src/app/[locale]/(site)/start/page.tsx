import { notFound } from "next/navigation";
import HomePage from "@/components/pages/HomePageServer";
import { assertLocale, type Locale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedStartPage({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return (
    <main data-testid="start-marker">
      <HomePage locale={validated} />
    </main>
  );
}
