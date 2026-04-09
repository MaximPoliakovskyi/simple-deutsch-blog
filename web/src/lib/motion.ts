/**
 * Motion tokens — mirrors the CSS --motion-* custom properties in globals.css.
 *
 * Use these constants wherever motion values must be expressed in JavaScript
 * (JS-driven animations, inline style objects, setTimeout durations).
 * For pure CSS, use the matching CSS custom properties (e.g. var(--motion-spring)).
 *
 * Keep in sync with the `:root` block in globals.css.
 */
export const MOTION = {
  // ── Easings ───────────────────────────────────────────────────────────────
  /** Gentle deceleration. Primary easing for reveals/fade-ins. (--motion-spring) */
  spring: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Fast snap-in. Used for theme crossfade cover phase. (--motion-snappy) */
  snappy: "cubic-bezier(0.33, 1, 0.68, 1)",
  /** Symmetric slide. Used for the page-transition overlay. (--motion-slide) */
  slide: "cubic-bezier(0.42, 0, 0.58, 1)",
  /** Height / layout expand. Used for animated height changes. (--motion-resize) */
  resize: "cubic-bezier(0.16, 1, 0.3, 1)",

  // ── Durations (ms) ────────────────────────────────────────────────────────
  /** 200 ms — hover micro-interactions, close / open panels. (--motion-fast) */
  fast: 200,
  /** 300 ms — default UI transitions (cards, pills). (--motion-normal) */
  normal: 300,
  /** 500 ms — content reveals. (--motion-relaxed) */
  relaxed: 500,
  /** 600 ms — page-level initial fades. (--motion-slow) */
  slow: 600,

  // ── System-specific (not general-purpose CSS vars) ────────────────────────
  /** 1 000 ms — content fade-in after route overlay completes. (--motion-route-content) */
  routeContent: 1000,
  /** 1500 ms — route overlay slide-in. Matches CSS --rt-enter-ms. */
  routeEnter: 1500,
  /** 1500 ms — route overlay slide-out. Matches CSS --rt-exit-ms. */
  routeExit: 1500,
  /** 3000 ms — minimum total route transition duration. */
  routeMinDuration: 3000,
  /** 680 ms — theme crossfade reveal phase. Intentionally luxurious. */
  themeVeilOut: 680,
} as const;
