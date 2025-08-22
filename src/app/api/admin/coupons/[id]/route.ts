import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { coupons } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const PartialSchema = z.object({
  code: z.string().min(1).optional(),
  type: z.enum(["percent", "fixed"]).or(z.string().min(1)).optional(),
  value: z.number().int().nonnegative().optional(),
  minOrderAmount: z.number().int().nonnegative().nullable().optional(),
  maxUses: z.number().int().nonnegative().nullable().optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = PartialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const values = {
      ...parsed.data,
      // normalize nullable string datetime to Date | null
      expiresAt: parsed.data.expiresAt === undefined
        ? undefined
        : parsed.data.expiresAt === null
        ? null
        : new Date(parsed.data.expiresAt),
    };

    const updated = await db
      .update(coupons)
      .set(values)
      .where(eq(coupons.id, id))
      .returning({ id: coupons.id });

    const updatedId = updated[0]?.id;
    if (!updatedId) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    const [r] = await db
      .select({
        id: coupons.id,
        code: coupons.code,
        type: coupons.type,
        value: coupons.value,
        minOrderAmount: coupons.minOrderAmount,
        maxUses: coupons.maxUses,
        currentUses: coupons.currentUses,
        active: coupons.active,
        expiresAt: coupons.expiresAt,
        createdAt: coupons.createdAt,
        updatedAt: coupons.updatedAt,
      })
      .from(coupons)
      .where(eq(coupons.id, updatedId))
      .limit(1);

    if (!r) return NextResponse.json({ error: "Failed to load updated coupon" }, { status: 500 });

    const data = {
      id: r.id,
      code: r.code,
      type: r.type,
      value: r.value,
      minOrderAmount: r.minOrderAmount ?? null,
      maxUses: r.maxUses ?? null,
      currentUses: r.currentUses,
      active: r.active,
      expiresAt: r.expiresAt ? (r.expiresAt instanceof Date ? r.expiresAt.toISOString() : String(r.expiresAt)) : null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    };

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    const [row] = await db
      .delete(coupons)
      .where(eq(coupons.id, id))
      .returning({ id: coupons.id });
    if (!row?.id) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    return NextResponse.json({ data: { id: row.id } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
