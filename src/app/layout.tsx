import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./_Components/navbar"; // add this import
import Footer from "../components/layout/Footer";


import { type Metadata } from "next";
import { Geist } from "next/font/google";

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
      <html lang="en" className={`${geist.variable}`}>
        <body className="font-sans bg-[var(--color-bg)] text-[var(--color-text)]">
          <Navbar />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
