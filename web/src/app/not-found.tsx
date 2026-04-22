import { cookies, headers } from "next/headers";
import { assertLocale, DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/lib/i18n";

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

  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <p style={{ fontSize: "3rem", fontWeight: 700, margin: 0 }}>404</p>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0.5rem 0" }}>{t["notFound.title"]}</h1>
      <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>{t["notFound.description"]}</p>
      <a href={`/${lang}`} style={{ padding: "0.5rem 1.25rem", borderRadius: "0.375rem", border: "1px solid currentColor", textDecoration: "none", color: "inherit" }}>{t["notFound.backToHome"]}</a>
    </div>
  );
}
