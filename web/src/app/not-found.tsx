import { cookies, headers } from "next/headers";
import { assertLocale, DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/lib/i18n";
import StatusPage from "@/components/status-page";

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

const NotFoundIcon = (
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
);

export default async function NotFound({ locale }: { locale?: string } = {}) {
  let maybeLang = locale;
  if (maybeLang) {
    try {
      maybeLang = assertLocale(maybeLang);
    } catch {
      maybeLang = undefined;
    }
  }

  const lang: Locale = (maybeLang as Locale | undefined) ?? (await resolveLocaleFromCookies());
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS[DEFAULT_LOCALE];
  if (process.env.NODE_ENV !== "production" && t.__locale !== lang) {
    // eslint-disable-next-line no-console
    console.error(
      `[404] Locale/message mismatch: requested "${lang}" but dictionary is "${t.__locale}".`,
    );
  }

  return (
    <StatusPage
      icon={NotFoundIcon}
      code="404"
      title={t["notFound.title"]}
      message={t["notFound.description"]}
      actions={[{ type: "link", href: `/${lang}`, label: t["notFound.backToHome"] }]}
    />
  );
}

