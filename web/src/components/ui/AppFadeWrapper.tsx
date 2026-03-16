"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTransitionNav } from "@/components/transition/useTransitionNav";

type FadeState = "visible" | "fading-out" | "hidden" | "fading-in";

export default function AppFadeWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const { phase } = useTransitionNav();
  const [fadeState, setFadeState] = useState<FadeState>("visible");
  const wasTransitionActiveRef = useRef(false);
  const previousPathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    if (phase !== "idle") {
      wasTransitionActiveRef.current = true;
      setFadeState((current) => {
        if (current === "hidden" || current === "fading-out") return current;
        return "fading-out";
      });
      return;
    }

    if (!wasTransitionActiveRef.current) return;

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      setFadeState("hidden");
      secondFrame = requestAnimationFrame(() => {
        setFadeState("fading-in");
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [phase]);

  useEffect(() => {
    if (fadeState !== "fading-in") return;

    const timeout = window.setTimeout(() => {
      setFadeState("visible");
      wasTransitionActiveRef.current = false;
    }, 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fadeState]);

  useLayoutEffect(() => {
    if (previousPathnameRef.current === pathname) return;

    previousPathnameRef.current = pathname;
    if (wasTransitionActiveRef.current || phase !== "idle") return;

    let secondFrame = 0;
    setFadeState("hidden");
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setFadeState("fading-in");
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [pathname, phase]);

  return (
    <div className="app-fade">
      <div className={`app-route-fade app-route-fade--${fadeState}`}>{children}</div>
    </div>
  );
}
