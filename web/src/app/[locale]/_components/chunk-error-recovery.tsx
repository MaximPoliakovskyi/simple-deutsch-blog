"use client";

import { useEffect } from "react";

const RETRY_KEY = "sd-chunk-reload-attempted";

function isChunkLoadError(reason: unknown) {
  if (!reason) return false;

  const text =
    typeof reason === "string"
      ? reason
      : reason instanceof Error
        ? `${reason.name} ${reason.message}`
        : String(reason);

  return (
    text.includes("ChunkLoadError") ||
    text.includes("Failed to load chunk") ||
    text.includes("/_next/static/chunks/") ||
    text.includes("/_next/static/css/")
  );
}

function hardReloadOnce() {
  try {
    const attempted = sessionStorage.getItem(RETRY_KEY) === "1";
    if (attempted) return;
    sessionStorage.setItem(RETRY_KEY, "1");

    const url = new URL(window.location.href);
    url.searchParams.set("__reload", Date.now().toString());
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
}

export default function ChunkErrorRecovery() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("__reload")) {
        url.searchParams.delete("__reload");
        window.history.replaceState({}, "", url.toString());
      } else {
        sessionStorage.removeItem(RETRY_KEY);
      }
    } catch {}

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error ?? event.message)) {
        hardReloadOnce();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        event.preventDefault();
        hardReloadOnce();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
