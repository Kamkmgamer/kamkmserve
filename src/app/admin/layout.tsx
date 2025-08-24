import type { Metadata } from "next";
import AdminLayout from "./AdminLayout";
import { LoadingScreen } from "~/components/layout/LoadingScreen";

export const metadata: Metadata = {
  title: "Admin | KAMKM Serve",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return 
  <AdminLayout>
    <LoadingScreen>
      {children}
    </LoadingScreen>
  </AdminLayout>;
}
