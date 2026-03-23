import { mapPostCardMeta } from "@/features/posts/postCardMeta";
import { getPostsLightweight } from "@/server/wp/posts";
import type { WPPostCard } from "@/server/wp/types";
import { getTranslations } from "@/shared/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
import LatestPostsSlider from "./LatestPostsSlider";

type Props = {
  locale?: Locale;
};

async function getSliderPosts(locale?: Locale): Promise<WPPostCard[]> {
  const response = await getPostsLightweight({ first: 8, locale });
  return (response.posts?.nodes ?? []) as WPPostCard[];
}

export default async function LatestPostsSliderServer({ locale }: Props = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const posts = await getSliderPosts(effectiveLocale);
  if (!posts.length) return null;

  const t = getTranslations(effectiveLocale);
  const mapped = posts.map((post) => mapPostCardMeta(post, effectiveLocale));

  return <LatestPostsSlider posts={mapped} title={t["posts.latest"]} />;
}
