# Project Plan — Modern Minimal Headless Blog (2025 Edition: Next.js 15 + Tailwind CSS v4 + WordPress)

Updated for 2025 technology stack changes:
- Next.js 15 (App Router default, React Server Components, Partial Prerendering, enhanced caching semantics)
- Tailwind CSS v4 (config simplification, design tokens via CSS variables, zero-runtime utilities)
- Node.js 20 LTS (or 22 when it becomes LTS)
- WordPress 6.6+ (as headless CMS with WPGraphQL ≥1.24+)
- Modern tooling additions: stricter TypeScript, biome or ESLint+Prettier, image optimization improvements, optional content security, testing additions

Goal
- Build a modern, minimal, fast, maintainable blog.
- Content managed in WordPress (headless only—no theming).
- Frontend built with Next.js App Router + Tailwind v4 + TypeScript.
- Mobile-first, accessible, performant (Core Web Vitals AA).
- Hosted on Vercel; domain & optional WP hosting via Hostinger (or WP Engine/Kinsta if scalability needed).
- Clean separation: editors live in WordPress, devs iterate in Next.js.

How to use this file
- This file is the source of truth for tasks.
- Create one GitHub Issue per task (use the template below).
- Open a new Copilot chat per issue for focused implementation help.
- Phases unlock progressively; follow prerequisites.

Key 2025 Architectural Notes (What Changed vs Older Guides)
- Use the App Router (`/app`) instead of legacy `/pages`.
- Prefer **React Server Components** for data-fetch-heavy UI; limit client components to interactivity.
- Use **Next.js `fetch` caching** + `revalidate` for incremental regeneration instead of manually wiring ISR functions.
- Tailwind v4 reduces config boilerplate; leverages CSS variables and `@utility` layers—keep config minimal.
- Leverage **Partial Prerendering (PPR)** for large pages (home feed + dynamic slots).
- Prefer `next/image` with `fill`/`sizes` and AVIF/WebP fallback; remote patterns defined in `next.config.mjs`.
- Use the new **`Metadata` API** (`export const metadata` / dynamic `generateMetadata`) for SEO.
- Consider **Edge Runtime** for lightweight routes (RSS, API preview) if no Node-only deps.
- Testing is more mainstream: add unit (Vitest), integration (Playwright), and a11y (axe) tasks.
- Stronger security posture: add CSP, headers, and content sanitization library (e.g., `dompurify` with `isomorphic-dompurify` if needed).
- WordPress block (Gutenberg) content often returns HTML; plan for safe rendering + styling prose via Tailwind `prose` (typography plugin v4 variant).

High-Level Architecture
- WordPress (headless):
  - WPGraphQL + (optional) WPGraphiQL IDE plugin.
  - SEO plugin (Yoast or Rank Math) + GraphQL exposure.
  - Media library; optionally Jetpack or an image CDN (but `next/image` remote loader is primary).
- Next.js Frontend:
  - App Router with route structure: `/app/(public)/(blog)/page.tsx`, `/app/(public)/posts/[slug]/page.tsx`, `/app/(public)/tags/[tag]/page.tsx`.
  - Server Components for data fetching; isolated client components for search, pagination triggers, theme switcher (optional).
  - Data layer abstraction: `/src/lib/wp/` (queries + fetch wrapper).
- Styling: Tailwind v4 + PostCSS; minimal design tokens (CSS variables in `:root`).
- Deployment: Vercel (preview + production). WP on Hostinger or managed WP host.
- Observability: Vercel Analytics + optional third-party (Plausible/Fathom).
- Performance: Optimize fonts via `next/font`, use image placeholders (`blur`), caching strategy per route.

Labels (suggested)
- setup, cms, frontend, styling, deploy, seo, perf, docs, extras, testing, security, accessibility, i18n, easy, medium, hard

Branching Suggestions
- main — production
- develop (optional integration)
- feature/<kebab-task-name>
- chore/<maintenance>
- fix/<bug-short-name>

Recommended Repository Structure (2025)
- /app
  - layout.tsx
  - page.tsx (home feed)
  - posts/
    - [slug]/page.tsx
  - tags/
    - [tag]/page.tsx
  - api/
    - preview/route.ts (Next.js preview mode)
    - rss/route.ts (RSS XML generation)
