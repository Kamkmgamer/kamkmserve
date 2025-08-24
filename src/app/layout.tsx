import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import PublicChrome from "../components/layout/PublicChrome";
import { ThemeProvider } from "../contexts/ThemeContext";
import Script from "next/script";


import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "KAMKM Serve",
  description: "KAMKM Serve",
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
            <PublicChrome>{children}</PublicChrome>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
