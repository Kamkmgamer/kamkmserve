import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { services } from "~/server/db/schema";
import { desc } from "drizzle-orm";

const ServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  features: z.string().min(1),
  category: z.string().min(1),
  thumbnailUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  imageUrls: z.string().min(1),
});

export async function GET() {
  try {
    const rows = await db.select().from(services).orderBy(desc(services.createdAt));
    return NextResponse.json({ data: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
