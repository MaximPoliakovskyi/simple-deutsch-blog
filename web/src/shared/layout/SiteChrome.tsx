import type { ReactNode } from "react";
import { LocaleProvider } from "@/shared/i18n/LocaleProvider";
import type { Locale } from "@/shared/i18n/locale";
import Navigation from "@/shared/layout/Navigation";
import { RouteReady } from "@/shared/transition/RouteReady";
import BackButton from "@/shared/ui/BackButton";

type SiteChromeProps = {
  children: ReactNode;
  locale: Locale;
};

export default function SiteChrome({ children, locale }: SiteChromeProps) {
  return (
    <LocaleProvider locale={locale}>
      <Navigation />
      {children}
      <RouteReady />
      <BackButton />
    </LocaleProvider>
  );
}
