export type SiteLang = "en" | "ru" | "ua";

/**
 * Build a localized href that reproduces the Navigation's language-switch
 * behavior: for post pages the slug encodes the article id as `{lang}-{id}`;
 * for non-post pages preserve the path and swap/insert the locale prefix.
 */
export function buildLocalizedHref(target: SiteLang, pathname: string | null | undefined): string {
  const p = pathname || "/";
  const parts = p.split("/").filter(Boolean);

  // detect leading locale prefix (/ru or /ua)
  const hasLangPrefix = parts[0] === "ru" || parts[0] === "ua";

  // detect post pages: either /posts/{slug} or /{lang}/posts/{slug}
  let isPost = false;
  let slug: string | null = null;

  if (hasLangPrefix) {
    if (parts[1] === "posts") {
      isPost = true;
      slug = parts[2] ?? null;
    }
  } else {
    if (parts[0] === "posts") {
      isPost = true;
      slug = parts[1] ?? null;
    }
  }

  if (isPost && slug) {
    const sub = slug.split("-");
    if (sub.length >= 2) {
      const articleId = sub.slice(1).join("-");
      const newSlug = `${target}-${articleId}`;
      return target === "en" ? `/posts/${newSlug}` : `/${target}/posts/${newSlug}`;
    }
    // fallback: build a post path without article id transformation
    return target === "en" ? `/posts/${slug}` : `/${target}/posts/${slug}`;
  }

  // Non-post pages: strip existing locale prefix and prefix with target (unless en)
  const stripped = p.replace(/^\/(ru|ua)(?=\/|$)/, "") || "/";
  return target === "en" ? stripped : stripped === "/" ? `/${target}` : `/${target}${stripped}`;
}
