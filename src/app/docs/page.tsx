import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description: "Documentation",
  alternates: { canonical: "/docs" },
  openGraph: {
    type: "website",
    url: "/docs",
    title: "Docs | KAMKM Serve",
    description: "Documentation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docs | KAMKM Serve",
    description: "Documentation",
  },
};

export default function DocsPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Documentation</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">Developer docs are coming soon.</p>
    </main>
  );
}