- /src
  - /components
    - Header.tsx
    - Footer.tsx
    - PostCard.tsx
    - PostContent.tsx
    - SearchBox.tsx
    - Pagination.tsx
    - SEO.tsx (wrapper for dynamic metadata helpers if needed)
  - /lib
    - wp/
      - client.ts (fetch wrapper)
      - queries.ts
      - api.ts (higher-level functions)
    - seo.ts
    - markdown/ (if adding MDX later)
  - /styles
    - globals.css
    - tailwind.css (entry if split)
- /public
  - favicon.ico
  - og-image-base.png
- tailwind.config.ts
- postcss.config.mjs
- next.config.mjs
- tsconfig.json
- .env.example
- .eslintrc.cjs (or biome.json if using Biome)
- vitest.config.ts (if using Vitest)
- playwright.config.ts (optional)
- project-plan-ai-compilation.md
- README.md
- CONTRIBUTING.md
- SECURITY.md (optional)
- LICENSE

Task Phases (Updated)

PHASE 0 — Preparation & Tooling
0.1. Create repository & baseline docs
- Description: Initialize Git repo, add README, project-plan-ai-compilation.md (this file), LICENSE (MIT or your choice).
- Acceptance: Repo has initial docs & conventional commit note (optional).
- Time: 15–30 min
- Labels: setup, docs, easy

0.2. Install local dev tools (Node 20/22 LTS, Git, VS Code, extensions)
- Description: Verify Node LTS, add VS Code extensions (Tailwind CSS IntelliSense v4-ready, ESLint/Biome).
- Acceptance: `node -v` and `git --version` succeed.
- Time: 30–60 min
- Labels: setup, easy

0.3. Decide linting/formatting stack (ESLint + Prettier OR Biome)
- Description: If preferring newer unified tool, adopt Biome; otherwise set ESLint + Prettier.
- Acceptance: Running `npm run lint` shows no errors on scaffold.
- Time: 30–60 min
- Labels: setup, medium

0.4. Security & compliance placeholders
- Description: Create empty SECURITY.md & set up Dependabot (GitHub config).
- Acceptance: SECURITY.md + `.github/dependabot.yml`.
- Time: 20–30 min
- Labels: security, docs, easy

PHASE 1 — WordPress (Headless CMS)
1.1. Provision WordPress instance
- Description: Deploy WordPress (Hostinger / WP Engine / Kinsta). Secure admin (strong password, 2FA if plugin).
- Acceptance: Admin dashboard reachable.
- Time: 20–60 min
- Labels: cms, easy

1.2. Install & configure WPGraphQL (≥1.24)
- Description: Install WPGraphQL, enable GraphiQL IDE, confirm schema introspection.
- Acceptance: `https://yoursite.com/graphql` responds with schema.
- Time: 15–30 min
- Prerequisites: 1.1
- Labels: cms, medium

1.3. Install SEO plugin + expose meta
- Description: Yoast or Rank Math; ensure SEO fields appear in GraphQL (may need WPGraphQL for Yoast).
- Acceptance: Sample post returns SEO title/description fields via GraphQL.
- Time: 20–40 min
- Prerequisites: 1.2
- Labels: cms, seo, medium

1.4. Define content model conventions
- Description: Decide required fields: title, slug, excerpt, featuredImage, content (HTML), categories, tags, SEO, date, author.
- Acceptance: Documented in README or `/docs/content-model.md`.
- Time: 30–45 min
- Prerequisites: 1.2
- Labels: cms, docs, easy

1.5. Media optimization policy
- Description: Document recommended upload sizes, naming conventions, alt text guidelines; check WP image sizes.
- Acceptance: Guidelines file created.
- Time: 20–30 min
- Prerequisites: 1.1
- Labels: cms, accessibility, docs, easy

PHASE 2 — Next.js Project Setup (App Router + TS + Tailwind v4)
2.1. Initialize Next.js 15 (TypeScript, App Router)
- Description: `npx create-next-app@latest --ts` (verify version). Remove unused boilerplate.
- Acceptance: `npm run dev` serves base app.
- Time: 10–20 min
- Labels: frontend, setup, easy
- Prerequisites: 0.x

