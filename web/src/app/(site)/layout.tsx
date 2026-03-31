import type { ReactNode } from "react";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/i18n-provider";
import DeferredChromeExtras from "../[locale]/_components/deferred-chrome-extras";
import Footer from "../[locale]/_components/footer";
import Header from "../[locale]/_components/header";
import Providers from "../[locale]/_components/providers";
import { RouteReady } from "../[locale]/_components/route-ready";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider locale={DEFAULT_LOCALE}>
      <Header />
      <DeferredChromeExtras />
      <RouteReady />
      <Providers locale={DEFAULT_LOCALE}>
        <main className="mt-8 min-h-[60vh] md:mt-12">{children}</main>
        <Footer locale={DEFAULT_LOCALE} />
      </Providers>
    </LocaleProvider>
  );
}
