import type { ReactNode } from "react";
import { LocaleProvider } from "@/core/i18n/LocaleProvider";
import type { Locale } from "@/i18n/locale";
import HydratedNavigation from "@/components/layout/HydratedNavigation";
import { RouteReady } from "@/components/transition/RouteReady";
import BackButton from "@/components/ui/BackButton";

export default function SiteChrome({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return (
    <LocaleProvider locale={locale}>
      <HydratedNavigation />
      <RouteReady />
      {children}
      <BackButton />
    </LocaleProvider>
  );
}