2.2. Add Tailwind CSS v4
- Description: Install Tailwind v4 + PostCSS config; minimal `tailwind.config.ts`.
- Acceptance: Utilities work; global styles loaded.
- Time: 20–30 min
- Prerequisites: 2.1
- Labels: styling, setup, easy

2.3. Configure TypeScript strict mode & path aliases
- Description: Enable `"strict": true`, add `@/*` alias to `src`.
- Acceptance: No TS errors in scaffold.
- Time: 20–40 min
- Prerequisites: 2.1
- Labels: frontend, setup, medium

2.4. Lint/format integration (ESLint or Biome)
- Description: Add scripts: `lint`, `format`, CI check.
- Acceptance: CI-ready script passes locally.
- Time: 30–45 min
- Prerequisites: 0.3
- Labels: setup, medium

2.5. Environment variable scaffolding
- Description: Add `.env.example` with `WP_GRAPHQL_URL`, `NEXT_PUBLIC_SITE_URL`.
- Acceptance: README documents variable usage.
- Time: 15–20 min
- Prerequisites: 2.1
- Labels: setup, docs, easy

PHASE 3 — Data Layer & Fetch Utilities
3.1. GraphQL fetch wrapper (no heavy Apollo unless needed)
- Description: Implement lightweight `fetchGraphQL(query, variables)` using native `fetch` with proper caching headers.
- Acceptance: Test query returns site title.
- Time: 30–60 min
- Prerequisites: 1.2, 2.1
- Labels: frontend, medium

3.2. Define core queries (list posts, single post by slug, tags, categories)
- Description: Add `queries.ts` and strongly typed response types.
- Acceptance: Type-safe functions in `api.ts` (e.g., `getAllPosts({ first, after })`).
- Time: 60–90 min
- Prerequisites: 3.1
- Labels: frontend, medium

3.3. Add pagination support (cursor-based)
- Description: Implement GraphQL pagination fields (endCursor, hasNextPage).
- Acceptance: Function returns pagination metadata.
- Time: 45–75 min
- Prerequisites: 3.2
- Labels: frontend, medium

3.4. Introduce cache strategy
- Description: Use `fetch` options (`cache: 'force-cache'` + `revalidate`) or dynamic for search; document strategy.
- Acceptance: README section “Caching Strategy” added.
- Time: 30–45 min
- Prerequisites: 3.1
- Labels: perf, docs, medium

3.5. Content sanitization
- Description: Add `isomorphic-dompurify` for HTML fallback sanitization (server + client).
- Acceptance: Rendering pipeline sanitizes HTML where needed.
- Time: 30–60 min
- Prerequisites: 3.2
- Labels: security, frontend, medium

PHASE 4 — Core Pages & Components (Server-first)
4.1. Home feed (server component)
- Description: List latest posts with title, excerpt, date, featured image (optimized).
- Acceptance: `/` renders posts at build with revalidate interval.
- Time: 2–4 hours
- Prerequisites: 3.2
- Labels: frontend, medium

4.2. Post detail page
- Description: Renders sanitized HTML content, meta (date, author, categories), dynamic metadata export.
- Acceptance: `/posts/<slug>` loads from GraphQL; 404 on missing slug.
- Time: 2–4 hours
- Prerequisites: 4.1, 3.5
- Labels: frontend, medium

4.3. Tag & category listing pages
- Description: Route segments `/tags/[tag]` and `/categories/[category]`.
- Acceptance: Filtered posts display; invalid tag returns 404.
- Time: 1–3 hours
- Prerequisites: 3.2
- Labels: frontend, medium

4.4. Pagination (load more or numbered)
- Description: Implement either infinite scroll (client component) or server-side page param.
- Acceptance: Older posts reachable; no duplicate fetch.
- Time: 2–4 hours
- Prerequisites: 3.3, 4.1
- Labels: frontend, medium

4.5. Search (server or hybrid)
- Description: Simple search using GraphQL filter or a WP search endpoint; consider debounced client component.
- Acceptance: Results update on query; empty state defined.
- Time: 2–5 hours
- Prerequisites: 3.2
- Labels: frontend, medium

4.6. RSS feed route
- Description: `/api/rss` or `/rss.xml` via route handler streaming XML.
- Acceptance: Feed validates (feedvalidator.org).
- Time: 1–2 hours
- Prerequisites: 3.2
- Labels: extras, easy

