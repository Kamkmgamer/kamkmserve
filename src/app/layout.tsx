import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import PublicChrome from "../components/layout/PublicChrome";
import { ThemeProvider } from "../contexts/ThemeContext";
import Script from "next/script";
import { NavLoadingProvider } from "../contexts/NavLoadingContext";
import NavLoadingOverlay from "../components/layout/NavLoadingOverlay";
import CookieConsent from "../components/layout/CookieConsent";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KAMKM Serve",
    template: "%s | KAMKM Serve",
  },
  description: "KAMKM Serve",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "KAMKM Serve",
    description: "KAMKM Serve",
    siteName: "KAMKM Serve",
  },
  twitter: {
    card: "summary_large_image",
    title: "KAMKM Serve",
    description: "KAMKM Serve",
  },
  icons: [{ rel: "icon", url: "https://ik.imagekit.io/gtnmxyt2d/servises%20store/favicon.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {    
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
        <body id="top" className="font-sans bg-[var(--color-bg)] text-[var(--color-text)]">
          {/* Prevent theme flash on first paint */}
          <Script src="/theme-init.js" strategy="beforeInteractive" />
          <ThemeProvider>
            <NavLoadingProvider>
              <PublicChrome>{children}</PublicChrome>
              <Toaster richColors position="top-right" />
              {/* Immediate overlay on navigations */}
              <NavLoadingOverlay />
              {/* Cookie banner & preferences */}
              <CookieConsent />
            </NavLoadingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
