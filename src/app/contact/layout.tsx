import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with us",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: "Contact | KAMKM Serve",
    description: "Get in touch with us",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | KAMKM Serve",
    description: "Get in touch with us",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
