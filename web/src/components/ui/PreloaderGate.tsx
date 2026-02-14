"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import PreloaderClient from "@/components/ui/PreloaderClient";

function isVisibleFromDocument() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-app-visible") === "1";
}

export default function PreloaderGate({ children }: { children: ReactNode }) {
  const [isAppVisible, setIsAppVisible] = useState<boolean>(() => isVisibleFromDocument());

  useEffect(() => {
    document.documentElement.setAttribute("data-app-visible", isAppVisible ? "1" : "0");
  }, [isAppVisible]);

  const handlePreloaderFinished = useCallback(() => {
    setIsAppVisible(true);
  }, []);

  return (
    <>
      <PreloaderClient onFinished={handlePreloaderFinished} />
      {children}
    </>
  );
}

