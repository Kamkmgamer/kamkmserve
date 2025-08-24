import { notFound } from "next/navigation";
import { getAllBlogPosts, getBlogPostBySlug } from "~/server/blogs";
import BlogDetailClient from "../_components/BlogDetailClient";

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
    <BlogDetailClient post={post} />
  );
}
