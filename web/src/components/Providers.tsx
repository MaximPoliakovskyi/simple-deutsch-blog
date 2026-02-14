"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const FADE_DURATION_S = 0.24;
const FADE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: FADE_DURATION_S, ease: FADE_EASE }}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}
