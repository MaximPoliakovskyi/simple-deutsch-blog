let lockCount = 0;
let prevOverflow: string | null = null;
let prevPaddingRight: string | null = null;

export function lockScroll() {
  if (typeof window === "undefined") return;
  lockCount += 1;
  if (lockCount > 1) return;

  try {
    const docEl = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - docEl.clientWidth;
    docEl.style.setProperty("--scrollbar-comp", `${scrollbarWidth}px`);
    prevOverflow = docEl.style.overflow ?? null;
    prevPaddingRight = body.style.paddingRight ?? null;
    docEl.style.overflow = "hidden";
    // apply padding-right using the CSS variable so it's consistent with CSS
    body.style.paddingRight = "var(--scrollbar-comp)";
  } catch (_) {}
}

export function unlockScroll() {
  if (typeof window === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  try {
    const docEl = document.documentElement;
    const body = document.body;
    docEl.style.overflow = prevOverflow ?? "";
    body.style.paddingRight = prevPaddingRight ?? "";
    docEl.style.removeProperty("--scrollbar-comp");
    prevOverflow = null;
    prevPaddingRight = null;
  } catch (_) {}
}
