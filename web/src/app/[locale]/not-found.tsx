import { TRANSLATIONS } from "@/core/i18n/i18n";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { assertLocale, parseLocaleFromPath } from "@/i18n/locale";
import NotFound from "../not-found";

type Props = {
  params?: Promise<{ locale?: string }>;
};

function toPathname(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).pathname;
  } catch {
    return value;
  }
}

function localeFromRouteMatches(value: string | null) {
  if (!value) return null;

  const parsed = new URLSearchParams(value);
  const candidate = parsed.get("nxtPlocale") ?? parsed.get("locale");
  if (!candidate) return null;

  try {
    return assertLocale(candidate);
  } catch {
    return null;
  }
}

async function resolveLocale(params?: Props["params"]) {
  const resolved = params ? await params : undefined;
  const paramLocale = resolved?.locale;
  if (paramLocale) {
    try {
      return assertLocale(paramLocale);
    } catch {
      return null;
    }
  }

  const requestHeaders = await headers();

  const fromRouteMatches = localeFromRouteMatches(requestHeaders.get("x-now-route-matches"));
  if (fromRouteMatches) return fromRouteMatches;

  const pathnameCandidates = [
    requestHeaders.get("x-pathname"),
    requestHeaders.get("next-url"),
    requestHeaders.get("url"),
    requestHeaders.get("referer"),
    requestHeaders.get("x-matched-path"),
  ];

  for (const candidate of pathnameCandidates) {
    const locale = parseLocaleFromPath(toPathname(candidate));
    if (locale) return locale;
  }

  return null;
}

export async function generateMetadata({ params }: Props = {}) {
  const locale = await resolveLocale(params);
  if (!locale) return {};

  return { title: TRANSLATIONS[locale].pageNotFoundTitle };
}

export default async function LocalizedNotFound({ params }: Props = {}) {
  const locale = await resolveLocale(params);
  if (!locale) notFound();

  return <NotFound locale={locale} />;
}
