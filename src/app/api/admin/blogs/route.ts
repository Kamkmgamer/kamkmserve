import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { blogPosts, users } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

const BlogSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  content: z.string().min(1),
  thumbnailUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

export async function GET() {
  try {
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
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
    return NextResponse.json({ data: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = BlogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Determine author from Clerk, and ensure existence in local users table
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find or create app user by Clerk user id
    const clerkId = clerkUser.id;
    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    const name = clerkUser.firstName ?? clerkUser.username ?? email ?? "User";

    let appUserId: string | undefined;
    {
      const found = await db.select().from(users).where(eq(users.clerkUserId, clerkId)).limit(1);
      if (found.length) {
        appUserId = found[0]!.id;
      } else {
        const created = await db
          .insert(users)
          .values({ clerkUserId: clerkId, email: email ?? `${clerkId}@example.com`, name })
          .returning({ id: users.id });
        const createdId = created[0]?.id;
        if (!createdId) {
          return NextResponse.json({ error: "Failed to create user for blog author" }, { status: 500 });
        }
        appUserId = createdId;
      }
    }

    if (!appUserId) {
      return NextResponse.json({ error: "Unable to resolve author user" }, { status: 500 });
    }

    const [row] = await db
      .insert(blogPosts)
      .values({
        title: parsed.data.title,
        summary: parsed.data.summary,
        content: parsed.data.content,
        thumbnailUrl: parsed.data.thumbnailUrl,
        userId: appUserId,
      })
      .returning();

    return NextResponse.json({ data: row }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
