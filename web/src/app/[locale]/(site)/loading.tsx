/**
 * Suspense fallback for the [locale] route segment.
 *
 * This single file covers every route in the app:
 *   /[locale]                   — home
 *   /[locale]/about             — about page
 *   /[locale]/team              — team page
 *   /[locale]/partnerships      — partnerships page
 *   /[locale]/posts             — posts index
 *   /[locale]/posts/[slug]      — individual post
 *   /[locale]/categories        — categories index
 *   /[locale]/categories/[cat]  — category page
 *   /[locale]/levels            — levels index
 *   /[locale]/levels/[level]    — level page
 *   /[locale]/search            — search page
 *   /[locale]/imprint           — imprint
 *   /[locale]/privacy           — privacy
 *   /[locale]/terms             — terms
 *   …and all locale prefixes (en, de, ru, uk)
 *
 * For <Link> navigation React's startTransition keeps the old page visible
 * until the RSC payload commits, so this fallback is typically only shown on:
 *   - First hard load / cache miss for a route
 *   - Refresh
 *   - Programmatic navigation outside startTransition
 *
 */
import PageSkeleton from "@/components/page-skeleton";

export default function Loading() {
  return <PageSkeleton />;
}
