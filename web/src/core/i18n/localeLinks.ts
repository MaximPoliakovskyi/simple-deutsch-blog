import { parseLocaleFromPath } from "@/i18n/locale";

export type SiteLang = "en" | "ru" | "uk";

/**
 * Build a canonical, fully-prefixed href for the target language.
 * Always returns a path starting with /en|/ru|/uk followed by the rest of the path.
 */
export function buildLocalizedHref(target: SiteLang, pathname: string | null | undefined): string {
  const p = pathname || "/";
  // Remove any existing two-letter prefix (including legacy ua)
  const current = parseLocaleFromPath(p);
  const stripped = current ? p.replace(new RegExp(`^/${current}`), "") : p;
  const rest = stripped === "/" ? "" : stripped;
  return `/${target}${rest}`;
}
