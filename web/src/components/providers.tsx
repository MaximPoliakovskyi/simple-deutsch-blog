import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

export default function Providers({
  children,
  locale: _locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return <>{children}</>;
}
