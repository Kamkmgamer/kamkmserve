import { db } from "~/server/db";
import { coupons } from "~/server/db/schema";
import { desc } from "drizzle-orm";
import type { ComponentProps } from "react";
import CouponsClient from "./coupons-client";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const rows = await db
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
    .orderBy(desc(coupons.createdAt));

  type InitialData = ComponentProps<typeof CouponsClient>["initialData"];
  const clientRows: InitialData = rows.map((r) => ({
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
  }));

  return <CouponsClient initialData={clientRows} />;
}
