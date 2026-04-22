"use client";

import { useEffect } from "react";

export default function TopWordsScrollHighlight() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("top-words-highlight");
  }, []);

  return null;
}
