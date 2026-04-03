const DEBUG_SCROLL = process.env.NEXT_PUBLIC_DEBUG_SCROLL === "1";

type StyleSnapshot = {
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
};

let lockCount = 0;
let snapshot: StyleSnapshot | null = null;

function captureSnapshot() {
  const docEl = document.documentElement;
  snapshot = {
    htmlOverflow: docEl.style.overflow,
    htmlOverscrollBehavior: docEl.style.overscrollBehavior,
  };
}

function applyLockStyles() {
  const docEl = document.documentElement;

  docEl.classList.add("scroll-locked");
  docEl.style.overflow = "hidden";
  docEl.style.overscrollBehavior = "none";
}

function restoreStyles() {
  const docEl = document.documentElement;

  // ① Release the scroll lock FIRST.
  // Do NOT attempt scrollTo while overflow:hidden is active. The browser caches
  // the pre-lock scrollTop internally. On Chrome, scroll is routed to <body>
  // while <html> has overflow:hidden, so setting scrollTop on <html> is a
  // no-op. On iOS Safari the compositor manages scroll independently and
  // silently discards the write. Either way, the cached value is restored the
  // moment overflow is removed — overwriting anything we set during the lock.
  docEl.classList.remove("scroll-locked");

  if (snapshot) {
    docEl.style.overflow = snapshot.htmlOverflow;
    docEl.style.overscrollBehavior = snapshot.htmlOverscrollBehavior;
  } else {
    docEl.style.overflow = "";
    docEl.style.overscrollBehavior = "";
  }

  snapshot = null;

  // ② Reset scroll in the SAME synchronous block, after overflow is restored.
  // There is no paint between these lines — no visible flash at the old
  // position. Inline scrollBehavior overrides the CSS attribute-selector rule
  // synchronously (spec §6.4.3), bypassing scroll-behavior:smooth on <html>.
  if (DEBUG_SCROLL) {
    console.log("[scroll-reset][unlock] before reset", {
      scrollY: window.scrollY,
      scrollTop: docEl.scrollTop,
    });
  }
  docEl.style.scrollBehavior = "auto";
  docEl.scrollTop = 0;
  window.scrollTo(0, 0);
  docEl.style.scrollBehavior = "";
  if (DEBUG_SCROLL) {
    console.log("[scroll-reset][unlock] after reset", { scrollY: window.scrollY });
    requestAnimationFrame(() => {
      console.log("[scroll-reset][unlock] after paint", { scrollY: window.scrollY });
    });
  }
}

export function lockScroll() {
  if (typeof window === "undefined") return;
  try {
    lockCount += 1;
    if (lockCount > 1) return;

    captureSnapshot();

    applyLockStyles();
  } catch (_) {}
}

export function unlockScroll() {
  if (typeof window === "undefined") return;
  try {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount > 0) return;
    restoreStyles();
  } catch (_) {
    lockCount = 0;
    try {
      restoreStyles();
    } catch {}
  }
}

export function forceUnlockScroll() {
  if (typeof window === "undefined") return;
  try {
    lockCount = 0;
    restoreStyles();
  } catch {}
}
