import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";
const DEBUG_PROXY = process.env.NODE_ENV !== "production";
const LOCALE_COOKIE = "SD_LOCALE";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function hasLocalePrefix(pathname: string): boolean {
  const firstSegment = pathname.split("/")[1]?.toLowerCase();
  return SUPPORTED_LOCALES.includes(firstSegment as Locale);
}

function getLocaleFromPrefixedPath(pathname: string): Locale | null {
  const firstSegment = pathname.split("/")[1]?.toLowerCase();
  if (SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return null;
}

function isIgnoredPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function parseAcceptLanguageTags(headerValue: string | null): string[] {
  if (!headerValue) return [];

  return headerValue
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase() ?? "")
    .filter((tag) => tag.length > 0);
}

function detectLocaleFromAcceptLanguage(headerValue: string | null): Locale {
  const tags = parseAcceptLanguageTags(headerValue);

  // Hard priority rule (independent from q/order):
  // uk present anywhere > ru present anywhere > en fallback
  if (tags.some((tag) => tag === "uk" || tag.startsWith("uk-"))) return "uk";
  if (tags.some((tag) => tag === "ru" || tag.startsWith("ru-"))) return "ru";
  return DEFAULT_LOCALE;
}

function isValidLocale(value: string | undefined): value is Locale {
  return Boolean(value && SUPPORTED_LOCALES.includes(value as Locale));
}

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set({
    name: LOCALE_COOKIE,
    value: locale,
    path: "/",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const acceptLanguage = request.headers.get("accept-language");
  const localeCookie = request.cookies.get(LOCALE_COOKIE)?.value;

  if (DEBUG_PROXY) {
    console.log("[proxy] hit", { pathname, acceptLanguage, localeCookie });
  }

  if (isIgnoredPath(pathname)) {
    if (DEBUG_PROXY) {
      console.log("[proxy] skip ignored", { pathname });
    }
    return NextResponse.next();
  }

  if (hasLocalePrefix(pathname)) {
    const prefixedLocale = getLocaleFromPrefixedPath(pathname);
    const response = NextResponse.next();
    if (prefixedLocale) setLocaleCookie(response, prefixedLocale);

    if (DEBUG_PROXY) {
      console.log("[proxy] skip locale-prefixed", {
        pathname,
        acceptLanguage,
        localeCookie,
        chosenLocale: prefixedLocale,
      });
    }
    return response;
  }

  const chosenLocale = isValidLocale(localeCookie)
    ? localeCookie
    : detectLocaleFromAcceptLanguage(acceptLanguage);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname === "/" ? `/${chosenLocale}` : `/${chosenLocale}${pathname}`;
  const response = NextResponse.redirect(redirectUrl);
  setLocaleCookie(response, chosenLocale);

  if (DEBUG_PROXY) {
    console.log("[proxy] redirect", {
      pathname,
      acceptLanguage,
      localeCookie,
      chosenLocale,
      from: `${pathname}${search}`,
      to: `${redirectUrl.pathname}${redirectUrl.search}`,
    });
  }

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
