/**
 * search-scroll-lock.ts
 *
 * Scroll lock dedicated to the Search overlay.
 *
 * The site keeps the root scrollbar visible by default and only hides it
 * while Search is active. This module preserves the existing fixed-shell
 * scroll lock, marks the root with search-open, and restores the saved scroll
 * position only when the overlay closes without a route change.
 *
 * Mechanism: apply position:fixed to #app-shell at the current scroll
 * position. Removing #app-shell from normal flow collapses <body> height to
 * zero so no background scroll is possible. top:-savedScrollY keeps the same
 * content visible — no visual jump. width is locked to the measured pixel
 * value so layout does not shift when the shell leaves normal flow.
 *
 * The Search backdrop lives in #overlay-root (a direct sibling of #app-shell,
 * outside the route-transition tree). position:fixed; inset:0 there is always
 * viewport-relative — full coverage regardless of the locked shell width.
 *
 * Guarantees:
 *   - No overflow:hidden on <html> or <body>
 *   - No padding-right compensation hacks
 *   - No calc(100vw - ...) or CSS-guessed widths
 *   - Width is always the exact measured getBoundingClientRect().width in px
 *   - Scroll position is captured before lock and restored on unlock
 *   - No coupling to route-transition scroll reset
 */

let locked = false;
let savedScrollY = 0;

type UnlockSearchOptions = {
  restoreScroll?: boolean;
};

function getRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.documentElement;
}

function getAppShell(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById("app-shell");
}

function setSearchOpenState(isOpen: boolean): void {
  const root = getRoot();
  if (!root) return;

  root.classList.toggle("search-open", isOpen);
}

/**
 * Freeze the page so it cannot scroll while Search is open.
 * Idempotent — a second call while already locked is a no-op.
 */
export function lockSearch(): void {
  if (typeof window === "undefined") return;
  if (locked) return;

  const shell = getAppShell();
  if (!shell) return;

  // Capture BEFORE any style change.
  savedScrollY = window.scrollY;
  const shellWidth = shell.getBoundingClientRect().width;

  // position:fixed removes the shell from normal flow.
  // top:-savedScrollY keeps the same content visible at the top of the
  // viewport that was visible before — no visual jump.
  // width is locked to the exact pre-lock pixel value so the content
  // area does not expand when the scrollbar slot disappears.
  shell.style.position = "fixed";
  shell.style.top = `-${savedScrollY}px`;
  shell.style.left = "0";
  shell.style.width = `${shellWidth}px`;
  setSearchOpenState(true);

  locked = true;
}

/**
 * Restore the page to its normal state and optionally restore the saved position.
 * Idempotent — a call when already unlocked is a no-op.
 */
export function unlockSearch({ restoreScroll = true }: UnlockSearchOptions = {}): void {
  if (typeof window === "undefined") return;
  if (!locked) return;

  const shell = getAppShell();
  if (shell) {
    shell.style.position = "";
    shell.style.top = "";
    shell.style.left = "";
    shell.style.width = "";
  }
  setSearchOpenState(false);

  // Restore scroll position synchronously and instantly.
  // The inline scrollBehavior:auto override bypasses any CSS
  // scroll-behavior:smooth rule on <html> so the jump is always instant.
  if (restoreScroll) {
    const docEl = document.documentElement;
    docEl.style.scrollBehavior = "auto";
    window.scrollTo(0, savedScrollY);
    docEl.style.scrollBehavior = "";
  }

  locked = false;
  savedScrollY = 0;
}
