import type { ReactElement } from "react";
import { getAllTags, getPostsByTagDatabaseId } from "@/server/wp/categories";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";
import type { WPPostCard } from "@/server/wp/types";
import { getTranslations } from "@/shared/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
import { CEFR_SLUGS } from "@/shared/lib/levels";
import PageHeading from "@/shared/ui/PageHeading";
import Section from "@/shared/ui/Section";
import CategoriesBlockClient from "./CategoriesBlockClient";

type TagNode = { databaseId?: number; id: string; name: string; slug: string };
type Category = {
  canonicalTagDatabaseId: number;
  id: string;
  name: string;
  slug: string;
  tagDatabaseId: number;
};

const LEVEL_CODES = CEFR_SLUGS.map((slug) => slug.toLowerCase());

function getLevelSlugCandidates(levelCode: string, locale: Locale) {
  if (locale === "ru") return [`${levelCode}-ru`, levelCode];
  if (locale === "uk") return [`${levelCode}-uk`, levelCode];
  return [levelCode];
}

function resolveLevelCategories(tags: TagNode[], locale: Locale): Category[] {
  const tagsBySlug = new Map(tags.map((tag) => [tag.slug.toLowerCase(), tag]));

  const resolved: Category[] = [];
  for (const levelCode of LEVEL_CODES) {
    const canonical = tagsBySlug.get(levelCode);
    const localized = getLevelSlugCandidates(levelCode, locale)
      .map((candidate) => tagsBySlug.get(candidate))
      .find((tag): tag is TagNode => Boolean(tag));
    const picked = localized ?? canonical;

    if (!picked || !picked.databaseId) {
      continue;
    }

    resolved.push({
      canonicalTagDatabaseId: canonical?.databaseId ?? picked.databaseId,
      id: picked.id,
      name: picked.name,
      slug: levelCode,
      tagDatabaseId: picked.databaseId,
    });
  }

  return resolved;
}

export default async function CategoriesBlock({
  locale,
}: {
  locale?: Locale;
} = {}): Promise<ReactElement> {
  const effectiveLocale: Locale = locale ?? DEFAULT_LOCALE;
  const dictionary = getTranslations(effectiveLocale);

  const tagsResp = await getAllTags({ first: 200 });
  const tags = extractConnectionNodes<TagNode>(tagsResp?.tags).map((tag) => ({
    databaseId: tag.databaseId,
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  }));

  const visibleCategories: Category[] = resolveLevelCategories(tags, effectiveLocale);

  const preferredInitialCategory =
    visibleCategories.find((category) => category.slug.toLowerCase() === "a1")?.slug ??
    visibleCategories[0]?.slug ??
    null;

  let initialPosts: WPPostCard[] = [];

  if (preferredInitialCategory && visibleCategories.length > 0) {
    const selectedCategory = visibleCategories.find(
      (category) => category.slug === preferredInitialCategory,
    );

    if (!selectedCategory) {
      return (
        <Section fullBleed spacing="md" tone="contrast" containerClassName="px-4">
          <PageHeading
            as="h2"
            description={dictionary["levels.description"]}
            size="section"
            title={dictionary["levels.heading"]}
          />
        </Section>
      );
    }

    try {
      let initialPostsResponse = await getPostsByTagDatabaseId(
        selectedCategory.tagDatabaseId,
        100,
        undefined,
        effectiveLocale,
      );
      initialPosts = (initialPostsResponse.posts?.nodes ?? []) as WPPostCard[];

      if (
        initialPosts.length === 0 &&
        selectedCategory.canonicalTagDatabaseId !== selectedCategory.tagDatabaseId
      ) {
        initialPostsResponse = await getPostsByTagDatabaseId(
          selectedCategory.canonicalTagDatabaseId,
          100,
          undefined,
          effectiveLocale,
        );
        initialPosts = (initialPostsResponse.posts?.nodes ?? []) as WPPostCard[];
      }
    } catch (error) {
      console.error("Failed to load initial level posts:", error);
    }
  }

  return (
    <Section fullBleed spacing="md" tone="contrast" containerClassName="px-4">
      <div className="flex flex-col gap-[var(--space-8)]">
        <PageHeading
          as="h2"
          description={dictionary["levels.description"]}
          size="section"
          descriptionClassName="max-w-[627px] text-[16px] leading-[26px] text-[#d4d4d4]"
          titleClassName="text-[26px] font-extrabold leading-[38px] tracking-[-0.52px] text-white sm:text-[30px] sm:leading-[45px] sm:tracking-[-0.6px]"
          title={dictionary["levels.heading"]}
        />

        <CategoriesBlockClient
          categories={visibleCategories}
          initialPosts={initialPosts}
          initialSelectedCategory={preferredInitialCategory}
          locale={effectiveLocale}
          pageSize={3}
        />
      </div>
    </Section>
  );
}
