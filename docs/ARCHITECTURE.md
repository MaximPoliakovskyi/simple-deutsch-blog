# Architecture Guide

This document describes the structure and import rules for the Next.js application under `web/`.

## Folder Structure

```
web/src/
├── app/              # Next.js App Router (routes + composition)
├── components/       # UI components
├── core/             # Pure business logic (no side-effects)
├── server/           # Server-side operations (fetch, cache, WP client)
├── styles/           # Global CSS
└── types/            # TypeScript type definitions
```

### app/

**Purpose**: Routing and page composition only.

- Contains Next.js routes (pages, layouts, API routes)
- **Allowed imports**: `components/**`, `server/**`, `core/**`, `styles/**`, `types/**`
- **Responsibilities**:
  - Define routes and layouts
  - Compose server/client components
  - Call server APIs and pass data to components
  - Handle metadata and SEO

**Route structure**:
- Root routes (`/posts`, `/categories`, etc.) serve English (default locale)
- `/[locale]/(site)/*` routes serve localized content (`ru`, `ua`)
- Localized pages should be **thin wrappers** that delegate to root implementations with `locale` parameter
- API routes live under `app/api/` and must only contain `route.ts` files (no `page.tsx`)

### components/

**Purpose**: UI components (server or client).

Organized by:
- `layout/` - Header, Footer, Navigation
- `ui/` - Reusable UI primitives (Pagination, ThemeToggle, SafeHTML, etc.)
- `features/` - Feature-specific components grouped by domain:
  - `posts/` - Post cards, grids, content
  - `categories/` - Category blocks, pills
  - `search/` - Search overlay, hero with filters
  - `stories/` - Success stories sliders

**Import rules**:
- ✅ Can import: `core/**`, `types/**`, other `components/**`
- ❌ **MUST NOT** import: `server/**` from client components (`"use client"`)
- Server components can import `server/**`

### core/

**Purpose**: Pure business logic with no side-effects.

- `i18n/` - Translations, locale detection, category translations
- `content/` - Content rules (hidden categories, sanitization, TOC generation)

**Import rules**:
- ✅ Can import: other `core/**`, `types/**`
- ❌ Cannot import: `server/**`, `app/**`, `components/**`
- Must be framework-agnostic (no Next.js APIs, no fetch, no DOM APIs in server context)

### server/

**Purpose**: Server-side operations (network, database, caching).

- `wp/` - WordPress GraphQL client, queries, data fetching
- `cache.ts` - Cache utilities (unstable_cache wrappers)

**Import rules**:
- ✅ Can import: `core/**`, `types/**`
- ❌ Cannot import: `components/**` (server logic should not depend on UI)
- Must run on server only (use Next.js server APIs, fetch, etc.)

### styles/

**Purpose**: Global CSS and Tailwind configuration.

- `globals.css` - Global styles, CSS variables, base layer

### types/

**Purpose**: Shared TypeScript types and declarations.

- Type definitions for external libraries
- Shared domain types

## Import Rules Summary

| From \ To      | app | components | core | server | styles | types |
|----------------|-----|------------|------|--------|--------|-------|
| **app**        | ✅  | ✅         | ✅   | ✅     | ✅     | ✅    |
| **components** | ❌  | ✅         | ✅   | ⚠️*    | ✅     | ✅    |
| **core**       | ❌  | ❌         | ✅   | ❌     | ❌     | ✅    |
| **server**     | ❌  | ❌         | ✅   | ✅     | ❌     | ✅    |

*⚠️ Server components can import `server/**`, but client components (`"use client"`) **MUST NOT**.

## Locale Routing Pattern

### Root Routes (English)
Located at `app/posts/`, `app/categories/`, etc.

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  return <PostsIndex locale="en" />;
}
```

### Localized Routes (ru, ua)
Located at `app/[locale]/(site)/posts/`, etc.

**Pattern**: Thin wrapper that validates locale and delegates to root implementation.

```tsx
// app/[locale]/(site)/posts/page.tsx
import PostsIndex from "../../../posts/PostsIndex";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedPostsPage({ params }: Props) {
  const { locale } = await params;
  
  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }

  return <PostsIndex locale={locale} />;
}
```

**Benefits**:
- Single source of truth for rendering logic
- Locale-specific metadata in wrapper
- Type-safe locale handling
- Preserves URL structure without duplication

## Adding New Features

### 1. New Server API
1. Add function to `server/wp/api.ts` or create new file under `server/`
2. Import and call from `app/` routes or server components
3. Never import `server/**` from client components

### 2. New UI Component
1. Determine category: `layout/`, `ui/`, or `features/[domain]/`
2. Create component file
3. If client-side interactivity needed, add `"use client"` directive
4. If server-side data fetching needed, keep as server component

### 3. New Route
1. Add root route under `app/[route]/page.tsx` for English
2. Add localized wrapper under `app/[locale]/(site)/[route]/page.tsx`
3. Localized wrapper validates locale and delegates to root
4. Update metadata and SEO in both places

### 4. New Core Utility
1. Add to appropriate `core/` subdirectory
2. Keep pure (no side-effects, no framework dependencies)
3. Make it framework-agnostic and testable

## Build & Validation

After any change:

```bash
npm run build          # Must succeed
npx biome check .      # Should improve or stay same
```

## Anti-Patterns

❌ **Don't** import `server/**` from client components  
❌ **Don't** put business logic in `app/` (extract to `core/` or `server/`)  
❌ **Don't** duplicate page implementations (use thin wrappers)  
❌ **Don't** put `page.tsx` files inside `app/api/` (API routes use `route.ts` only)  
❌ **Don't** mix side-effects into `core/` (move to `server/`)

## Questions?

- Check existing code for patterns
- Review this document for import rules
- Run build to validate changes
