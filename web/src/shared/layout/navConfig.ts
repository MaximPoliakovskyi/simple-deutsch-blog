import type { TranslationKey } from "@/shared/i18n/i18n";

export type NavLinkItem = {
  key: TranslationKey;
  path: string;
};

export const DESKTOP_NAV_LINKS: readonly NavLinkItem[] = [
  { key: "posts.title", path: "/posts" },
  { key: "categories.title", path: "/categories" },
  { key: "levels.title", path: "/levels" },
];

export const MOBILE_NAV_LINKS: readonly NavLinkItem[] = [
  { key: "posts.title", path: "/posts" },
  { key: "categories.title", path: "/categories" },
  { key: "levels.title", path: "/levels" },
  { key: "search.title", path: "/search" },
];
