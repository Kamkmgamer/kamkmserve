import { getAllBlogPosts } from "~/server/blogs";
import BlogsClient from "./BlogsClient";

export const metadata = {
  title: "Blog | KAMKM Serve",
  description: "Articles, updates, and insights",
};

// Revalidate at most every 5 minutes
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getAllBlogPosts();
  return <BlogsClient initialPosts={posts} />;
}
