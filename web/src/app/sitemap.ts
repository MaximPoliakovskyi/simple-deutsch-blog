import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://simple-deutsch.de";
const LOCALES = ["en", "ru", "uk"] as const;

const STATIC_ROUTES = [
  "/about",
  "/articles",
  "/categories",
  "/levels",
  "/search",
  "/partnerships",
  "/team",
  "/privacy",
  "/terms",
  "/imprint",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const root: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const localizedHome: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 1,
  }));

  const localizedStatic: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    STATIC_ROUTES.map((route) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  return [...root, ...localizedHome, ...localizedStatic];
}
