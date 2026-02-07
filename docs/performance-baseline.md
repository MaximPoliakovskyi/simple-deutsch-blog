# Performance Baseline

This repo currently uses **npm** (detected via `web/package-lock.json`).

## Run the Baseline

From `web/`:

```bash
npm install
npm run analyze
npm run perf:build
```

`npm run analyze` runs a production webpack compile with `ANALYZE=true` so `@next/bundle-analyzer` can emit:
- `.next/analyze/client.html`
- `.next/analyze/nodejs.html`
- `.next/analyze/edge.html`

## What We Track (Initial Baseline)

1. **Per-route JS size** from `npm run perf:build` (manifest-based estimate from `.next` artifacts).
2. **Number of client components** (`"use client"` count):

```bash
rg -n "\"use client\"" src --glob "*.ts" --glob "*.tsx"
```

Then track the line count of matches over time.

3. **Top 10 largest client chunks** from bundle analyzer output:
   - Run `npm run analyze`.
   - Open `.next/analyze/client.html`.
   - Capture a screenshot of the top 10 largest chunks for the PR description.

## PR Regression Checklist

- [ ] `npm run perf:build` output does not show unexpected route payload growth.
- [ ] `"use client"` match count is unchanged or justified.
- [ ] Analyzer screenshot from `.next/analyze/client.html` is attached when bundle shape changes.
- [ ] Any increase has a short explanation and mitigation follow-up.
