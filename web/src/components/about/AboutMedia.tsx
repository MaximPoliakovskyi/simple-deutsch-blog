import Image from "next/image";
import React from "react";

type AboutMediaProps = {
  src?: string;
  alt?: string;
  // allow custom class on inner element
  className?: string;
};

export default function AboutMedia({ src, alt = "", className = "" }: AboutMediaProps) {
  // Outer wrapper controls the exact desktop width (928px) and centers the media.
  // Inner element keeps aspect ratio and fills the container.
  return (
    <div className="w-full max-w-232 mx-auto">
      {src ? (
        <div className={`aspect-video rounded-2xl overflow-hidden w-full ${className}`}>
          <Image
            src={src}
            alt={alt}
            width={928}
            height={Math.round((928 * 9) / 16)}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`aspect-video bg-neutral-200 dark:bg-white/10 rounded-2xl w-full ${className}`}
        />
      )}
    </div>
  );
}
