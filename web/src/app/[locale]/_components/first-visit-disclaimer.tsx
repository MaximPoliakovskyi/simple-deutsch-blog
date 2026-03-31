"use client";

import { useState } from "react";

export default function FirstVisitDisclaimer() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4 md:bottom-6">
      <section
        aria-atomic="true"
        aria-live="polite"
        className="pointer-events-auto w-full max-w-xl rounded-2xl border px-4 py-3 backdrop-blur-sm"
        style={{
          backgroundColor: "var(--sd-surface-elevated)",
          borderColor: "var(--sd-border-strong)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-5 text-[color:var(--sd-text)]">
              The site is currently finishing its technical implementation
            </p>
            <p className="mt-1 text-sm leading-5 text-[color:var(--sd-text-muted)]">
              First content will be published in April
            </p>
          </div>
          <button
            aria-label="Dismiss site notice"
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-[color:var(--sd-text-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--sd-text)] dark:hover:bg-white/10"
            onClick={() => setIsVisible(false)}
            type="button"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
