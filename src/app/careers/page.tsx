import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the team",
  alternates: { canonical: "/careers" },
  openGraph: {
    type: "website",
    url: "/careers",
    title: "Careers | KAMKM Serve",
    description: "Join the team",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers | KAMKM Serve",
    description: "Join the team",
  },
};

export default function CareersPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Careers</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">No open roles right now. Check back later.</p>
    </main>
  );
}
