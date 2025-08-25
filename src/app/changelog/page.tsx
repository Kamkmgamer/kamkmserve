import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Latest updates and improvements",
  alternates: { canonical: "/changelog" },
  openGraph: {
    type: "website",
    url: "/changelog",
    title: "Changelog | KAMKM Serve",
    description: "Latest updates and improvements",
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog | KAMKM Serve",
    description: "Latest updates and improvements",
  },
};

export default function ChangelogPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Changelog</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">Release notes will appear here.</p>
    </main>
  );
}
