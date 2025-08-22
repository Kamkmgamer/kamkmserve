import { db } from "~/server/db";
import { blogPosts, users } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import type { ComponentProps } from "react";
import BlogsClient from "./blogs-client";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const rows = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      summary: blogPosts.summary,
      content: blogPosts.content,
      thumbnailUrl: blogPosts.thumbnailUrl,
      createdAt: blogPosts.createdAt,
      updatedAt: blogPosts.updatedAt,
      userId: blogPosts.userId,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(blogPosts)
    .leftJoin(users, eq(users.id, blogPosts.userId))
    .orderBy(desc(blogPosts.createdAt));

  type InitialData = ComponentProps<typeof BlogsClient>["initialData"];
  const clientRows: InitialData = rows.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    content: r.content,
    thumbnailUrl: r.thumbnailUrl ?? null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    userId: r.userId,
    author: r.authorName ?? r.authorEmail ?? "Unknown",
  }));

  return <BlogsClient initialData={clientRows} />;
}
