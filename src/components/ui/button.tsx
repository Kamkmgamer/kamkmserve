import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "~/lib/cn";

// Variants and sizes per requested API
type Variant = "primary" | "secondary" | "ghost" | "cta-light" | "cta-ghost";
type Size = "sm" | "md" | "lg";

interface BaseButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}

type ButtonAsButton = BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    as?: "button";
  };

type ButtonAsLink = BaseButtonProps &
  Omit<LinkProps, "className" | "children"> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    as?: typeof Link;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-blue-900 to-blue-500 text-blue-100 hover:from-blue-800 hover:to-blue-400 shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:opacity-60 disabled:hover:shadow-none",
  secondary:
    "bg-blue-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-blue-100 border border-slate-200 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-900 hover:border-blue-400/70 dark:hover:border-blue-400/60 focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:opacity-60",
  ghost:
    "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:opacity-60",
  "cta-light":
    "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 border border-slate-200 shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:opacity-60",
  "cta-ghost":
    "bg-blue-100 text-blue-700 border border-blue-500 hover:bg-blue-50 hover:text-blue-800 dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-300 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:opacity-60",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-md",
  md: "h-11 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-lg",
};

const baseClasses =
  "inline-flex items-center justify-center select-none font-semibold transition-colors duration-200 outline-none disabled:cursor-not-allowed";

function isLinkProps(props: ButtonProps): props is ButtonAsLink {
  // Treat as Link if Next.js Link is provided via `as` or if `href` exists
  return (props as ButtonAsLink).as === Link || "href" in props;
}

const Button: React.FC<ButtonProps> = (props) => {
  const {
    children,
    variant = "primary",
    size = "md",
    className = "",
    disabled,
    ...rest
  } = props;

  const classes = cn(baseClasses, sizeClasses[size], variantClasses[variant], className);

  if (isLinkProps(props)) {
    const { as: _unusedAs, href, ...linkProps } = rest as ButtonAsLink;
    void _unusedAs; // explicitly ignore custom `as` prop

    if (disabled) {
      return (
        <span className={cn(classes, "pointer-events-none opacity-60")} aria-disabled="true">
          {children}
        </span>
      );
    }

    return (
      <Link className={classes} {...(linkProps as Omit<LinkProps, "className" | "children" | "href">)} href={href}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} disabled={disabled} {...buttonProps}>
      {children}
    </button>
  );
};

export default Button;
export { Button };
