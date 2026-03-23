import type { ElementType, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type HeadingSize = "page" | "section" | "display";

type Props<T extends ElementType = "h1"> = {
  align?: "start" | "center";
  as?: T;
  className?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  size?: HeadingSize;
  title: ReactNode;
  titleClassName?: string;
};

const sizeClassName: Record<HeadingSize, string> = {
  page: "",
  section: "sd-page-heading--section sd-page-heading--compact",
  display: "sd-page-heading--display",
};

export default function PageHeading<T extends ElementType = "h1">({
  align = "start",
  as,
  className,
  description,
  descriptionClassName,
  size = "page",
  title,
  titleClassName,
}: Props<T>) {
  const Heading = as ?? "h1";

  return (
    <div
      className={cn(
        "sd-page-heading",
        sizeClassName[size],
        align === "center" && "sd-page-heading--center",
        className,
      )}
    >
      <Heading className={cn("sd-page-heading__title", titleClassName)}>{title}</Heading>
      {description ? (
        <p className={cn("sd-page-heading__description", descriptionClassName)}>{description}</p>
      ) : null}
    </div>
  );
}