4.7. Error & not-found states
- Description: Implement `not-found.tsx` and error boundary `error.tsx`.
- Acceptance: Friendly 404 and error fallback.
- Time: 30–45 min
- Prerequisites: 2.1
- Labels: frontend, easy

PHASE 5 — Styling, Design System, UX
5.1. Tailwind v4 design tokens
- Description: Set CSS variables (:root) for colors, radius, spacing; map in tailwind config.
- Acceptance: Consistent token usage in components.
- Time: 1–2 hours
- Prerequisites: 2.2
- Labels: styling, medium

5.2. Typography & rich content styling
- Description: Add Tailwind Typography plugin (v4 compatible) or custom prose classes.
- Acceptance: Post content readable & responsive.
- Time: 1–2 hours
- Prerequisites: 4.2
- Labels: styling, medium

5.3. Responsive navigation & layout
- Description: Mobile nav (hamburger or minimal), sticky header optional.
- Acceptance: Lighthouse mobile layout good.
- Time: 2–4 hours
- Prerequisites: 4.1
- Labels: styling, frontend, medium

5.4. Accessibility baseline
- Description: Semantic landmarks, aria labels where needed, alt text enforcement.
- Acceptance: Automated axe scan shows no critical issues.
- Time: 2–4 hours
- Prerequisites: 5.2
- Labels: accessibility, medium

5.5. Dark mode (optional)
- Description: Use `class` strategy via Tailwind + system preference fallback.
- Acceptance: Toggle persists (localStorage or cookie).
- Time: 1–2 hours
- Prerequisites: 5.1
- Labels: styling, extras, easy

PHASE 6 — Performance & SEO (Modern APIs)
6.1. Image optimization & remote patterns
- Description: Configure `next.config.mjs` for WP media domain; use `priority` selectively.
- Acceptance: No layout shift; WebP/AVIF in network panel.
- Time: 2–4 hours
- Prerequisites: 4.1
- Labels: perf, medium

6.2. Metadata & Open Graph
- Description: Use `generateMetadata` in route segments; dynamic OG image (optional).
- Acceptance: Meta preview correct in debugger tools.
- Time: 1–3 hours
- Prerequisites: 4.2
- Labels: seo, easy

6.3. Structured data (JSON-LD)
- Description: Add Article schema for posts; Site/Organization schema globally.
- Acceptance: Rich results test passes.
- Time: 1–2 hours
- Prerequisites: 4.2
- Labels: seo, medium

6.4. Performance auditing
- Description: Run Lighthouse & WebPageTest; optimize fonts via `next/font`.
- Acceptance: Core Web Vitals green locally (Simulated).
- Time: 2–4 hours
- Prerequisites: 6.1
- Labels: perf, medium

6.5. Caching & partial prerender evaluation
- Description: Evaluate enabling Partial Prerendering on home (if large feed) and dynamic segments.
- Acceptance: Document decision; settings applied.
- Time: 1–2 hours
- Prerequisites: 4.1
- Labels: perf, docs, medium

PHASE 7 — Testing & Quality
7.1. Unit tests (Vitest)
- Description: Add tests for utility functions (queries shaping).
- Acceptance: `npm run test` passes in CI.
- Time: 1–2 hours
- Prerequisites: 3.x
- Labels: testing, medium

7.2. Component tests (React Testing Library)
- Description: Test PostCard, pagination logic.
- Acceptance: Coverage for key components.
- Time: 1–3 hours
- Prerequisites: 7.1
- Labels: testing, medium

7.3. E2E tests (Playwright)
- Description: Add flows: home load, navigate to post, search.
- Acceptance: CI run green.
- Time: 2–4 hours
- Prerequisites: 4.x
- Labels: testing, hard

7.4. Accessibility automated checks
- Description: Integrate axe in tests or Playwright accessibility assertions.
- Acceptance: Playwright run flags 0 serious issues.
- Time: 1–2 hours
- Prerequisites: 5.4
- Labels: accessibility, testing, medium

PHASE 8 — Deployment, Observability & Analytics
8.1. Vercel deployment baseline
- Description: Connect repo, add env vars, configure build.
- Acceptance: Production + preview deployments functional.
- Time: 15–30 min
- Prerequisites: 2.1
- Labels: deploy, easy

