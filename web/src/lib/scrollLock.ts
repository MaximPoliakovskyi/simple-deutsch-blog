type StyleSnapshot = {
  htmlTouchAction: string;
  htmlOverscrollBehavior: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyOverflow: string;
  bodyTouchAction: string;
  bodyOverscrollBehavior: string;
};

let lockCount = 0;
let snapshot: StyleSnapshot | null = null;
let lockedScrollX = 0;
let lockedScrollY = 0;

function captureSnapshot() {
  const docEl = document.documentElement;
  const body = document.body;
  snapshot = {
    htmlTouchAction: docEl.style.touchAction,
    htmlOverscrollBehavior: docEl.style.overscrollBehavior,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyOverflow: body.style.overflow,
    bodyTouchAction: body.style.touchAction,
    bodyOverscrollBehavior: body.style.overscrollBehavior,
  };
}

function applyLockStyles(scrollbarWidth: number) {
  const docEl = document.documentElement;
  const body = document.body;

  docEl.style.setProperty("--scrollbar-comp", `${Math.max(0, scrollbarWidth)}px`);
  docEl.classList.add("scroll-locked");
  docEl.style.touchAction = "none";
  docEl.style.overscrollBehavior = "none";

  body.style.position = "fixed";
  body.style.top = `-${lockedScrollY}px`;
  body.style.left = `-${lockedScrollX}px`;
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  body.style.touchAction = "none";
  body.style.overscrollBehavior = "none";
}

function restoreStylesAndScroll() {
  const docEl = document.documentElement;
  const body = document.body;

  docEl.classList.remove("scroll-locked");
  docEl.style.setProperty("--scrollbar-comp", "0px");

  if (snapshot) {
    docEl.style.touchAction = snapshot.htmlTouchAction;
    docEl.style.overscrollBehavior = snapshot.htmlOverscrollBehavior;
    body.style.position = snapshot.bodyPosition;
    body.style.top = snapshot.bodyTop;
    body.style.left = snapshot.bodyLeft;
    body.style.right = snapshot.bodyRight;
    body.style.width = snapshot.bodyWidth;
    body.style.overflow = snapshot.bodyOverflow;
    body.style.touchAction = snapshot.bodyTouchAction;
    body.style.overscrollBehavior = snapshot.bodyOverscrollBehavior;
  } else {
    docEl.style.touchAction = "";
    docEl.style.overscrollBehavior = "";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    body.style.touchAction = "";
    body.style.overscrollBehavior = "";
  }

  snapshot = null;
  window.scrollTo({ left: lockedScrollX, top: lockedScrollY, behavior: "auto" });
}

export function lockScroll() {
  if (typeof window === "undefined") return;
  try {
    lockCount += 1;
    if (lockCount > 1) return;

    lockedScrollX = window.scrollX;
    lockedScrollY = window.scrollY;
    captureSnapshot();

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    applyLockStyles(scrollbarWidth);
  } catch (_) {}
}

export function unlockScroll() {
  if (typeof window === "undefined") return;
  try {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount > 0) return;
    restoreStylesAndScroll();
  } catch (_) {
    lockCount = 0;
    try {
      restoreStylesAndScroll();
    } catch {}
  }
}

export function forceUnlockScroll() {
  if (typeof window === "undefined") return;
  try {
    lockCount = 0;
    restoreStylesAndScroll();
  } catch {}
}
