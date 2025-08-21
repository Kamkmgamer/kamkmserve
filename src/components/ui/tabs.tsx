import * as React from "react";
import { cn } from "~/lib/cn";

export function Tabs({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full", className)} {...props} />;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex gap-2 rounded-xl border border-token bg-surface p-1", className)} {...props} />
  );
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean };
export function TabsTrigger({ className, active, ...props }: TriggerProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm transition",
        active ? "bg-brand text-white" : "text-muted hover:bg-surface",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-3", className)} {...props} />;
}
