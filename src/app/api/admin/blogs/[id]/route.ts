import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { blogPosts } from "~/server/db/schema";
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
    const [row] = await db
      .update(blogPosts)
      .set(parsed.data)
      .where(eq(blogPosts.id, id))
      .returning();
    return NextResponse.json({ data: row });
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
