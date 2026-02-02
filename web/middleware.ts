import { type NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCALE as LOCALE_FALLBACK,
  parseLocaleFromPath,
  SUPPORTED_LOCALES,
} from "@/i18n/locale";

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

function isAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.ico" ||
    pathname === "/theme-init.js" ||
    pathname.startsWith("/assets/") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export function middleware(req: NextRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // Early bypass for Next.js internals and API routes so middleware
    // does not interfere with these technical endpoints.
    if (pathname.startsWith("/_next/") || pathname.startsWith("/api/")) {
      const res = NextResponse.next();
      res.headers.set("x-mw", "pass");
      return res;
    }

    if (isAsset(pathname)) {
      const res = NextResponse.next();
      // Cache static assets aggressively
      res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
      // Debug header to show middleware passed for assets
      res.headers.set("x-mw", "pass");
      return res;
    }

    // Root -> English canonical entry point must be handled first for `/`.
    if (pathname === "/") {
      const redirectUrl = nextUrl.clone();
      redirectUrl.pathname = "/en";
      const res = NextResponse.redirect(redirectUrl, 308);
      // Debug header to indicate the root redirect was executed
      res.headers.set("x-mw", "root-redirect");
      return res;
    }

    // (root handled above)

    // Redirect legacy category slugs to updated slugs, preserve locale prefix
    // examples:
    // /categories/exercises -> /categories/exercises-practice
    // /ru/category/speaking -> /ru/categories/speaking-pronunciation
    const catMatch = pathname.match(
      /^\/?(?:(ru|uk|en|de)\/)?(categories?|category)\/(exercises|tips|speaking)(\/|$)/i,
    );
    if (catMatch) {
      try {
        const localePart = catMatch[1] ? `/${catMatch[1]}` : "";
        const plural = "categories"; // normalize to plural
        const oldSlug = (catMatch[3] || "").toLowerCase();
        const map: Record<string, string> = {
          exercises: "exercises-practice",
          tips: "tips-motivation",
          speaking: "speaking-pronunciation",
        };
        const newSlug = map[oldSlug];
        if (newSlug) {
          const suffix = catMatch[4] || "";
          const redirectUrl = nextUrl.clone();
          redirectUrl.pathname = `${localePart}/${plural}/${newSlug}${suffix}`;
          return NextResponse.redirect(redirectUrl, 308);
        }
      } catch {
        // fall through
      }
    }

    // Redirect legacy /tags routes to /levels (permanent 308)
    // Examples: /tags -> /levels, /en/tags -> /en/levels, /ru/tags/some -> /ru/levels/some
    if (pathname.includes("/tags") && !pathname.includes("/levels")) {
      try {
        const newPath = pathname.replace(/\/tags(?=\/|$)/, "/levels");
        const redirectUrl = nextUrl.clone();
        redirectUrl.pathname = newPath;
        return NextResponse.redirect(redirectUrl, 308);
      } catch {
        // fall through to normal handling on error
      }
    }

    // Determine locale prefix in pathname (server-side only)
    const parsed = parseLocaleFromPath(pathname);

    // If path already contains a valid locale prefix, allow with cache headers
    if (parsed) {
      const res = NextResponse.next();
      if (!pathname.includes("/api/")) {
        res.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
      }
      res.headers.set("x-mw", "pass");
      return res;
    }

    // Redirect legacy /ua/* to /uk/*
    if (/^\/ua(?:\/|$)/i.test(pathname)) {
      const redirectUrl = nextUrl.clone();
      redirectUrl.pathname = pathname.replace(/^\/ua/i, "/uk");
      return NextResponse.redirect(redirectUrl, 308);
    }

    // Note: root is handled earlier to ensure a single-hop redirect.

    // If path has an unknown two-letter prefix (/de, /fr, etc.), redirect to default
    const maybePrefix = pathname.match(/^\/(?<p>[a-zA-Z]{2})(?:\/|$)/);
    const prefix = maybePrefix?.groups?.p?.toLowerCase();
    if (prefix && !SUPPORTED_LOCALE_SET.has(prefix)) {
      const redirectUrl = nextUrl.clone();
      const rest = pathname.replace(/^\/[a-zA-Z]{2}/, "");
      redirectUrl.pathname = `/${String(LOCALE_FALLBACK)}${rest}`;
      return NextResponse.redirect(redirectUrl, 308);
    }

    // No locale prefix — canonicalize by prefixing default locale
    {
      const redirectUrl = nextUrl.clone();
      redirectUrl.pathname = `/${String(LOCALE_FALLBACK)}${pathname}`;
      return NextResponse.redirect(redirectUrl, 308);
    }
  } catch (_e) {
    const res = NextResponse.next();
    res.headers.set("x-mw", "pass");
    return res;
  }
}

export const config = {
  // Simplified matcher: run middleware for all app paths.
  matcher: ["/:path*"],
};
