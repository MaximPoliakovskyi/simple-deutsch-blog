// src/components/AccessibleImage.tsx
"use client";

import Image, { ImageProps } from "next/image";

type Props = Omit<ImageProps, "alt"> & {
  /** Provide meaningful alt text or "" (if decorative). */
  alt: string;
};

export default function AccessibleImage(props: Props) {
  if (process.env.NODE_ENV !== "production") {
    const t = props.alt.trim();
    const looksGeneric = t.length > 0 && /^(image|bild|photo|foto|graphic|grafik)$/i.test(t);
    if (looksGeneric) {
      console.warn(
        `AccessibleImage: Provide meaningful alt text (got "${props.alt}"). See Next.js Image docs.`
      );
    }
  }
  return <Image {...props} />;
}
