import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolvePreferredLocale } from "@/lib/request-locale";

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
  // Forward x-pathname so server components (e.g. not-found.tsx) can detect the locale
  // even when Next.js doesn't pass segment params to not-found.tsx boundaries.
  if (LOCALE_PREFIX_RE.test(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // No locale prefix - redirect to the user's preferred or default locale.
  // Priority: explicit cookie > Accept-Language header > default ('en').
  const rawCookie =
    request.cookies.get("NEXT_LOCALE")?.value ?? request.cookies.get("locale")?.value;
  const locale = resolvePreferredLocale({
    cookieLocale: rawCookie,
    acceptLanguage: request.headers.get("accept-language"),
  });

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url, { status: 307 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
