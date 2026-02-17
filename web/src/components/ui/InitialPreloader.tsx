"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearLegacyPreloaderSeenFlag,
  hasInitialLoadCompleted,
  markInitialLoadCompleted,
  setDocumentLoadingState,
} from "@/hooks/initialLoadGate";
import PreloaderClient from "@/components/ui/PreloaderClient";

export default function InitialPreloader() {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (hasInitialLoadCompleted()) {
      setDocumentLoadingState(false);
      setShouldRender(false);
      return;
    }

    // First load in this tab: keep the preloader visible and ensure
    // legacy session flags do not suppress the existing preloader UI.
    clearLegacyPreloaderSeenFlag();
    setDocumentLoadingState(true);
  }, []);

  const handleFinished = useCallback(() => {
    markInitialLoadCompleted();
    setDocumentLoadingState(false);
    setShouldRender(false);
  }, []);

  if (!shouldRender) return null;

  return <PreloaderClient onFinished={handleFinished} />;
}