8.2. Custom domain & DNS
- Description: Point Hostinger DNS to Vercel; configure apex + www redirect.
- Acceptance: HTTPS domain resolves.
- Time: 20–60 min
- Prerequisites: 8.1
- Labels: deploy, medium

8.3. Analytics & logging
- Description: Enable Vercel Analytics + optional Plausible script (defer).
- Acceptance: Events visible.
- Time: 30–45 min
- Prerequisites: 8.1
- Labels: extras, easy

8.4. Monitoring & error tracking
- Description: Integrate Sentry or similar (server + edge capture).
- Acceptance: Test error appears in dashboard.
- Time: 1–2 hours
- Prerequisites: 4.2
- Labels: extras, medium

PHASE 9 — Security, Preview & Extras
9.1. Preview mode integration
- Description: WordPress preview links trigger Next.js preview; secure with token.
- Acceptance: Draft post viewable via preview URL only.
- Time: 2–4 hours
- Prerequisites: 4.2
- Labels: cms, hard

9.2. Comments (optional)
- Description: Add Giscus (GitHub Discussions) or hosted solution; SSR-friendly fallback.
- Acceptance: Comments load without blocking TTFB.
- Time: 1–3 hours
- Prerequisites: 4.2
- Labels: extras, medium

9.3. Newsletter subscription
- Description: Email capture (Resend, Mailchimp, Buttondown).
- Acceptance: Submissions stored successfully.
- Time: 1–2 hours
- Prerequisites: 4.1
- Labels: extras, easy

9.4. Security headers & CSP
- Description: Add `next.config.mjs` headers: CSP (script-src allowlist), X-Frame-Options, Referrer-Policy.
- Acceptance: Headers present (checked via response inspector).
- Time: 1–2 hours
- Prerequisites: 4.x
- Labels: security, medium

9.5. Backup & WordPress security plan
- Description: Auto backups schedule + plugin updates policy + user roles minimization.
- Acceptance: Documented in `/docs/wp-security.md`.
- Time: 1–2 hours
- Prerequisites: 1.x
- Labels: cms, security, medium

PHASE 10 — Documentation & Maintenance
10.1. CONTRIBUTING.md & workflow docs
- Description: Git branching, PR template, commit guidelines (Conventional).
- Acceptance: Contributors onboard quickly.
- Time: 30–60 min
- Labels: docs, easy

10.2. Maintenance checklist & release cadence
- Description: Document monthly tasks: dependency updates, Lighthouse audit, WP plugin updates.
- Acceptance: `/docs/maintenance.md` exists.
- Time: 30–45 min
- Labels: docs, easy

10.3. Changelog automation
- Description: Use GitHub Action to build CHANGELOG from conventional commits.
- Acceptance: CHANGELOG.md updates on release.
- Time: 45–75 min
- Labels: docs, medium

PHASE 11 — Multilanguage Support (EN / UK / RU)
Overview: Add full internationalization across WordPress content and frontend UI. Locales: English (`en`) default, Ukrainian (`uk`), Russian (`ru`). Use Polylang or WPML with WPGraphQL extensions. In Next.js, configure `i18n` in `next.config.mjs`, adopt `next-intl` for UI strings, add localized routing, language switcher, hreflang, localized feeds, and test coverage.

11.1. Evaluate multilingual plugin (Polylang vs WPML)
- Description: Compare Polylang + WPGraphQL for Polylang vs WPML + WPGraphQL for WPML (licensing, performance, GraphQL field shape). Decide and document choice.
- Acceptance: Decision documented in `/docs/i18n-plugin-decision.md` with pros/cons & chosen plugin installed.
- Time: 45–60 min
- Prerequisites: 1.1, 1.2
- Labels: cms, i18n, docs, medium

11.2. Configure languages in WordPress
- Description: Add locales EN (default), UK, RU. Enable translation of posts, categories, tags, SEO fields. Create one sample post per locale.
- Acceptance: WP admin shows 3 locales; sample localized posts exist & accessible via GraphQL.
- Time: 45–90 min
- Prerequisites: 11.1
- Labels: cms, i18n, easy

