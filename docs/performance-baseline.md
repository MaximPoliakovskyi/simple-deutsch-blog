# Performance Baseline

This repo currently uses **npm** (detected via `web/package-lock.json`).

## Production Measurement Workflow

Run performance checks against a production build. `next dev` is not representative for TTFB/LCP/hydration.

From `web/`:

```bash
npm install
npm run build
npm run start
```

In another terminal:

```bash
npm run perf:lighthouse
```

Or from the repo root:

```bash
npm run perf:prod
npm run perf:lighthouse
```

`perf:lighthouse` writes an HTML report to `.next/lighthouse-desktop.html`.

## Bundle + Route Payload Baseline

From `web/`:

```bash
npm run analyze
npm run perf:build
```

`npm run analyze` runs a production webpack compile with `ANALYZE=true` so `@next/bundle-analyzer` can emit:
- `.next/analyze/client.html`
- `.next/analyze/nodejs.html`
- `.next/analyze/edge.html`

## What To Track

1. **TTFB** (Lighthouse diagnostics + server timing): watch for spikes on localized content routes.
2. **LCP**: verify homepage and post detail hero render time.
3. **CLS**: should stay low during preloader/transition/image rendering.
4. **JS bundle size**:
from `npm run perf:build` and `.next/analyze/client.html`.
5. **Hydration cost**:
watch Lighthouse Total Blocking Time and large client bundles for nav/overlay/transition code.
6. **Number of client components** (`"use client"` count):

```bash
rg -n "\"use client\"" src --glob "*.ts" --glob "*.tsx"
```

7. **Top client chunks** from analyzer:
run `npm run analyze`, then inspect `.next/analyze/client.html`.

## PR Regression Checklist

- [ ] `npm run perf:build` output does not show unexpected route payload growth.
- [ ] `"use client"` match count is unchanged or justified.
- [ ] Analyzer screenshot from `.next/analyze/client.html` is attached when bundle shape changes.
- [ ] Any increase has a short explanation and mitigation follow-up.
