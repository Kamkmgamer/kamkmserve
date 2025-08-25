import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Join our community",
  alternates: { canonical: "/community" },
  openGraph: {
    type: "website",
    url: "/community",
    title: "Community | KAMKM Serve",
    description: "Join our community",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community | KAMKM Serve",
    description: "Join our community",
  },
};

export default function CommunityPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Community</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">Discord and community resources coming soon.</p>
    </main>
  );
}
