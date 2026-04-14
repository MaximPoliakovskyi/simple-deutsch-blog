"use client";

import { openConsentModal } from "@/lib/consent";

type Props = {
  label: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function CookieSettingsButton({ label, className = "", style }: Props) {
  return (
    <button
      type="button"
      onClick={openConsentModal}
      className={className}
      style={style}
    >
      {label}
    </button>
  );
}
