import { TRANSLATIONS } from "@/core/i18n/i18n";
import NotFound from "../../not-found";

const SUPPORTED_LOCALES = ["ru", "uk"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const p = params ?? {};
  const resolved = typeof (p as any)?.then === "function" ? await p : p;
  const locale = (resolved as any)?.locale;
  if (!isSupportedLocale(locale)) return {};

  return {
    title: TRANSLATIONS[locale].pageNotFoundTitle,
  };
}

export default async function LocalizedNotFound({ params }: Props) {
  const p = params ?? {};
  const resolved = typeof (p as any)?.then === "function" ? await p : p;
  const locale = (resolved as any)?.locale;

  if (!isSupportedLocale(locale)) return <NotFound />;

  return <NotFound locale={locale} />;
}
