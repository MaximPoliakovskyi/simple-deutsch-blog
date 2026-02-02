"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LocaleProvider } from "@/core/i18n/LocaleProvider";
import { DEFAULT_LOCALE, parseLocaleFromPath, type Locale } from "@/i18n/locale";

/**
 * Single, app-wide LocaleProvider that derives locale from the URL prefix.
 * This keeps Navigation and page-level client components in the same context,
 * so things like post translation links work everywhere.
 */
export default function LocaleProviderFromPath({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = (parseLocaleFromPath(pathname) ?? DEFAULT_LOCALE) as Locale;
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}

