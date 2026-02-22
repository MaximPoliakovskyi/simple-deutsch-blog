import type { ReactNode } from "react";
import type { Locale } from "@/i18n/locale";

export default function Providers({ children, locale }: { children: ReactNode; locale: Locale }) {
  void locale;
  return <>{children}</>;
}
