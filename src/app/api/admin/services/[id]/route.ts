import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { services } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const PartialServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  features: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  imageUrls: z.string().min(1).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const parsed = PartialServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const [row] = await db
      .update(services)
      .set(parsed.data)
      .where(eq(services.id, id))
      .returning();
    return NextResponse.json({ data: row });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const [row] = await db
      .delete(services)
      .where(eq(services.id, id))
      .returning();
    return NextResponse.json({ data: row });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
