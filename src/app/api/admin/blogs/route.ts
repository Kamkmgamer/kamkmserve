import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { blogPosts, users } from "~/server/db/schema";
import { desc, eq, like, or } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

const BlogSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  content: z.string().min(1),
  thumbnailUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
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
      .where(
        q
          ? or(
              like(blogPosts.title, `%${q}%`),
              like(blogPosts.summary, `%${q}%`),
              like(blogPosts.content, `%${q}%`),
              like(users.name, `%${q}%`),
              like(users.email, `%${q}%`)
            )
          : undefined
      )
      .orderBy(desc(blogPosts.createdAt));
    const data = rows.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      content: r.content,
      thumbnailUrl: r.thumbnailUrl,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userId: r.userId,
      author: r.authorName ?? r.authorEmail ?? "Unknown",
    }));
    return NextResponse.json({ data });
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

    const [inserted] = await db
      .insert(blogPosts)
      .values({
        title: parsed.data.title,
        summary: parsed.data.summary,
        content: parsed.data.content,
        thumbnailUrl: parsed.data.thumbnailUrl,
        userId: appUserId,
      })
      .returning({ id: blogPosts.id });

    if (!inserted?.id) {
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }

    // Re-select with author info for client shape
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
      .where(eq(blogPosts.id, inserted.id))
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
      return NextResponse.json({ error: "Failed to load created post" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
