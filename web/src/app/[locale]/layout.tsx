import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Providers, { LocaleProvider } from "@/components/providers";
import { RouteReady } from "@/components/route-wrapper";
import { getRequiredRouteLocale } from "./locale-route";

const DeferredChromeExtras = dynamic(() => import("@/components/chrome-extras"));

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Site layout for all [locale]/ routes.
 *
 * NavProgress is intentionally NOT mounted here — it lives in (site)/layout.tsx
 * so it only activates for real pages, not for the 404 boundary (not-found.tsx),
 * which resolves at this level and skips the (site) group entirely.
 */
export default async function LocaleRootLayout({ children, params }: Props) {
  const { locale } = await params;
  const validated = getRequiredRouteLocale(locale);

  if (process.env.NODE_ENV !== "production") {
    console.log("[hydration][server][LocaleLayout]", { localeParam: locale, validated });
  }

  return (
    <LocaleProvider locale={validated}>
      <Header />
      <DeferredChromeExtras />
      <RouteReady />
      <div data-layout="root-locale" hidden />
      <div data-layout="site" hidden />
      <Providers locale={validated}>
        <main className="mt-8 md:mt-12 min-h-screen">{children}</main>
        <Footer locale={validated} />
      </Providers>
    </LocaleProvider>
  );
}
