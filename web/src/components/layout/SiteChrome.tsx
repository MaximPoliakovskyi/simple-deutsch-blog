import type { ReactNode } from "react";
import FirstVisitDisclaimer from "@/components/layout/FirstVisitDisclaimer";
import HydratedNavigation from "@/components/layout/HydratedNavigation";
import { RouteReady } from "@/components/transition/RouteReady";
import BackButton from "@/components/ui/BackButton";
import { LocaleProvider } from "@/core/i18n/LocaleProvider";
import type { Locale } from "@/i18n/locale";

export default function SiteChrome({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <LocaleProvider locale={locale}>
      <HydratedNavigation />
      <FirstVisitDisclaimer />
      <RouteReady />
      {children}
      <BackButton />
    </LocaleProvider>
  );
}
