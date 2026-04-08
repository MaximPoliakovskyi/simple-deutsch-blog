import type { ReactNode } from "react";
import ChromeExtrasDeferred from "@/components/chrome-extras-deferred";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { LocaleProvider } from "@/components/providers";
import { getRequiredRouteLocale } from "./locale-route";

const HTML_LANG_MAP: Record<string, string> = {
  en: "en",
  ru: "ru",
  uk: "uk",
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Site layout for all [locale]/ routes.
 *
 * NavProgress is intentionally NOT mounted here - it lives in (site)/layout.tsx
 * so it only activates for real pages, not for the 404 boundary (not-found.tsx),
 * which resolves at this level and skips the (site) group entirely.
 */
export default async function LocaleRootLayout({ children, params }: Props) {
  const { locale } = await params;
  const validated = getRequiredRouteLocale(locale);
  const htmlLang = HTML_LANG_MAP[validated] ?? validated;

  return (
    <LocaleProvider locale={validated}>
      {/* Set html[lang] synchronously so it's correct for screen readers before hydration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${htmlLang}";`,
        }}
      />
      <Header />
      <ChromeExtrasDeferred />
      <div data-layout="root-locale" hidden />
      <div data-layout="site" hidden />
      <main className="mt-8 md:mt-12">{children}</main>
      <Footer locale={validated} />
    </LocaleProvider>
  );
}
