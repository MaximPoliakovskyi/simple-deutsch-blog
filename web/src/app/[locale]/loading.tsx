/**
 * Shown by Next.js as the Suspense boundary fallback while a new [locale]
 * page is fetching data. Must never be empty - an empty return causes a
 * visible blank screen for all standard <Link> navigations that do not go
 * through the custom route-transition overlay.
 */
export default function Loading() {
  return (
    <div className="sd-container py-10 min-h-[60vh]" aria-hidden="true">
      {/* Page heading */}
      <div
        className="sd-shimmer mb-3 h-9 w-1/2 rounded-xl bg-[color-mix(in_srgb,var(--sd-surface-elevated)_80%,transparent)]"
      />
      <div
        className="sd-shimmer mb-10 h-4 w-1/3 rounded-lg bg-[color-mix(in_srgb,var(--sd-surface-elevated)_60%,transparent)]"
      />
      {/* Body lines */}
      {(["line-full", "line-95", "line-80", "line-full-2", "line-70"] as const).map((key, i) => (
        <div
          key={key}
          className="sd-shimmer mb-3 h-4 rounded-lg bg-[color-mix(in_srgb,var(--sd-surface-elevated)_60%,transparent)]"
          style={{ width: `${[100, 95, 80, 100, 70][i]}%` }}
        />
      ))}
      {/* Card row */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="sd-shimmer h-48 rounded-2xl bg-[color-mix(in_srgb,var(--sd-surface-elevated)_70%,transparent)]"
          />
        ))}
      </div>
    </div>
  );
}
