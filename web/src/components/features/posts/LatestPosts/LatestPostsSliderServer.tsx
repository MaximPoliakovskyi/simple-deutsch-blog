import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";
import { getPosts } from "@/server/wp/api";
import LatestPostsSlider from "./LatestPostsSlider";

type Props = {
  locale?: Locale;
};

async function getSliderPosts(locale?: Locale): Promise<WPPostCard[]> {
  const response = await getPosts({ first: 8, locale });
  return (response.posts?.nodes ?? []) as WPPostCard[];
}

export default async function LatestPostsSliderServer({ locale }: Props = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const posts = await getSliderPosts(effectiveLocale);
  if (!posts.length) return null;

  const t = TRANSLATIONS[effectiveLocale];

  const mapped = posts.map((post) => {
    try {
      const dateText = post.date
        ? new Intl.DateTimeFormat(
            effectiveLocale === "uk" ? "uk-UA" : effectiveLocale === "ru" ? "ru-RU" : "en-US",
            { dateStyle: "long", timeZone: "UTC" },
          ).format(new Date(post.date))
        : null;
      const prefix = effectiveLocale === "en" ? "" : `/${effectiveLocale}`;
      const href = `${prefix}/posts/${post.slug}`;
      return { ...post, readingText: post.readingText ?? null, dateText, href };
    } catch {
      const dateText = post.date
        ? new Intl.DateTimeFormat(
            effectiveLocale === "uk" ? "uk-UA" : effectiveLocale === "ru" ? "ru-RU" : "en-US",
            { dateStyle: "long", timeZone: "UTC" },
          ).format(new Date(post.date))
        : null;
      const prefix = effectiveLocale === "en" ? "" : `/${effectiveLocale}`;
      const href = `${prefix}/posts/${post.slug}`;
      return { ...post, readingText: null, dateText, href };
    }
  });

  return <LatestPostsSlider posts={mapped} title={t.latestPosts} />;
}
