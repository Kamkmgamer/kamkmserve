import * as React from "react";
import { cn } from "~/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("relative z-10 w-full max-w-lg rounded-2xl border border-token bg-surface p-5 shadow-card", className)}>
        {title ? <h3 className="text-lg font-semibold">{title}</h3> : null}
        <div className={cn(title ? "mt-3" : "")}>{children}</div>
      </div>
    </div>
  );
}
