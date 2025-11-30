export function detectLocaleFromPathname(pathname?: string): "en" | "ru" | "ua" {
  if (!pathname) return "en";
  if (pathname.startsWith("/ru")) return "ru";
  if (pathname.startsWith("/ua")) return "ua";
  return "en";
}
