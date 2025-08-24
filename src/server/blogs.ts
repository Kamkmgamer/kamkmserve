import { db } from "~/server/db";
import { blogPosts as blogPostsTable } from "~/server/db/schema";
import { desc } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";

export type BlogPost = {
  id: string;
  title: string;
  summary: string;
  content: string;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const getAllBlogPosts = cache(
  async (): Promise<(BlogPost & { slug: string })[]> => {
    const rows = await db
      .select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.createdAt));

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      content: r.content,
      thumbnailUrl: r.thumbnailUrl ?? null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
      slug: slugifyTitle(r.title),
    }));
  },
  ["blogs:all"],
  { revalidate: 300, tags: ["blogs"] }
);

export const getBlogPostBySlug = async (slug: string): Promise<(BlogPost & { slug: string }) | null> =>
  cache(
    async () => {
      const all = await getAllBlogPosts();
      return all.find((p) => p.slug === slug) ?? null;
    },
    ["blogs:by-slug", slug],
    { revalidate: 300, tags: ["blogs", `blog:${slug}`] }
  )();

export { slugifyTitle };
