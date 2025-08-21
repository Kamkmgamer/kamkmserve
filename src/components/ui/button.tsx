import * as React from "react";
import { cn } from "~/lib/cn";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";

const sizeMap = {
  sm: "text-sm px-3 py-1.5",
  md: "text-base px-4 py-2",
  lg: "text-lg px-6 py-3",
} as const;

const intentMap = {
  primary: "bg-brand text-white hover:opacity-90",
  secondary:
    "bg-surface text-[var(--color-text)] border border-token shadow-card hover:shadow",
  ghost: "bg-transparent hover:bg-surface border border-transparent",
  destructive: "bg-[var(--color-error)] text-white hover:opacity-90",
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, sizeMap[size], intentMap[intent], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
