import type { Metadata } from "next";
import { NextResponse } from "next/server";
import { generatePostMetadata } from "@/app/[locale]/_lib/post-page";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";
import { getPostBySlug } from "@/lib/posts";
import { getSiteOrigin } from "@/lib/site-url";

function readCanonical(metadata: Metadata): string | null {
  const canonical = metadata.alternates?.canonical;
  if (!canonical) return null;
  return typeof canonical === "string" ? canonical : canonical.toString();
}

function readOpenGraphImage(metadata: Metadata): string | null {
  const images = metadata.openGraph?.images;
  if (!images) return null;
  const firstImage = Array.isArray(images) ? images[0] : images;
  if (!firstImage) return null;
  if (typeof firstImage === "string") return firstImage;
  if (firstImage instanceof URL) return firstImage.toString();
  return "url" in firstImage ? firstImage.url.toString() : null;
}

function readTwitterImage(metadata: Metadata): string | null {
  const images = metadata.twitter?.images;
  if (!images) return null;
  const firstImage = Array.isArray(images) ? images[0] : images;
  if (!firstImage) return null;
  if (typeof firstImage === "string") return firstImage;
  if (firstImage instanceof URL) return firstImage.toString();
  return "url" in firstImage ? firstImage.url.toString() : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim() || "zipf-law";
  const localeParam = searchParams.get("locale")?.trim();
  const locale: Locale = localeParam && isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  const [metadata, post] = await Promise.all([
    generatePostMetadata({ params: Promise.resolve({ slug }), locale }),
    getPostBySlug(slug, { locale }),
  ]);

  const payload = {
    slug,
    locale,
    siteOrigin: getSiteOrigin(),
    postFound: Boolean(post),
    title: metadata.title?.toString() ?? null,
    description: metadata.description ?? null,
    canonical: readCanonical(metadata),
    openGraph: {
      title: metadata.openGraph?.title?.toString() ?? null,
      description: metadata.openGraph?.description ?? null,
      url:
        typeof metadata.openGraph?.url === "string"
          ? metadata.openGraph.url
          : (metadata.openGraph?.url?.toString() ?? null),
      type: ((metadata.openGraph as { type?: string } | undefined)?.type ?? null),
      image: readOpenGraphImage(metadata),
    },
    twitter: {
      card: ((metadata.twitter as { card?: string } | undefined)?.card ?? null),
      title: metadata.twitter?.title?.toString() ?? null,
      description: metadata.twitter?.description ?? null,
      image: readTwitterImage(metadata),
    },
  };

  console.info("[og-debug]", JSON.stringify(payload));

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
