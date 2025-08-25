import { getAllBlogPosts } from "~/server/blogs";
import BlogsClient from "./BlogsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles, updates, and insights",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    title: "Blog | KAMKM Serve",
    description: "Articles, updates, and insights",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | KAMKM Serve",
    description: "Articles, updates, and insights",
  },
};

// Revalidate at most every 5 minutes
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getAllBlogPosts();
  return <BlogsClient initialPosts={posts} />;
}
