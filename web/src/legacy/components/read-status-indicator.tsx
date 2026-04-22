"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers";
import { isMarkedRead, markAsRead, subscribeToReadState } from "@/lib/read-state";

type ReadStatusIndicatorProps = {
  identifier: string;
  markOnMount?: boolean;
  variant?: "hidden" | "inline" | "pill";
};

export default function ReadStatusIndicator({
  identifier,
  markOnMount = false,
  variant = "inline",
}: ReadStatusIndicatorProps) {
  const { t } = useI18n();
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    setIsRead(isMarkedRead(identifier));
    return subscribeToReadState(() => {
      setIsRead(isMarkedRead(identifier));
    });
  }, [identifier]);

  useEffect(() => {
    if (!markOnMount) {
      return;
    }

    markAsRead(identifier);
    setIsRead(true);
  }, [identifier, markOnMount]);

  const label = isRead ? t("readStatus.read") : t("readStatus.unread");
  if (variant === "hidden") {
    return null;
  }

  const sharedClassName = [
    "type-ui-label inline-flex max-w-full min-w-0 gap-1.5 leading-6 text-neutral-500 dark:text-neutral-400",
    variant === "pill" ? "items-center whitespace-nowrap" : "items-baseline",
  ].join(" ");
  const className =
    variant === "pill"
      ? `${sharedClassName} rounded-full border border-neutral-200/80 bg-neutral-50 px-3 py-1 dark:border-neutral-700 dark:bg-neutral-900/40`
      : sharedClassName;

  return (
    <span className={className}>
      <span
        aria-hidden="true"
        className={[
          "inline-flex h-2.5 w-2.5 shrink-0 self-center rounded-full align-middle leading-none",
          isRead ? "bg-[var(--sd-accent)]" : "border border-current bg-transparent",
        ].join(" ")}
      />
      <span className="min-w-0 leading-6">{label}</span>
    </span>
  );
}
