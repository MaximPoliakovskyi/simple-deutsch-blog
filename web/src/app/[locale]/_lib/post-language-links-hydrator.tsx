"use client";

import { memo, useEffect } from "react";
import { type PostLangLinks, type SiteLang, usePostLangLinks } from "@/components/providers";

type Props = {
  currentLang: SiteLang;
  links: Record<SiteLang, string | null>;
};

const PostLanguageLinksHydrator = memo(function PostLanguageLinksHydrator({
  currentLang,
  links,
}: Props) {
  const { setPostLangLinks } = usePostLangLinks();

  useEffect(() => {
    const payload: PostLangLinks = { currentLang, links };
    setPostLangLinks(payload);
    return () => setPostLangLinks(null);
  }, [currentLang, links, setPostLangLinks]);

  return null;
});

export default PostLanguageLinksHydrator;
