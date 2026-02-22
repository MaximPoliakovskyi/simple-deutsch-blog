import { cookies, headers } from "next/headers";
import Link from "next/link";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, DEFAULT_LOCALE } from "@/i18n/locale";

function cookieValueFromHeader(rawCookieHeader: string | null, key: string) {
  if (!rawCookieHeader) return undefined;
  const pairs = rawCookieHeader.split(";").map((part) => part.trim());
  const match = pairs.find((pair) => pair.startsWith(`${key}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.slice(key.length + 1));
}

async function resolveLocaleFromCookies() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const rawCookieHeader = headerStore.get("cookie");

  const rawLocale =
    cookieStore.get("NEXT_LOCALE")?.value ??
    cookieStore.get("locale")?.value ??
    cookieValueFromHeader(rawCookieHeader, "NEXT_LOCALE") ??
    cookieValueFromHeader(rawCookieHeader, "locale");

  if (!rawLocale) return DEFAULT_LOCALE;
  try {
    return assertLocale(rawLocale);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export default async function NotFound(_: { locale?: string } = {}) {
  const lang = await resolveLocaleFromCookies();
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS[DEFAULT_LOCALE];
  if (process.env.NODE_ENV !== "production" && t.__locale !== lang) {
    // eslint-disable-next-line no-console
    console.error(
      `[404] Locale/message mismatch: requested "${lang}" but dictionary is "${t.__locale}".`,
    );
  }
  const homeHref = `/${lang}`;

  return (
    <main
      className="fixed inset-0 min-h-screen h-screen w-full flex items-center justify-center overflow-hidden px-4 py-6 sm:px-6"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 1rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
      }}
    >
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-black/10 dark:bg-white/10">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" className="opacity-40" />
            <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold">
          {t["NotFound.title"] ?? t["notFound.title"] ?? t.pageNotFoundHeading}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm opacity-75">
          {t["NotFound.description"] ?? t["notFound.description"] ?? t.pageNotFoundMessage}
        </p>

        <div className="mt-6">
          <Link
            href={homeHref}
            className="inline-flex items-center rounded-md bg-[var(--sd-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)]/60"
          >
            {t["NotFound.backHome"] ?? t["notFound.backToHome"] ?? t.backToHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
