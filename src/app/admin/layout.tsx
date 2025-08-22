import type { Metadata } from "next";
import AdminLayout from "./AdminLayout";

export const metadata: Metadata = {
  title: "Admin | KAMKM Serve",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
