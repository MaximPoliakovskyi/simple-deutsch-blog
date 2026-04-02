/**
 * PageSkeleton — the universal page-level loading placeholder.
 *
 * Used as the Suspense fallback in app/[locale]/loading.tsx.
 * Background colors and animation are handled entirely by the .sd-skeleton
 * CSS class (globals.css). No Tailwind bg- utilities are used here because
 * the animation keyframe targets background-color directly — mixing in a
 * Tailwind bg- class would create a cascade conflict.
 */

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`sd-skeleton rounded-[var(--radius)] ${className}`} />;
}

export default function PageSkeleton() {
  return (
    <output aria-label="Loading page" className="mx-auto max-w-7xl px-4 py-10 md:py-14 block">
      <span className="sr-only">Loading…</span>

      {/* Heading block */}
      <SkeletonBlock className="h-9 w-2/5 max-w-xs" />
      {/* Subtitle / description */}
      <SkeletonBlock className="mt-4 h-5 w-3/5 max-w-sm" />

      {/* First body paragraph */}
      <div className="mt-10 space-y-3">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>

      {/* Second body paragraph */}
      <div className="mt-6 space-y-3">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/5" />
      </div>
    </output>
  );
}
