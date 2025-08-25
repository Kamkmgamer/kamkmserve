import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Our upcoming features and milestones",
  alternates: { canonical: "/roadmap" },
  openGraph: {
    type: "website",
    url: "/roadmap",
    title: "Roadmap | KAMKM Serve",
    description: "Our upcoming features and milestones",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roadmap | KAMKM Serve",
    description: "Our upcoming features and milestones",
  },
};

export default function RoadmapPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Roadmap</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">We are crafting an exciting roadmap. Stay tuned!</p>
    </main>
  );
}
