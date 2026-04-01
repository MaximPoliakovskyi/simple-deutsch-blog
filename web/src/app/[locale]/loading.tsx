/**
 * Suspense fallback for the [locale] route segment.
 *
 * Returns null intentionally.
 *
 * For <Link> navigation Next.js wraps router.push() in React's
 * startTransition. React's deferred Suspense behavior keeps the
 * previously-resolved Suspense boundary content (old page) visible until
 * the new RSC payload is fully committed — so this fallback is never
 * shown during client-side navigation between same-locale routes.
 *
 * A null fallback rather than a skeleton means: if React's deferred behavior
 * is somehow bypassed (cache miss on a first visit, hard reload, or
 * programmatic navigation outside startTransition) the screen will be blank
 * momentarily rather than jank to a skeleton. The shell (header, footer,
 * background) painted by the locale layout remains visible throughout.
 *
 * To confirm when this fallback is actually rendered at runtime, set
 * NEXT_PUBLIC_DEBUG_ROUTE_TRANSITION=1 and watch the console for a
 * "[loading.tsx] mounted" message from LoadingDebug.
 */
export default function Loading() {
  return null;
}
