import type { Locale } from "@/i18n/locale";

export type NavLocale = Locale;

export type NavLinkItem = {
  key: string;
  fallback: string;
  path: string;
};

export const DESKTOP_NAV_LINKS: readonly NavLinkItem[] = [
  { key: "posts", fallback: "Posts", path: "/posts" },
  { key: "categories", fallback: "Categories", path: "/categories" },
  { key: "levels", fallback: "Levels", path: "/levels" },
];

export const MOBILE_NAV_LINKS: readonly NavLinkItem[] = [
  { key: "posts", fallback: "Posts", path: "/posts" },
  { key: "categories", fallback: "Categories", path: "/categories" },
  { key: "levels", fallback: "Levels", path: "/levels" },
  { key: "search", fallback: "Search", path: "/search" },
];
