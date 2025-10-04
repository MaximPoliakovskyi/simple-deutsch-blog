// src/components/PageHeader.tsx
import React from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
};

export default function PageHeader({ title, subtitle, align = "center" }: PageHeaderProps) {
  const alignCls = align === "center" ? "text-center" : "text-left";
  return (
    <header className={`mt-24 mb-10 ${alignCls}`}>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
          {subtitle}
        </p>
      )}
    </header>
  );
}
