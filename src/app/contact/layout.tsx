import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | KAMKM Serve",
  description: "Get in touch with us",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
