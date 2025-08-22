import { db } from "~/server/db";
import { commissions, referrals, orders } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import type { ComponentProps } from "react";
import CommissionsClient from "./commissions-client";

export const dynamic = "force-dynamic";

export default async function AdminCommissionsPage() {
  const rows = await db
    .select({
      id: commissions.id,
      orderId: commissions.orderId,
      referralId: commissions.referralId,
      amount: commissions.amount,
      status: commissions.status,
      createdAt: commissions.createdAt,
      updatedAt: commissions.updatedAt,
      referralCode: referrals.code,
      orderTotal: orders.totalAmount,
    })
    .from(commissions)
    .leftJoin(referrals, eq(referrals.id, commissions.referralId))
    .leftJoin(orders, eq(orders.id, commissions.orderId))
    .orderBy(desc(commissions.createdAt));

  type InitialData = ComponentProps<typeof CommissionsClient>["initialData"];
  const clientRows: InitialData = rows.map((r) => ({
    id: r.id,
    orderId: r.orderId,
    referralId: r.referralId,
    referralCode: r.referralCode ?? "—",
    amount: r.amount,
    status: r.status,
    orderTotal: r.orderTotal ?? 0,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
  }));

  return <CommissionsClient initialData={clientRows} />;
}
