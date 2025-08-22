import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { blogPosts, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const PartialBlogSchema = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(
  req: Request,
  context: RouteCtx
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body: unknown = await req.json();
    const parsed = PartialBlogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const updated = await db
      .update(blogPosts)
      .set(parsed.data)
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id });
    const updatedId = updated[0]?.id;
    if (!updatedId) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const [full] = await db
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
      .where(eq(blogPosts.id, updatedId))
      .limit(1);

    const data = full
      ? {
          id: full.id,
          title: full.title,
          summary: full.summary,
          content: full.content,
          thumbnailUrl: full.thumbnailUrl ?? null,
          createdAt: full.createdAt instanceof Date ? full.createdAt.toISOString() : String(full.createdAt),
          updatedAt: full.updatedAt instanceof Date ? full.updatedAt.toISOString() : String(full.updatedAt),
          userId: full.userId,
          author: full.authorName ?? full.authorEmail ?? "Unknown",
        }
      : undefined;

    if (!data) {
      return NextResponse.json({ error: "Failed to load updated post" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: RouteCtx
) {
  try {
    const params = await context.params;
    const id = params.id;
    const [row] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    return NextResponse.json({ data: row });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
