import { assertLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

function parseSavedLocale(value: string | null | undefined): Locale | null {
  if (!value) {
    return null;
  }

  try {
    return assertLocale(value);
  } catch {
    return null;
  }
}

export function detectLocaleFromAcceptLanguage(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  for (const part of acceptLanguage.split(",")) {
    const language = part.trim().toLowerCase();

    if (language.startsWith("uk")) {
      return "uk";
    }

    if (language.startsWith("ru")) {
      return "ru";
    }
  }

  return DEFAULT_LOCALE;
}

export function resolvePreferredLocale({
  cookieLocale,
  acceptLanguage,
}: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  return (
    parseSavedLocale(cookieLocale) ??
    detectLocaleFromAcceptLanguage(acceptLanguage) ??
    DEFAULT_LOCALE
  );
}
