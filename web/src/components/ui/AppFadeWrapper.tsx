import type { ReactNode } from "react";

export default function AppFadeWrapper({ children }: { children: ReactNode }) {
  return <div className="app-fade">{children}</div>;
}
