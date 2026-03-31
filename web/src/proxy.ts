import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
const DEFAULT_LOCALE = "en";

// Matches paths that already have a 2-letter locale prefix (e.g. /en, /ru, /uk)
const LOCALE_PREFIX_RE = /^\/[a-z]{2}(\/|$)/i;

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, API routes, static files, RSS
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/rss.xml" ||
    /\.[a-z0-9]{1,5}$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Already has a locale-like prefix? Let Next.js route it.
  // Valid locales render normally; invalid ones trigger notFound() in locale-route.ts.
  if (LOCALE_PREFIX_RE.test(pathname)) {
    return NextResponse.next();
  }

  // No locale prefix - redirect to the user's preferred or default locale
  const cookieLocale = request.cookies.get("locale")?.value;
  const locale =
    cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url, { status: 307 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
