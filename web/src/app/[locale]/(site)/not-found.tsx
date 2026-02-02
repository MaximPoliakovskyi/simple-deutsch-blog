import { TRANSLATIONS } from "@/core/i18n/i18n";
import NotFound from "../../not-found";
import { assertLocale, type Locale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const p = params ?? {};
  const resolved = typeof (p as any)?.then === "function" ? await p : p;
  const locale = (resolved as any)?.locale;
  try {
    const validated = assertLocale(locale as any);
    return { title: TRANSLATIONS[validated].pageNotFoundTitle };
  } catch {
    return {};
  }
}

export default async function LocalizedNotFound({ params }: Props) {
  const p = params ?? {};
  const resolved = typeof (p as any)?.then === "function" ? await p : p;
  const locale = (resolved as any)?.locale;

  try {
    const validated = assertLocale(locale as any);
    return <NotFound locale={validated} />;
  } catch {
    return <NotFound />;
  }
}
