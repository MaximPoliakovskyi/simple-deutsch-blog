import type { ReactNode } from "react";
import SiteChrome from "@/components/layout/SiteChrome";
import { DEFAULT_LOCALE } from "@/i18n/locale";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome locale={DEFAULT_LOCALE}>{children}</SiteChrome>;
}
