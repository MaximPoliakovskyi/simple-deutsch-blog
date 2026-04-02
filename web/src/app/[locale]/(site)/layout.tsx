import type { ReactNode } from "react";
import NavProgress from "@/components/nav-progress";

/**
 * (site) group layout — adds NavProgress to all real pages.
 *
 * not-found.tsx lives outside this group at the [locale]/ level, so it never
 * receives NavProgress. Header/Footer come from the parent [locale]/layout.tsx.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavProgress />
      {children}
    </>
  );
}
