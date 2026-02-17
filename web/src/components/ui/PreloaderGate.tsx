"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTransitionNav } from "@/components/transition/useTransitionNav";
import PreloaderClient from "@/components/ui/PreloaderClient";

const PRELOADER_SEEN_KEY = "preloader_seen";

function setLoadingState(isLoading: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-preloader", isLoading ? "1" : "0");
  document.documentElement.setAttribute("data-app-visible", isLoading ? "0" : "1");
}

export default function PreloaderGate({ children }: { children: ReactNode }) {
  const { phase, token } = useTransitionNav();
  const [initialFinished, setInitialFinished] = useState(false);
  const [transitionRunId, setTransitionRunId] = useState(0);
  const [showTransitionPreloader, setShowTransitionPreloader] = useState(false);
  const lastTransitionTokenRef = useRef<number>(0);

  const handleInitialFinished = useCallback(() => {
    setInitialFinished(true);
    setLoadingState(false);
  }, []);

  const handleTransitionFinished = useCallback(() => {
    setShowTransitionPreloader(false);
    setLoadingState(false);
  }, []);

  useEffect(() => {
    if (!initialFinished) return;
    if (phase !== "entering") return;
    if (!token || token === lastTransitionTokenRef.current) return;

    lastTransitionTokenRef.current = token;

    try {
      sessionStorage.removeItem(PRELOADER_SEEN_KEY);
    } catch (_) {}

    setLoadingState(true);
    setTransitionRunId((prev) => prev + 1);
    setShowTransitionPreloader(true);
  }, [initialFinished, phase, token]);

  return (
    <>
      {!initialFinished ? <PreloaderClient onFinished={handleInitialFinished} /> : null}
      {showTransitionPreloader ? (
        <PreloaderClient
          key={`transition-preloader-${transitionRunId}`}
          onFinished={handleTransitionFinished}
        />
      ) : null}
      {children}
    </>
  );
}
