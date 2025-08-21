import * as React from "react";
import { cn } from "~/lib/cn";

type BadgeIntent = "neutral" | "success" | "error" | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: BadgeIntent;
}

const intentMap: Record<BadgeIntent, string> = {
  neutral: "bg-surface text-muted border border-token",
  success: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  error: "bg-[var(--color-error)]/15 text-[var(--color-error)]",
  warning: "bg-[var(--color-accent)]/15 text-[var(--color-accent)]",
};

export function Badge({ className, intent = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        intentMap[intent],
        className
      )}
      {...props}
    />
  );
}
