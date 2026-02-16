"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/locale";

const FADE_DURATION_S = 0.2;
const FADE_EASE = "easeInOut";
const DEBUG_HYDRATION = process.env.NODE_ENV !== "production";

export default function Providers({ children, locale }: { children: ReactNode; locale: Locale }) {
  const pathname = usePathname() || "/";
  const fadeKey = `${locale}:${pathname}`;
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion === true;

  useEffect(() => {
    if (!DEBUG_HYDRATION) return;
    console.log("[hydration][client][Providers]", {
      pathname,
      locale,
      reduceMotion,
      fadeKey,
    });
  }, [fadeKey, locale, pathname, reduceMotion]);

  return (
    <motion.div
      key={fadeKey}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: FADE_DURATION_S, ease: FADE_EASE }}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}
