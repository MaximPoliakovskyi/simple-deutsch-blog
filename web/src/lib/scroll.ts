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

  docEl.classList.remove("scroll-locked");

  if (snapshot) {
    docEl.style.overflow = snapshot.htmlOverflow;
    docEl.style.overscrollBehavior = snapshot.htmlOverscrollBehavior;
  } else {
    docEl.style.overflow = "";
    docEl.style.overscrollBehavior = "";
  }

  snapshot = null;
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
