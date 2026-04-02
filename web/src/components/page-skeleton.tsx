/**
 * PageSkeleton — the universal page-level loading placeholder.
 *
 * Used as the Suspense fallback in app/[locale]/loading.tsx, which covers
 * every route the site has:  /about, /team, /partnerships, /posts/*, /levels/*,
 * /categories/*, /search, /imprint, /privacy, /terms, locale-prefixed variants
 * and the home page.
 *
 * Design principles:
 * - Generic enough to work for any page type (no per-page shape)
 * - Uses the site's existing .sd-shimmer class and CSS design tokens
 * - Animation timing is driven by globals.css (sd-shimmer 1.8s linear infinite)
 * - Respects prefers-reduced-motion via the @media rule in globals.css
 * - Header/footer are already visible (rendered outside the Suspense boundary
 *   by [locale]/layout.tsx) — this only fills the <main> content area
 */

function ShimmerBlock({ className }: { className: string }) {
  return (
    <div
      className={`sd-shimmer rounded-[var(--radius)] bg-neutral-200 dark:bg-neutral-700/60 ${className}`}
    />
  );
}

export default function PageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto max-w-7xl px-4 py-10 md:py-14"
    >
      <span className="sr-only">Loading…</span>

      {/* Heading block */}
      <ShimmerBlock className="h-9 w-2/5 max-w-xs" />
      {/* Subtitle / description */}
      <ShimmerBlock className="mt-4 h-5 w-3/5 max-w-sm" />

      {/* First body paragraph */}
      <div className="mt-10 space-y-3">
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-4/5" />
      </div>

      {/* Second body paragraph */}
      <div className="mt-6 space-y-3">
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-3/5" />
      </div>
    </div>
  );
}
