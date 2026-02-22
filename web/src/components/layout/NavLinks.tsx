"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DESKTOP_NAV_LINKS, MOBILE_NAV_LINKS } from "@/components/layout/navConfig";

type Props = {
  mode: "desktop" | "mobile";
  buildLocalePath: (path: string) => string;
  label: (key: string, fallback: string) => string;
  onNavigate?: () => void;
};

export default function NavLinks({ mode, buildLocalePath, label, onNavigate }: Props) {
  const router = useRouter();
  const prefetchIntent = (href: string) => {
    router.prefetch(href);
  };

  if (mode === "desktop") {
    return (
      <>
        {DESKTOP_NAV_LINKS.map((item) => {
          const href = buildLocalePath(item.path);
          return (
            <Link
              key={item.path}
              href={href}
              prefetch
              onMouseEnter={() => prefetchIntent(href)}
              onFocus={() => prefetchIntent(href)}
              className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
            >
              {label(item.key, item.fallback)}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {MOBILE_NAV_LINKS.map((item) => {
        const href = buildLocalePath(item.path);
        return (
          <li key={item.path}>
            <Link
              href={href}
              prefetch
              scroll={item.path === "/search" ? false : undefined}
              onMouseEnter={() => prefetchIntent(href)}
              onFocus={() => prefetchIntent(href)}
              onClick={onNavigate}
              className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
            >
              {label(item.key, item.fallback)}
            </Link>
          </li>
        );
      })}
    </>
  );
}
