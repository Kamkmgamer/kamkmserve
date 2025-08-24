import { notFound } from "next/navigation";
import { getAllBlogPosts, getBlogPostBySlug } from "~/server/blogs";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Blog | KAMKM Serve`,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return notFound();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>

      <article className="prose dark:prose-invert max-w-none">
        {/* Render as preformatted text; can swap to MD renderer later */}
        <pre className="whitespace-pre-wrap break-words">{post.content}</pre>
      </article>
    </main>
  );
}
