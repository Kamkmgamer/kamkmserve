import * as React from "react";
import { cn } from "~/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-token bg-surface px-3 py-2 outline-none",
        "focus:ring-2 focus:ring-[var(--color-brand)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
