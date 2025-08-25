"use client";
import React from "react";
import Link, { type LinkProps } from "next/link";
import Button, { type ButtonProps } from "~/components/ui/button";
import { trackEvent } from "~/lib/analytics";

export type CTAButtonProps = {
  children?: React.ReactNode;
  href?: LinkProps["href"];
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  title?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  eventName?: string;
  eventProps?: Record<string, unknown>;
};

export default function CTAButton(props: CTAButtonProps) {
  const {
    children,
    eventName = "cta_click",
    eventProps,
    href,
    size,
    variant,
    className,
    target,
    rel,
    title,
    onClick,
  } = props;

  const finalHref: LinkProps["href"] = href ?? "/contact";
  const finalSize: ButtonProps["size"] = size ?? "lg";
  const finalVariant: ButtonProps["variant"] = variant ?? "primary";

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    trackEvent(eventName, {
      href: typeof finalHref === "string" ? finalHref : undefined,
      label: typeof children === "string" ? children : undefined,
      ...eventProps,
    });
    onClick?.(e);
  };

  return (
    <Button
      as={Link}
      href={finalHref}
      size={finalSize}
      variant={finalVariant}
      className={className}
      target={target}
      rel={rel}
      title={title}
      onClick={handleClick}
    >
      {children ?? "Get Started"}
    </Button>
  );
}
