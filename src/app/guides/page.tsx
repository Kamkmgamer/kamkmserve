import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides",
  description: "How-to guides and tutorials",
  alternates: { canonical: "/guides" },
  openGraph: {
    type: "website",
    url: "/guides",
    title: "Guides | KAMKM Serve",
    description: "How-to guides and tutorials",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guides | KAMKM Serve",
    description: "How-to guides and tutorials",
  },
};

export default function GuidesPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Guides</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">Guided tutorials will be added soon.</p>
    </main>
  );
}
