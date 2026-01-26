import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import type { WPPostCard } from "@/server/wp/api";
import { getPostBySlug } from "@/server/wp/api";
import SuccessStoriesSlider from "./SuccessStoriesSlider";

type Locale = "en" | "ru" | "uk";

type Props = {
  locale?: Locale;
};

function normalizePosts(payload: unknown): WPPostCard[] {
  if (Array.isArray(payload)) return payload as WPPostCard[];
  if (payload && typeof payload === "object" && Array.isArray((payload as any).posts)) {
    return (payload as { posts: WPPostCard[] }).posts;
  }
  return [];
}

/** Fetch success stories posts and swap to translated versions if needed */
async function getSuccessStoryPosts(locale?: string): Promise<WPPostCard[]> {
  // Always fetch English success-stories first (they have the category)
  const url = new URL("/api/posts", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
  url.searchParams.set("first", "8");
  url.searchParams.set("category", "success-stories");
  
  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return [];
  
  const json = await res.json();
  let englishPosts = normalizePosts(json);
  
  if (!englishPosts.length) return [];
  
  // If Ukrainian locale, fetch Ukrainian versions of these posts
  if (locale === "uk") {
    const ukrainianPosts: WPPostCard[] = [];
    
    for (const englishPost of englishPosts) {
      const ukTranslation = englishPost.translations?.find((t: any) => t.language?.code === "UK");
      
      if (ukTranslation?.slug) {
        try {
          const ukPost = await getPostBySlug(ukTranslation.slug);
          if (ukPost) {
            // Successfully fetched Ukrainian version
            ukrainianPosts.push(ukPost);
          }
        } catch (err) {
          console.error(`Failed to fetch Ukrainian post ${ukTranslation.slug}:`, err);
        }
      }
    }
    
    return ukrainianPosts;
  }
  
  // If Russian locale, fetch Russian versions of these posts
  if (locale === "ru") {
    const russianPosts: WPPostCard[] = [];
    
    for (const englishPost of englishPosts) {
      const ruTranslation = englishPost.translations?.find((t: any) => t.language?.code === "RU");
      
      if (ruTranslation?.slug) {
        try {
          const ruPost = await getPostBySlug(ruTranslation.slug);
          if (ruPost) {
            // Successfully fetched Russian version
            russianPosts.push(ruPost);
          }
        } catch (err) {
          console.error(`Failed to fetch Russian post ${ruTranslation.slug}:`, err);
        }
      }
    }
    
    return russianPosts;
  }
  
  // For English, return as-is
  return englishPosts;
}

/** Server wrapper: fetch once, render the client slider. */
export default async function SuccessStoriesSliderServer({ locale }: Props = {}) {
  const posts = await getSuccessStoryPosts(locale);
  
  if (!posts.length) return null;
  
  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];
  
  // Prepare posts for rendering
  const preparedPosts = posts.map((p) => {
    // Estimate reading time
    let minutes: number | null = null;
    if (p.readingMinutes != null) {
      minutes = Math.max(1, Math.ceil(p.readingMinutes));
    } else {
      const html = p.content ?? p.excerpt ?? "";
      if (html) {
        const text = String(html).replace(/<[^>]+>/g, " ");
        const words = (text.trim().match(/\S+/g) ?? []).length;
        if (words >= 40) {
          minutes = Math.max(1, Math.ceil(words / 200));
        }
      }
    }
    
    // Format date
    const dateText = p.date
      ? new Intl.DateTimeFormat(
          locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US",
          { dateStyle: "long", timeZone: "UTC" }
        ).format(new Date(p.date))
      : null;
    
    // Build href
    const prefix = locale === "en" ? "" : `/${locale}`;
    const href = `${prefix}/posts/${p.slug}`;
    
    return {
      ...p,
      readingText: minutes ? `${minutes} ${t.minRead}` : null,
      dateText,
      href,
    };
  });

  return (
    <SuccessStoriesSlider
      posts={preparedPosts as any}
      title={t.successStories}
      description={t.successStoriesDescription}
    />
  );
}
