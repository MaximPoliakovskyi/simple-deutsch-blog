# Legacy Elimination Pass — Final Report

## Summary

Second-phase migration of the Simple Deutsch Blog codebase. The `src/app/[locale]/` tree
is now the single source of truth for all UI components. All legacy layers that duplicated
functionality have been eliminated.

---

## What Was Eliminated

### Entire Folders Deleted

| Folder | Reason |
|--------|--------|
| `src/components/` | All components migrated inline to `_components/`; folder was 100 % dead code after shim replacement |
| `src/features/` | Dead code after migration to `[locale]/**` pages |
| `src/shared/` | Dead code after migration |
| `src/core/` | Dead code — except `core/api/fetching.ts`, which was moved to `server/wp/fetching.ts` (see below) |
| `src/i18n/` | Replaced by `src/lib/i18n.ts` |
| `src/content/` | Dead code after migration |
| `src/hooks/` | Dead code after migration |

**Total files removed:** all files under the 7 trees above.

---

## What Was Moved / Inlined

### `_components/` shims → full implementations

Four files in `src/app/[locale]/_components/` were previously thin re-export shims pointing
back at the now-deleted `src/components/` folder. They have been replaced with the full
implementation:

| File | Before | After |
|------|--------|-------|
| `transition-nav.ts` | re-export shim → `@/components/transition/useTransitionNav` | Full `useTransitionNav` + `TransitionNavContext` + `isUnmodifiedLeftClick` implementation |
| `route-transition-provider.tsx` | re-export shim → `@/components/transition/RouteTransitionProvider` | Full `RouteTransitionProvider` (~300 lines) with internal import updated to `./transition-nav` |
| `initial-preloader.tsx` | re-export shim → `@/components/ui/InitialPreloader` | Full `InitialPreloader` implementation; internal import updated to `./preloader-client` |
| `typewriter-words.tsx` | re-export shim → `@/components/ui/TypewriterWords` | Full `TypewriterWords` implementation |

### New file created

| File | Origin |
|------|--------|
| `src/app/[locale]/_components/preloader-client.tsx` | Moved from `src/components/ui/PreloaderClient.tsx` |

### `core/api/fetching.ts` → `server/wp/fetching.ts`

`src/core/api/fetching.ts` was the only file in the `core/` tree still needed at runtime (it
provides the `fetchGraphQL` / `CachePolicy` implementation used by the entire WP GraphQL
layer). It was moved to `src/server/wp/fetching.ts` so the `server/` package stays
self-contained. The internal `@/i18n/locale` import was updated to `@/lib/i18n`.

---

## What Was Thinned (site) → [locale] delegation

All `(site)/` legal pages previously contained full inline implementations. They now
delegate to their `[locale]/` counterparts, making `(site)/` a pure locale-default
wrapper:

| File | Change |
|------|--------|
| `(site)/imprint/page.tsx` | ~60-line inline implementation → thin `<ImprintPage locale={DEFAULT_LOCALE} />` |
| `(site)/privacy/page.tsx` | ~90-line inline implementation → thin `<PrivacyPage locale={DEFAULT_LOCALE} />` |
| `(site)/terms/page.tsx` | ~90-line inline implementation → thin `<TermsPage locale={DEFAULT_LOCALE} />` |

---

## What Was Kept (and Why)

| Path | Why Kept |
|------|----------|
| `src/server/wp/**` | WordPress GraphQL API layer — still needed behind `src/lib/posts.ts` |
| `src/server/cache.ts` | `CACHE_TAGS` is consumed by both `server/wp/categories.ts` and `app/api/revalidate/route.ts` |
| `src/lib/scrollLock.ts` | Used by `_components/header.tsx`, `_components/search-overlay.tsx`, `_components/preloader-client.tsx`, `_components/route-transition-provider.tsx` |
| `src/lib/initial-load-gate.ts` | Used by `_components/initial-preloader.tsx` |
| `src/lib/posts.ts` | Public facade over `server/wp/**` consumed by all page files |
| `src/lib/i18n.ts`, `src/lib/i18n-provider.tsx`, `src/lib/seo.ts`, `src/lib/theme-client.ts` | Active runtime dependencies |

---

## Import Fixes

All broken `@/i18n/locale` and `@/core/api/fetching` imports in `src/server/wp/**`
were updated:

| Old import | New import |
|------------|------------|
| `@/i18n/locale` | `@/lib/i18n` |
| `@/core/api/fetching` | `./fetching` |

