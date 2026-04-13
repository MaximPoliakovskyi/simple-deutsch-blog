const DEFAULT_SITE_ORIGIN = "https://simple-deutsch.de";

export function getSiteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.BASE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    DEFAULT_SITE_ORIGIN;
  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(normalized).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

export function toAbsoluteSiteUrl(pathname: string): string {
  const fixedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(fixedPath, getSiteOrigin()).toString();
}
