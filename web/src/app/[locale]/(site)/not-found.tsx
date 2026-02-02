import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale } from "@/i18n/locale";
import NotFound from "../../not-found";

type Props = {
  params?: { locale?: string } | Promise<{ locale?: string }>;
};

async function readLocaleParam(params: Props["params"]): Promise<string | undefined> {
  const resolved = await params;
  return resolved?.locale;
}

export async function generateMetadata(props?: Props) {
  const locale = await readLocaleParam(props?.params);
  try {
    const validated = assertLocale(locale);
    return { title: TRANSLATIONS[validated].pageNotFoundTitle };
  } catch {
    return {};
  }
}

export default async function LocalizedNotFound(props?: Props) {
  const locale = await readLocaleParam(props?.params);
  try {
    const validated = assertLocale(locale);
    return <NotFound locale={validated} />;
  } catch {
    return <NotFound />;
  }
}
