import { db } from "~/server/db";
import { referrals, users } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import type { ComponentProps } from "react";
import ReferralsClient from "./referrals-client";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const rows = await db
    .select({
      id: referrals.id,
      userId: referrals.userId,
      code: referrals.code,
      commissionRate: referrals.commissionRate,
      createdAt: referrals.createdAt,
      updatedAt: referrals.updatedAt,
      userEmail: users.email,
    })
    .from(referrals)
    .leftJoin(users, eq(users.id, referrals.userId))
    .orderBy(desc(referrals.createdAt));

  type InitialData = ComponentProps<typeof ReferralsClient>["initialData"];
  const clientRows: InitialData = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userEmail: r.userEmail ?? "—",
    code: r.code,
    commissionRate: r.commissionRate,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
  }));

  return <ReferralsClient initialData={clientRows} />;
}
