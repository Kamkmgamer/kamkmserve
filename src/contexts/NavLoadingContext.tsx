"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface NavLoadingContextValue {
  isNavLoading: boolean;
  start: () => void;
  stop: () => void;
}

const NavLoadingContext = createContext<NavLoadingContextValue | undefined>(undefined);

export function NavLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isNavLoading, setIsNavLoading] = useState(false);
  const pathname = usePathname();

  const start = useCallback(() => setIsNavLoading(true), []);
  const stop = useCallback(() => setIsNavLoading(false), []);

  // When the pathname changes, we assume navigation completed -> stop overlay.
  useEffect(() => {
    if (!isNavLoading) return;
    // Allow next tick for new route to mount before hiding, avoids flash.
    const t = setTimeout(() => setIsNavLoading(false), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value = { isNavLoading, start, stop };
  return <NavLoadingContext.Provider value={value}>{children}</NavLoadingContext.Provider>;
}

export function useNavLoading() {
  const ctx = useContext(NavLoadingContext);
  if (!ctx) throw new Error("useNavLoading must be used within NavLoadingProvider");
  return ctx;
}
