import { notFound } from "next/navigation";
import { assertLocale, type Locale } from "@/lib/i18n";

export function getOptionalRouteLocale(locale: string): Locale | null {
  try {
    return assertLocale(locale);
  } catch {
    return null;
  }
}

export function getRequiredRouteLocale(locale: string): Locale {
  const validated = getOptionalRouteLocale(locale);

  if (validated) {
    return validated;
  }

  notFound();
}
