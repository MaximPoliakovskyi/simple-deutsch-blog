"use client";

import { useCallback, useEffect, useState } from "react";
import PreloaderClient from "@/components/ui/PreloaderClient";
import { clearLegacyPreloaderSeenFlag, setDocumentLoadingState } from "@/hooks/initialLoadGate";

export default function InitialPreloader() {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Keep the preloader visible on full page loads and ensure
    // legacy session flags do not suppress it on refresh.
    clearLegacyPreloaderSeenFlag();
    setDocumentLoadingState(true);
  }, []);

  const handleFinished = useCallback(() => {
    setDocumentLoadingState(false);
    setShouldRender(false);
  }, []);

  if (!shouldRender) return null;

  return <PreloaderClient onFinished={handleFinished} />;
}
