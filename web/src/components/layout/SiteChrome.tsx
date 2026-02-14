import type { ReactNode } from "react";
import LocaleProviderFromPath from "@/components/LocaleProviderFromPath";
import HydratedNavigation from "@/components/layout/HydratedNavigation";
import { RouteReady } from "@/components/transition/RouteReady";
import BackButton from "@/components/ui/BackButton";

export default function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <LocaleProviderFromPath>
      <HydratedNavigation />
      <RouteReady />
      {children}
      <BackButton />
    </LocaleProviderFromPath>
  );
}
