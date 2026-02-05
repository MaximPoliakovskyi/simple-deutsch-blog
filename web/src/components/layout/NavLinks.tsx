"use client";

import Link from "next/link";
import { DESKTOP_NAV_LINKS, MOBILE_NAV_LINKS } from "@/components/layout/navConfig";

type Props = {
  mode: "desktop" | "mobile";
  buildLocalePath: (path: string) => string;
  label: (key: string, fallback: string) => string;
  onNavigate?: () => void;
};

export default function NavLinks({ mode, buildLocalePath, label, onNavigate }: Props) {
  if (mode === "desktop") {
    return (
      <>
        {DESKTOP_NAV_LINKS.map((item) => (
          <Link
            key={item.path}
            href={buildLocalePath(item.path)}
            className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
          >
            {label(item.key, item.fallback)}
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {MOBILE_NAV_LINKS.map((item) => (
        <li key={item.path}>
          <Link
            href={buildLocalePath(item.path)}
            onClick={onNavigate}
            className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
          >
            {label(item.key, item.fallback)}
          </Link>
        </li>
      ))}
    </>
  );
}
