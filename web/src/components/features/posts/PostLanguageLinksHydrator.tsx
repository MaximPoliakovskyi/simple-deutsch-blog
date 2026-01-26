"use client";

import { useEffect } from "react";
import { useI18n, type PostLangLinks, type SiteLang } from "@/core/i18n/LocaleProvider";

type Props = {
  currentLang: SiteLang;
  links: Record<SiteLang, string | null>;
};

export default function PostLanguageLinksHydrator({ currentLang, links }: Props) {
  const { setPostLangLinks } = useI18n();

  useEffect(() => {
    const payload: PostLangLinks = { currentLang, links };
    setPostLangLinks(payload);
    return () => setPostLangLinks(null);
  }, [currentLang, links, setPostLangLinks]);

  return null;
}