11.3. GraphQL schema & queries adaptation for language
- Description: Adjust queries to accept a `language` argument or include translation unions; extend `queries.ts` with language-aware variants (`getPostBySlug(slug, lang)`).
- Acceptance: Data layer functions return correct localized content; fallback logic documented.
- Time: 60–90 min
- Prerequisites: 11.2, 3.2
- Labels: frontend, cms, i18n, medium

11.4. Localized taxonomy & SEO metadata mapping
- Description: Ensure categories/tags & SEO fields render per language; map translation IDs to slugs.
- Acceptance: Category & tag pages resolve localized slugs; SEO fields present.
- Time: 45–75 min
- Prerequisites: 11.3
- Labels: cms, seo, i18n, medium

11.5. Next.js i18n routing configuration
- Description: Update `next.config.mjs` with `i18n` locales; introduce locale segment: `/app/[locale]/(public)/...`. Maintain redirect from root `/` to `/en` (or serve default). Adjust middleware if needed for locale detection (Accept-Language).
- Acceptance: Navigating `/en`, `/uk`, `/ru` loads localized home; non-supported locale 404 or redirected.
- Time: 60–120 min
- Prerequisites: 2.1, 4.1
- Labels: frontend, i18n, medium

11.6. Integrate `next-intl` provider
- Description: Add `next-intl` with per-locale messages JSON under `/src/messages/<locale>.json`. Wrap root layout with provider. Implement dynamic import of dictionaries (RSC-friendly).
- Acceptance: UI strings translate (nav, footer, search placeholder).
- Time: 45–75 min
- Prerequisites: 11.5
- Labels: frontend, i18n, easy

11.7. Translation dictionary structure & fallback
- Description: Establish naming conventions (`common`, `navigation`, `post`). Add missing key logger for development.
- Acceptance: Documented in `/docs/i18n-dictionaries.md`; fallback to `en` works.
- Time: 30–45 min
- Prerequisites: 11.6
- Labels: docs, i18n, easy

11.8. Language switcher component (accessible)
- Description: Implement header switcher (button or menu) with ARIA roles; persists chosen locale (cookie or URL). Avoid full reload (use Next.js locale routing).
- Acceptance: Switcher keyboard accessible; focus state visible; current locale announced.
- Time: 45–90 min
- Prerequisites: 11.6
- Labels: frontend, accessibility, i18n, styling, medium

11.9. Hreflang & alternate metadata
- Description: Enhance `generateMetadata` to include `alternates: { languages: { 'en': '/en/slug', 'uk': '/uk/slug', 'ru': '/ru/slug' } }`. Add canonical per locale.
- Acceptance: Page source contains correct hreflang and canonical tags; validated with SEO tool.
- Time: 45–60 min
- Prerequisites: 11.5, 6.2
- Labels: seo, i18n, medium

11.10. Content fallback strategy
- Description: Define behavior when translation missing: (a) show fallback English with banner, or (b) 404. Implement banner component if fallback chosen.
- Acceptance: Behavior documented; tested by removing one translation.
- Time: 30–60 min
- Prerequisites: 11.3
- Labels: i18n, frontend, docs, easy

11.11. Localized RSS feeds
- Description: Provide `/en/rss.xml`, `/uk/rss.xml`, `/ru/rss.xml` (or `/rss.xml?lang=`). Each feed includes only locale-specific posts.
- Acceptance: All feeds validate & contain correct language items.
- Time: 45–75 min
- Prerequisites: 11.3, 4.6
- Labels: extras, i18n, seo, medium

11.12. Tests for i18n (unit + E2E)
- Description: Add unit tests for dictionary loader & fallback; Playwright tests for language switch (URL updates, content changes, hreflang presence).
- Acceptance: CI passes new i18n test suite.
- Time: 60–120 min
- Prerequisites: 7.1, 7.3, 11.6
- Labels: testing, i18n, medium

11.13. Analytics segmentation per locale
- Description: Configure analytics (e.g., Plausible `props` or URL path segmentation) to differentiate locales; optionally custom dimension.
- Acceptance: Dashboard shows per-locale traffic.
- Time: 30–45 min
- Prerequisites: 8.3, 11.5
- Labels: extras, i18n, medium

