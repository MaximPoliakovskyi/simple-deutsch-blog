"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  hasInteracted,
  readConsent,
  writeConsent,
} from "@/lib/consent";
import { buildLocalizedHref } from "@/lib/i18n";

type Panel = "none" | "banner" | "modal";

type OptInState = { preferences: boolean; analytics: boolean; marketing: boolean };

function stateFromRecord(record: ReturnType<typeof readConsent>): OptInState {
  if (!record) return { preferences: false, analytics: false, marketing: false };
  return {
    preferences: record.categories.preferences,
    analytics: record.categories.analytics,
    marketing: record.categories.marketing,
  };
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0 select-none">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      {/* Track — no border, just filled background */}
      <span
        className={[
          "block w-10 h-5 rounded-full transition-colors duration-150",
          checked ? "bg-[var(--sd-accent)]" : "bg-black/10 dark:bg-white/15",
        ].join(" ")}
      />
      {/* Knob — 2 px inset each side */}
      <span
        className={[
          "absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150",
          checked ? "translate-x-[22px]" : "translate-x-[2px]",
        ].join(" ")}
      />
    </label>
  );
}

export default function CookieConsent() {
  const { t, locale } = useI18n();
  const [panel, setPanel] = useState<Panel>("none");
  const [cats, setCats] = useState<OptInState>({
    preferences: false,
    analytics: false,
    marketing: false,
  });
  const hadConsentRef = useRef(false);

  // ── Scroll lock with scrollbar-width compensation ─────────────────────────
  // When the modal opens we apply overflow:hidden to <html> to prevent background
  // scrolling. overflow:hidden removes the scrollbar-gutter (even when
  // scrollbar-gutter:stable is set globally), which shrinks the content area and
  // causes a visible layout shift. We compensate by measuring the scrollbar width
  // before locking and adding it back as padding-right on <html>.
  useEffect(() => {
    if (panel !== "modal") return;
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    // Measure BEFORE adding overflow:hidden so the scrollbar is still present.
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);

    root.classList.add("consent-open");
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      root.classList.remove("consent-open");
      root.style.paddingRight = "";
    };
  }, [panel]);

  useEffect(() => {
    const record = readConsent();
    hadConsentRef.current = hasInteracted();
    setCats(stateFromRecord(record));
    if (!hadConsentRef.current) setPanel("banner");

    const handleOpen = () => {
      hadConsentRef.current = hasInteracted();
      setCats(stateFromRecord(readConsent()));
      setPanel("modal");
    };
    const handleChange = () => {
      hadConsentRef.current = hasInteracted();
      setCats(stateFromRecord(readConsent()));
    };

    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    window.addEventListener(CONSENT_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
      window.removeEventListener(CONSENT_CHANGE_EVENT, handleChange);
    };
  }, []);

  const apply = (next: OptInState) => {
    writeConsent(next);
    hadConsentRef.current = true;
    setCats(next);
    setPanel("none");
  };

  const handleAcceptAll = () => apply({ preferences: true, analytics: true, marketing: true });
  const handleRejectAll = () => apply({ preferences: false, analytics: false, marketing: false });
  const handleSave = () => apply(cats);

  const closeModal = () => setPanel(hadConsentRef.current ? "none" : "banner");

  if (panel === "none") return null;

  const privacyHref = buildLocalizedHref(locale, "/privacy");

  const optionalCategories: Array<{ id: keyof OptInState; name: string; desc: string }> = [
    {
      id: "preferences",
      name: t("consent.category.preferences.name"),
      desc: t("consent.category.preferences.desc"),
    },
    {
      id: "analytics",
      name: t("consent.category.analytics.name"),
      desc: t("consent.category.analytics.desc"),
    },
    {
      id: "marketing",
      name: t("consent.category.marketing.name"),
      desc: t("consent.category.marketing.desc"),
    },
  ];

  /* ── Banner ──────────────────────────────────────────────────────────── */
  // z-[120] keeps the banner above the sticky header (z-[100]) and mobile
  // nav drawer (z-[110]) so it is never accidentally hidden behind them.
  if (panel === "banner") {
    return (
      <div
        role="dialog"
        aria-modal="false"
        aria-label={t("consent.banner.title")}
        className="fixed bottom-0 inset-x-0 z-[120] border-t border-[var(--sd-border)] bg-[var(--sd-page-bg)] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex flex-col min-[560px]:flex-row min-[560px]:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--sd-text)] leading-relaxed">
              <span className="font-semibold">{t("consent.banner.title")}</span>{" "}
              <span className="text-[var(--sd-text-muted)]">{t("consent.banner.text")}</span>
            </p>
            <Link
              href={privacyHref}
              className="text-xs text-[var(--sd-text-muted)] underline underline-offset-2 hover:text-[var(--sd-text)] mt-1 inline-block transition-colors"
            >
              {t("consent.privacyLink")}
            </Link>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRejectAll}
              className="text-sm font-medium px-3.5 py-1.5 rounded-full border border-[var(--sd-border)] text-[var(--sd-text-muted)] hover:text-[var(--sd-text)] hover:border-[var(--sd-text-muted)] transition-colors whitespace-nowrap"
            >
              {t("consent.banner.rejectAll")}
            </button>
            <button
              type="button"
              onClick={() => setPanel("modal")}
              className="text-sm font-medium px-3.5 py-1.5 rounded-full border border-[var(--sd-border)] text-[var(--sd-text-muted)] hover:text-[var(--sd-text)] hover:border-[var(--sd-text-muted)] transition-colors whitespace-nowrap"
            >
              {t("consent.banner.customize")}
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="text-sm font-medium px-3.5 py-1.5 rounded-full sd-pill transition-opacity hover:opacity-90 whitespace-nowrap"
            >
              {t("consent.banner.acceptAll")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Modal ───────────────────────────────────────────────────────────── */
  // Z-index layering:
  //   page content         → base
  //   header/nav           → z-[100]
  //   mobile nav drawer    → z-[110]
  //   cookie banner        → z-[120]
  //   backdrop (this)      → z-[150]  ← covers header + nav drawer
  //   modal panel (this)   → z-[160]  ← above backdrop
  //   search overlay       → z-[200]  ← always highest
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150] bg-black/40"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("consent.modal.title")}
        className={[
          // Position: bottom sheet on mobile, centred on sm+
          "fixed bottom-0 inset-x-0",
          "sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2",
          // Size
          "w-full sm:w-[min(460px,calc(100vw-2rem))]",
          // Surface
          "bg-[var(--sd-page-bg)] rounded-t-2xl sm:rounded-2xl",
          "shadow-xl ring-1 ring-black/5 dark:ring-white/5",
          // Stacking + scroll
          "z-[160] max-h-[85dvh] sm:max-h-[580px] overflow-y-auto",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-2">
          <h2 className="text-sm font-semibold text-[var(--sd-text)] leading-snug pr-3">
            {t("consent.modal.title")}
          </h2>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="shrink-0 text-[var(--sd-text-muted)] hover:text-[var(--sd-text)] transition-colors p-1 -mr-1"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M2 2l14 14M16 2L2 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="px-5 sm:px-6 pb-3 text-xs text-[var(--sd-text-muted)] leading-relaxed">
          {t("consent.modal.intro")}
        </p>

        {/* Necessary (always on) */}
        <div className="px-5 sm:px-6 py-2.5 border-t border-[var(--sd-border)] flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--sd-text)]">
              {t("consent.category.necessary.name")}
            </p>
            <p className="text-xs text-[var(--sd-text-muted)] mt-0.5 leading-relaxed">
              {t("consent.category.necessary.desc")}
            </p>
          </div>
          <span className="text-xs text-[var(--sd-text-muted)] shrink-0 italic">
            {t("consent.alwaysActive")}
          </span>
        </div>

        {/* Optional categories */}
        {optionalCategories.map((cat) => (
          <div
            key={cat.id}
            className="px-5 sm:px-6 py-2.5 border-t border-[var(--sd-border)] flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--sd-text)]">{cat.name}</p>
              <p className="text-xs text-[var(--sd-text-muted)] mt-0.5 leading-relaxed">
                {cat.desc}
              </p>
            </div>
            <Toggle
              checked={cats[cat.id]}
              onChange={(v) => setCats((prev) => ({ ...prev, [cat.id]: v }))}
              label={cat.name}
            />
          </div>
        ))}

        {/* Footer buttons
            Mobile  (flex-col): Reject → Save → Accept All — all full-width, equally prominent
            Desktop (flex-row): [Reject ←→] [Save] [Accept All]
            Reject uses sm:mr-auto to push the other two to the right on desktop. */}
        <div className="px-5 sm:px-6 pt-4 pb-5 flex flex-col sm:flex-row sm:items-center gap-2 border-t border-[var(--sd-border)]">
          <button
            type="button"
            onClick={handleRejectAll}
            className="sm:mr-auto text-sm font-medium w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-full border border-[var(--sd-border)] text-[var(--sd-text-muted)] hover:text-[var(--sd-text)] hover:border-[var(--sd-text-muted)] transition-colors whitespace-nowrap"
          >
            {t("consent.modal.rejectAll")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-sm font-medium w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-full border border-[var(--sd-border)] text-[var(--sd-text)] hover:border-[var(--sd-text-muted)] transition-colors whitespace-nowrap"
          >
            {t("consent.modal.save")}
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="text-sm font-medium w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-full sd-pill transition-opacity hover:opacity-90 whitespace-nowrap"
          >
            {t("consent.modal.acceptAll")}
          </button>
        </div>
      </div>
    </>
  );
}
