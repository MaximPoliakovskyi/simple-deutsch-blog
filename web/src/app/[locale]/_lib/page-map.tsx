import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { buildLocalizedHref, type Locale, TRANSLATIONS } from "@/lib/i18n";
import {
  buildLevelTranslationMap,
  filterWordPressBadgesByLocale,
  getCategoryBySlug,
  getTagBySlug,
} from "@/lib/posts";
import { buildI18nAlternates } from "@/lib/seo";
import AboutPage from "./about-page";
import { CategoriesIndexContent } from "./categories-index-content";
import { CategoryPageContent } from "./category-page-content";
import ImprintPage from "./imprint-page";
import { LevelPageContent } from "./level-page-content";
import { LevelsIndexContent } from "./levels-index-content";
import PartnershipsClient from "./partnerships-page";
import { generatePostMetadata, renderPostPage } from "./post-page";
import PostsIndex from "./posts-index";
import PrivacyPage from "./privacy-page";
import { SearchPageContent, type SearchParams } from "./search-page-content";
import TeamPageContent, { generateTeamMetadata } from "./team-page";
import TermsPage from "./terms-page";

type MapInput = {
  locale: Locale;
  slug: string[];
  searchParams?: SearchParams;
};

export async function generateMappedMetadata({
  locale,
  slug,
  searchParams,
}: MapInput): Promise<Metadata> {
  const t = TRANSLATIONS[locale];
  const [section, ...rest] = slug;

  switch (section) {
    case "about":
      return {
        title: `${t.about} — ${t.siteTitle}`,
        alternates: buildI18nAlternates("/about", locale),
      };
    case "articles":
      if (rest.length === 0)
        return {
          title: `${t.posts} — ${t.siteTitle}`,
          alternates: buildI18nAlternates("/articles", locale),
        };
      if (rest.length === 1) {
        return generatePostMetadata({ params: Promise.resolve({ slug: rest[0] }), locale });
      }
      return {};
    case "categories":
      if (rest.length === 0)
        return {
          title: `${t.categories} — ${t.siteTitle}`,
          alternates: buildI18nAlternates("/categories", locale),
        };
      if (rest.length === 1) {
        const term = await getCategoryBySlug(rest[0], locale);
        return {
          title: term ? `Category: ${term.name} — ${t.siteTitle}` : (t.categoryNotFound as string),
          alternates: buildI18nAlternates(`/categories/${rest[0]}`, locale),
        };
      }
      return {};
    case "levels":
    case "tags":
      if (rest.length === 0)
        return {
          title: `${t.levels} — ${t.siteTitle}`,
          alternates: buildI18nAlternates("/levels", locale),
        };
      if (rest.length === 1) {
        const tag = rest[0];
        const term = await getTagBySlug(tag, locale);
        if (!term || filterWordPressBadgesByLocale([term], locale).length === 0) {
          return {
            title: t.levelNotFound as string,
            alternates: buildI18nAlternates(`/levels/${tag}`, locale),
          };
        }
        const prefix = (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
        const title = `${prefix} ${term.name} — ${t.siteTitle}`;
        const translationMap = buildLevelTranslationMap(term, locale);
        return {
          title,
          alternates: buildI18nAlternates(`/levels/${tag}`, locale, { translationMap }),
        };
      }
      return {};
    case "partnerships":
      return {
        title: `${t["partnerships.meta.title"]} | ${t.siteTitle}`,
        description: t["partnerships.meta.description"] as string,
        alternates: buildI18nAlternates("/partnerships", locale),
      };
    case "team":
      return generateTeamMetadata(locale);
    case "imprint":
      return {
        title: `${t["imprint.title"]} — ${t.siteTitle}`,
        alternates: buildI18nAlternates("/imprint", locale),
      };
    case "privacy":
      return {
        title: `${t["privacy.title"]} — ${t.siteTitle}`,
        alternates: buildI18nAlternates("/privacy", locale),
      };
    case "terms":
      return {
        title: `${t["terms.title"]} — ${t.siteTitle}`,
        alternates: buildI18nAlternates("/terms", locale),
      };
    case "search": {
      const sp = (await searchParams) ?? {};
      const query = new URLSearchParams();
      if (sp.q) query.set("q", sp.q);
      if (sp.after) query.set("after", sp.after);
      const suffix = query.toString();
      const path = suffix ? `/search?${suffix}` : "/search";
      return {
        title: `${t.search} — ${t.siteTitle}`,
        alternates: buildI18nAlternates(path, locale),
      };
    }
    default:
      return {};
  }
}

export async function renderMappedPage({ locale, slug, searchParams }: MapInput) {
  const [section, ...rest] = slug;

  if (section === "posts") {
    const suffix = rest.join("/");
    permanentRedirect(buildLocalizedHref(locale, suffix ? `/articles/${suffix}` : "/articles"));
  }

  switch (section) {
    case "about":
      return <AboutPage locale={locale} />;
    case "articles":
      if (rest.length === 0) return <PostsIndex locale={locale} />;
      if (rest.length === 1) {
        return renderPostPage({ params: Promise.resolve({ slug: rest[0] }), locale });
      }
      break;
    case "categories":
      if (rest.length === 0) return <CategoriesIndexContent locale={locale} />;
      if (rest.length === 1) return <CategoryPageContent category={rest[0]} locale={locale} />;
      break;
    case "levels":
    case "tags":
      if (rest.length === 0) return <LevelsIndexContent locale={locale} />;
      if (rest.length === 1) return <LevelPageContent locale={locale} tag={rest[0]} />;
      break;
    case "partnerships":
      return <PartnershipsClient contactEmail="partnerships@simple-deutsch.de" locale={locale} />;
    case "team":
      return <TeamPageContent locale={locale} />;
    case "imprint":
      return <ImprintPage locale={locale} />;
    case "privacy":
      return <PrivacyPage locale={locale} />;
    case "terms":
      return <TermsPage locale={locale} />;
    case "search":
      return (
        <SearchPageContent searchParams={searchParams ?? Promise.resolve({})} locale={locale} />
      );
    default:
      break;
  }

  notFound();
}
