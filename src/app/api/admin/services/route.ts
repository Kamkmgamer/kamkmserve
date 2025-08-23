import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { services } from "~/server/db/schema";
import { desc, like, or } from "drizzle-orm";
import { requireRole } from "~/server/auth/roles";

const ServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  features: z.string().min(1),
  category: z.string().min(1),
  thumbnailUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  imageUrls: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const auth = await requireRole("ADMIN");
    if (!auth.ok) return auth.res;
    const { searchParams } = new URL(req.url);
    const qp = Object.fromEntries(searchParams.entries());
    const QuerySchema = z.object({ q: z.string().trim().max(200).optional() });
    const parsed = QuerySchema.safeParse(qp);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const q = parsed.data.q;
    const rows = await db
      .select()
      .from(services)
      .where(
        q
          ? or(
              like(services.name, `%${q}%`),
              like(services.category, `%${q}%`),
              like(services.description, `%${q}%`)
            )
          : undefined
      )
      .orderBy(desc(services.createdAt));
    return NextResponse.json({ data: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole("ADMIN");
    if (!auth.ok) return auth.res;
    const body: unknown = await req.json();
    const parsed = ServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const [row] = await db
      .insert(services)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        features: parsed.data.features,
        category: parsed.data.category,
        thumbnailUrl: parsed.data.thumbnailUrl,
        imageUrls: parsed.data.imageUrls,
      })
      .returning();
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
