import type { ReactNode } from "react";

type StatusPillProps = {
  children: ReactNode;
  tone?: "muted";
};

export function StatusPill({ children, tone = "muted" }: StatusPillProps) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}
