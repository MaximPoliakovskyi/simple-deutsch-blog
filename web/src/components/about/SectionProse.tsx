import type React from "react";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

export default function SectionProse({ children, className = "" }: Props) {
  return (
    <div className={"w-full mx-auto max-w-[72ch] text-center md:text-left " + className}>
      <div
        className={
          "space-y-6 md:space-y-8 text-lg md:text-xl leading-[1.6] text-(--sd-text-muted) hyphens-auto wrap-break-word " +
          className
        }
      >
        {children}
      </div>
    </div>
  );
}
