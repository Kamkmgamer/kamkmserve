import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./_Components/navbar"; // add this import


import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "KAMKM Serve",
  description: "KAMKM Serve",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      <html lang="en" className={`${geist.variable}`}>
        <body className="font-sans bg-[var(--color-bg)] text-[var(--color-text)]">
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
