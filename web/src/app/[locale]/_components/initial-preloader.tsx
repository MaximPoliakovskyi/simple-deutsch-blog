"use client";

import { useCallback, useEffect, useState } from "react";
import { setDocumentLoadingState } from "@/lib/initial-load-gate";
import PreloaderClient from "./preloader-client";

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
