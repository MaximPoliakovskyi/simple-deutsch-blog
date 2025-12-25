import { NextRequest, NextResponse } from "next/server";

const SUPPORTED = ["en", "ru", "ua"] as const;
type Locale = (typeof SUPPORTED)[number];

function mapLang(tag?: string | null): Locale | null {
  if (!tag) return null;
  const t = tag.toLowerCase();
  if (t.startsWith("uk") || t.startsWith("uk-")) return "ua";
  if (t.startsWith("ru") || t.startsWith("ru-")) return "ru";
  if (t.startsWith("en") || t.startsWith("en-")) return "en";
  return null;
}

function pickFromAcceptLanguage(header?: string | null): Locale | null {
  if (!header) return null;
  const parts = header.split(",").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    const [lang] = part.split(";");
    const mapped = mapLang(lang);
    if (mapped) return mapped;
  }
  return null;
}

function isAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/assets/") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export function middleware(req: NextRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    if (isAsset(pathname)) return NextResponse.next();

    // Redirect legacy category slugs to updated slugs, preserve locale prefix
    // examples:
    // /categories/exercises -> /categories/exercises-practice
    // /ru/category/speaking -> /ru/categories/speaking-pronunciation
    const catMatch = pathname.match(/^\/(?:(ru|ua|en|de)\/)?(categories?|category)\/(exercises|tips|speaking)(\/|$)/i);
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
      } catch (e) {
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
      } catch (e) {
        // fall through to normal handling on error
      }
    }

    // If path already contains a locale prefix, do nothing
    const hasLocalePrefix = /^\/(ru|ua|en)(?:\/|$)/i.test(pathname);
    if (hasLocalePrefix) return NextResponse.next();

    // If cookie exists, honor it
    const cookieValue = req.cookies.get("site_locale")?.value;
    if (cookieValue) return NextResponse.next();

    // No cookie — detect from Accept-Language and set cookie for client
    const accept = req.headers.get("accept-language");
    const detected = pickFromAcceptLanguage(accept) ?? "en";

    const res = NextResponse.next();
    try {
      res.cookies.set("site_locale", detected, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    } catch {
      // ignore if cookies API not available
    }
    return res;
  } catch (e) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/:path*"],
};