Affected files: `fetching.ts`, `client.ts`, `types.ts`, `categories.ts`, `polylang.ts`,
`posts.ts`, `readingTime.ts`, `search.ts`.

---

## Validation Results

### Lint (Biome)
```
Checked 145 files in 92ms. No fixes applied.
```
Zero errors. Zero warnings. (The two `noDocumentCookie` warnings in `language-dropdown.tsx`
were pre-existing and suppressed with `biome-ignore` comments since the direct
`document.cookie` assignment is intentional for locale persistence.)

### TypeScript
```
tsc --noEmit
(exit 0 — no output)
```
Zero errors.

### Production Build (Next.js 16 Turbopack)
```
✓ Compiled successfully in 3.6s
✓ Finished TypeScript in 3.2s
✓ Generating static pages (22/22)
```
All 42 routes compiled successfully.

### Runtime Verification (dev server)

| Route | Status |
|-------|--------|
| `/` | 200 |
| `/about` | 200 |
| `/posts` | 200 |
| `/categories` | 200 |
| `/levels` | 200 |
| `/search` | 200 |
| `/imprint` | 200 |
| `/privacy` | 200 |
| `/terms` | 200 |
| `/start` | 200 |
| `/blog` | 200 |
| `/rss.xml` | 200 |
| `/en` | 200 |
| `/en/about` | 200 |
| `/en/posts` | 200 |
| `/en/categories` | 200 |
| `/en/levels` | 200 |
| `/en/search` | 200 |
| `/en/partnerships` | 200 |
| `/en/team` | 200 |
| `/en/imprint` | 200 |
| `/en/privacy` | 200 |
| `/en/terms` | 200 |
| `/en/start` | 200 |
| `/api/posts` | 200 |

All 25 checked routes → HTTP 200.

---

## Final Source Tree (active paths)

```
src/
  app/
    layout.tsx                    — root layout
    error.tsx / global-error.tsx / not-found.tsx
    (site)/                       — default-locale (DE) thin wrappers
      layout.tsx                  — thin: delegates to [locale] _components
      page.tsx                    — thin: delegates to [locale]/home-page
      about/page.tsx
      blog/page.tsx
      categories/…
      imprint/page.tsx            — thin: <ImprintPage locale={DEFAULT_LOCALE} />
      levels/…
      partnerships/…
      posts/…
      privacy/page.tsx            — thin: <PrivacyPage locale={DEFAULT_LOCALE} />
      search/…
      start/…
      tags/…
      terms/page.tsx              — thin: <TermsPage locale={DEFAULT_LOCALE} />
    [locale]/                     — full locale-aware implementations (EN/RU/UK)
      layout.tsx
      page.tsx / home-page.tsx
      _components/                — ALL UI components (single source of truth)
        app-fade-wrapper.tsx
        back-button.tsx
        deferred-chrome-extras.tsx
        first-visit-disclaimer.tsx
        header.tsx
        initial-preloader.tsx     ← inlined (was shim)
        language-dropdown.tsx
        nav-config.ts
        navigation-desktop.tsx
        navigation-mobile.tsx
        preloader-client.tsx      ← new (moved from src/components)
        providers.tsx
        route-ready.tsx
        route-transition-provider.tsx  ← inlined (was shim)
        search-overlay.tsx
        status-page.tsx
        transition-nav.ts         ← inlined (was shim)
        typewriter-words.tsx      ← inlined (was shim)
      about/…  categories/…  imprint/…  levels/…  partnerships/…
      posts/…  privacy/…  search/…  start/…  tags/…  team/…  terms/…
    api/
      posts/  revalidate/  search/
    rss.xml/
  lib/
    i18n.ts  i18n-provider.tsx  initial-load-gate.ts
    posts.ts  scrollLock.ts  seo.ts  theme-client.ts
    content/
  server/
    cache.ts
    wp/
      fetching.ts    ← new home (moved from src/core/api/fetching.ts)
      client.ts  types.ts  categories.ts  tags.ts
      polylang.ts  posts.ts  readingTime.ts  search.ts  index.ts
  styles/
    design-system.css  globals.css  route-transition.css
  proxy.ts
```

No legacy layer aliases (`@/features`, `@/shared`, `@/core`, `@/i18n`, `@/content`,
`@/components`, `@/hooks`) exist in the codebase any longer.
