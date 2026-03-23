import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageTitle } from "@/shared/i18n/i18n";
import { assertLocale, type Locale, SUPPORTED_LOCALES } from "@/shared/i18n/locale";
import { buildI18nAlternates } from "@/shared/i18n/seo";

export type LocaleRouteParams = Promise<{ locale: string }>;

export async function resolveLocale(params: LocaleRouteParams): Promise<Locale | null> {
  try {
    return assertLocale((await params).locale);
  } catch {
    return null;
  }
}

export async function resolveLocaleOrNotFound(params: LocaleRouteParams): Promise<Locale> {
  const locale = await resolveLocale(params);
  if (!locale) {
    notFound();
  }

  return locale;
}

export function generateLocaleStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export function withSiteTitle(locale: Locale, title: string) {
  return buildPageTitle(locale, title);
}

export function buildLocalizedMetadata(
  locale: Locale,
  pathname: string,
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    description,
    alternates: buildI18nAlternates(pathname, locale),
  };
}

export function buildLocalizedPageMetadata(
  locale: Locale,
  pathname: string,
  pageTitle: string,
  description?: string,
): Metadata {
  return buildLocalizedMetadata(locale, pathname, withSiteTitle(locale, pageTitle), description);
}
