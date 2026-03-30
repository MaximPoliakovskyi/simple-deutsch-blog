"use client";

import { useCallback, useEffect, useState } from "react";
import PreloaderClient from "@/components/ui/PreloaderClient";
import { setDocumentLoadingState } from "@/hooks/initialLoadGate";

export default function InitialPreloader() {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    setDocumentLoadingState(true);
  }, []);

  const handleFinished = useCallback(() => {
    setDocumentLoadingState(false);
    setShouldRender(false);
  }, []);

  if (!shouldRender) return null;

  return <PreloaderClient onFinished={handleFinished} />;
}
