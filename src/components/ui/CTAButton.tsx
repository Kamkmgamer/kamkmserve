"use client";
import React from "react";
import Link from "next/link";
import Button, { type ButtonProps } from "~/components/ui/button";
import { trackEvent } from "~/lib/analytics";

export type CTAButtonProps = {
  children?: React.ReactNode;
  href?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
  target?: string;
  rel?: string;
  title?: string;
  onClick?: (e: any) => void;
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

  const finalHref = (href ?? "/contact") as any;
  const finalSize = (size ?? "lg") as ButtonProps["size"];
  const finalVariant = (variant ?? "primary") as ButtonProps["variant"];

  return (
    <Button
      as={Link}
      href={finalHref as any}
      size={finalSize}
      variant={finalVariant}
      className={className}
      target={target as any}
      rel={rel}
      title={title}
      onClick={(e: any) => {
        trackEvent(eventName, {
          href: typeof finalHref === "string" ? finalHref : undefined,
          label: typeof children === "string" ? children : undefined,
          ...eventProps,
        });
        onClick?.(e);
      }}
    >
      {children ?? "Get Started"}
    </Button>
  );
}
