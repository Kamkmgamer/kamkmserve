import { db } from "~/server/db";
import { orders, users, coupons } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import type { ComponentProps } from "react";
import OrdersClient from "./orders-client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rows = await db
    .select({
      id: orders.id,
      userEmail: users.email,
      totalAmount: orders.totalAmount,
      status: orders.status,
      couponCode: coupons.code,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))
    .leftJoin(coupons, eq(coupons.id, orders.couponId))
    .orderBy(desc(orders.createdAt));

  type InitialData = ComponentProps<typeof OrdersClient>["initialData"];
  const clientRows: InitialData = rows.map((r) => ({
    id: r.id,
    userEmail: r.userEmail ?? "—",
    totalAmount: r.totalAmount,
    status: r.status,
    couponCode: r.couponCode ?? null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
  }));

  return <OrdersClient initialData={clientRows} />;
}
