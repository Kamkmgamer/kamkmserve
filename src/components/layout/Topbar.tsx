"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CTAButton from "~/components/ui/CTAButton";

export default function Topbar() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const delta = y - lastY.current;
      // Hide when scrolling down beyond 64px, show when scrolling up
      if (y > 64 && delta > 0) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={[
        "sticky top-0 z-[60] w-full backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/30",
        "border-b border-white/10 bg-white/60 dark:bg-black/30",
        "transition-transform duration-300",
        hidden ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
    >
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="text-xs text-black/70 dark:text-white/70">
          <Link href="/contact" className="hover:underline">Free project consultation</Link>
        </div>
        <div className="flex items-center gap-2">
          <CTAButton size="sm" href="/contact" eventName="topbar_hire_click" eventProps={{ location: "topbar" }}>
            Hire Me
          </CTAButton>
        </div>
      </div>
    </div>
  );
}
