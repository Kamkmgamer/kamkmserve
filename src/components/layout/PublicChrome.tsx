"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "~/app/_Components/navbar";
import Footer from "~/components/layout/Footer";

export default function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // On admin routes, hide public Navbar/Footer
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