11.14. Documentation & editorial workflow for translations
- Description: Create `/docs/i18n-workflow.md` describing how editors add translated posts, maintain slugs, and handle fallback.
- Acceptance: Document exists & referenced in README.
- Time: 30–45 min
- Prerequisites: 11.2
- Labels: docs, cms, i18n, easy

11.15. Accessibility & RTL audit (future-proof)
- Description: Audit components for potential future RTL (not needed now, but ensure no hard-coded directional styles). Note gaps.
- Acceptance: Report with action items added to backlog.
- Time: 30–45 min
- Prerequisites: 11.8
- Labels: accessibility, i18n, docs, easy

11.16. Performance impact review (i18n)
- Description: Measure bundle size impact of dictionaries; apply code-splitting & dynamic import improvements.
- Acceptance: Language-specific payload difference documented; no >5% TTFB regression.
- Time: 30–60 min
- Prerequisites: 11.6, 11.7
- Labels: perf, i18n, medium

Task Template (Issue Body)
Title: [phase.task] Short descriptive title (labels: ...)
Body:
- Description: ...
- Acceptance criteria:
  - ...
- Prerequisites: ...
- Estimated time: ...
- Files to change: ...
- Notes: ...
Suggested labels: (choose relevant)

Example Updated Issue
Title: [2.2] Add Tailwind CSS v4 (labels: styling, setup, easy)
Body:
- Description: Install Tailwind v4, minimal config, integrate into global layout.
- Acceptance criteria:
  - tailwind.config.ts exists with minimal tokens.
  - Utilities applied in `app/layout.tsx`.
  - No unused boilerplate classes left.
- Prerequisites: 2.1
- Estimated time: 20–30 minutes
- Files to change: tailwind.config.ts, src/styles/globals.css, app/layout.tsx
- Notes: Use `@tailwind base; @tailwind components; @tailwind utilities;`. Consider removing legacy dark mode config in favor of `class`.

Caching & Revalidation Guidance (2025)
- Static post pages: export `revalidate = 600` for 10‑minute refresh.
- Homepage: consider PPR if large feed; else `revalidate = 300`.
- Search route: dynamic (`{ cache: 'no-store' }` or `revalidate: 0`).
- RSS route: regenerate on schedule (set revalidate 900 or dynamic build).
- Avoid overusing `force-cache` when content is volatile.

Accessibility Checklist (Condensed)
- Landmark regions: header, main, footer
- Proper heading hierarchy (h1 per page)
- Focus states visible (Tailwind focus-visible classes)
- Color contrast >= WCAG AA (use tooling)
- Meaningful alt text; decorative images `alt=""`
- Skip-to-content link for keyboard users

Performance Quick Wins
- Use `next/font` (self-hosted) instead of external font blocking
- Limit JavaScript in client components (push logic server-side)
- Defer analytics scripts
- Avoid large image intrinsic sizes; serve responsive sets
- Avoid hydration for purely static blocks (pure RSC components)

Security Checklist
- Sanitize HTML content from WordPress
- Restrict GraphQL endpoint usage in server code (no client exposure of secrets)
- Use environment variables (never commit `.env.local`)
- Add CSP & Referrer-Policy; block mixed content
- Keep WP plugins minimal and updated

Future Enhancements (Ideas)
- MDX hybrid posts
- AI-assisted post summaries (Edge function)
- Image CDN with AVIF fallback automation
- Social sharing image generation (OG dynamic route)
- Tag/topic recommendation engine

Beginner Tips (Refreshed)
- Build vertical feature slices (data + UI) incrementally.
- Keep a tight feedback loop: deploy previews early.
- Resist premature abstraction—duplicate until pattern stabilizes.
- Use TypeScript return types in data layer to catch schema drift early.
- Let server components own data fetching; keep client components lean.

If you want, I can:
- Auto-generate GitHub Issues for initial phases.
- Provide starter code for Tailwind v4 + Next.js 15 layout + GraphQL helper.
- Help scaffold testing (Vitest + Playwright).
- Draft security headers & CSP config.
- Generate i18n dictionary scaffolds.

Next Step Suggestion
Start with tasks 0.1 → 2.2 sequentially to get a visible styled home shell, then integrate data (Phase 3) for early momentum. Begin i18n only after core content is stable (post Phase 6), unless multilingual is a launch requirement—then schedule Phase 11 earlier.
