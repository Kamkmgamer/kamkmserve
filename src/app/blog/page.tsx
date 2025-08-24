import Link from "next/link";
import { getAllBlogPosts } from "~/server/blogs";

export const metadata = {
  title: "Blog | KAMKM Serve",
  description: "Articles, updates, and insights",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Articles, updates, and insights.</p>

      <ul className="mt-8 space-y-6">
        {posts.map((p) => (
          <li key={p.slug} className="group rounded-lg border border-slate-200/60 dark:border-slate-800/60 p-5 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
            <Link href={`/blog/${p.slug}`} className="block">
              <h2 className="text-xl font-semibold tracking-tight group-hover:underline">{p.title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
              <p className="mt-2 text-slate-700 dark:text-slate-300">{p.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
