import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { coupons, orders } from "~/server/db/schema";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";

const CouponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["percent", "fixed"]).or(z.string().min(1)),
  value: z.number().int().nonnegative(),
  minOrderAmount: z.number().int().nonnegative().optional(),
  maxUses: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  expiresAt: z
    .string()
    .refine(
      (v) => /^(\d{4})-(\d{2})-(\d{2})$/.test(v) || !Number.isNaN(Date.parse(v)),
      { message: "Invalid date format. Use YYYY-MM-DD or a valid datetime string." },
    )
    .optional(),
});

export async function GET() {
  try {
    const rows = await db
      .select({
        id: coupons.id,
        code: coupons.code,
        type: coupons.type,
        value: coupons.value,
        minOrderAmount: coupons.minOrderAmount,
        maxUses: coupons.maxUses,
        currentUses: coupons.currentUses, // will be overridden by aggregate below
        active: coupons.active,
        expiresAt: coupons.expiresAt,
        createdAt: coupons.createdAt,
        updatedAt: coupons.updatedAt,
      })
      .from(coupons)
      .orderBy(desc(coupons.createdAt));

    // Aggregate order counts per coupon
    const agg = await db
      .select({ couponId: orders.couponId })
      .from(orders)
      .where(
        and(
          isNotNull(orders.couponId),
          // exclude non-successful orders from usage
          inArray(orders.status, ["PENDING", "PAID", "IN_TECHNICAL_REVIEW", "APPROVED"]) // keep PENDING to reflect holds, exclude CANCELED/REFUNDED/FAILED
        ),
      );
    const counts = new Map<string, number>();
    for (const r of agg) {
      if (!r.couponId) continue;
      counts.set(r.couponId, (counts.get(r.couponId) ?? 0) + 1);
    }

    const data = rows.map((r) => ({
      id: r.id,
      code: r.code,
      type: r.type,
      value: r.value,
      minOrderAmount: r.minOrderAmount ?? null,
      maxUses: r.maxUses ?? null,
      currentUses: counts.get(r.id) ?? 0,
      active: r.active,
      expiresAt: r.expiresAt ? (r.expiresAt instanceof Date ? r.expiresAt.toISOString() : String(r.expiresAt)) : null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    }));

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = CouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const values = {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrderAmount: parsed.data.minOrderAmount,
      maxUses: parsed.data.maxUses,
      active: parsed.data.active ?? true,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    };

    const inserted = await db
      .insert(coupons)
      .values(values)
      .returning({ id: coupons.id });

    const id = inserted[0]?.id;
    if (!id) {
      return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }

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
      .where(eq(coupons.id, id))
      .limit(1);

    if (!r) return NextResponse.json({ error: "Failed to load created coupon" }, { status: 500 });

    // recompute currentUses for this coupon
    const agg = await db
      .select({ couponId: orders.couponId })
      .from(orders)
      .where(
        and(
          eq(orders.couponId, r.id),
          inArray(orders.status, ["PENDING", "PAID", "IN_TECHNICAL_REVIEW", "APPROVED"]),
        ),
      );
    const usage = agg.length;

    const data = {
      id: r.id,
      code: r.code,
      type: r.type,
      value: r.value,
      minOrderAmount: r.minOrderAmount ?? null,
      maxUses: r.maxUses ?? null,
      currentUses: usage,
      active: r.active,
      expiresAt: r.expiresAt ? (r.expiresAt instanceof Date ? r.expiresAt.toISOString() : String(r.expiresAt)) : null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    };

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
