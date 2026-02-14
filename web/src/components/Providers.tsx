"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import { DEFAULT_LOCALE, parseLocaleFromPath } from "@/i18n/locale";

const FADE_DURATION_S = 0.2;
const FADE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const locale = parseLocaleFromPath(pathname) ?? DEFAULT_LOCALE;
  const fadeKey = `${locale}:${pathname}`;
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <>
        {children}
        <Footer />
      </>
    );
  }

  return (
    <motion.div
      key={fadeKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: FADE_DURATION_S, ease: FADE_EASE }}
      style={{ willChange: "opacity" }}
    >
      {children}
      <Footer />
    </motion.div>
  );
}
