"use client";

import { useEffect } from "react";
import { setManualScrollRestoration } from "@/lib/scroll";

if (typeof window !== "undefined") {
  setManualScrollRestoration();
}

export default function RouteScrollReset() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const keepManual = () => setManualScrollRestoration();
    setManualScrollRestoration();
    window.addEventListener("pageshow", keepManual);
    return () => window.removeEventListener("pageshow", keepManual);
  }, []);

  return null;
}
