import { db } from "~/server/db";
import { payouts, referrals } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import type { ComponentProps } from "react";
import PayoutsClient from "./payouts-client";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const rows = await db
    .select({
      id: payouts.id,
      referralId: payouts.referralId,
      amount: payouts.amount,
      status: payouts.status,
      payoutDate: payouts.payoutDate,
      createdAt: payouts.createdAt,
      updatedAt: payouts.updatedAt,
      referralCode: referrals.code,
    })
    .from(payouts)
    .leftJoin(referrals, eq(referrals.id, payouts.referralId))
    .orderBy(desc(payouts.createdAt));

  type InitialData = ComponentProps<typeof PayoutsClient>["initialData"];
  const clientRows: InitialData = rows.map((r) => ({
    id: r.id,
    referralId: r.referralId,
    referralCode: r.referralCode ?? "—",
    amount: r.amount,
    status: r.status,
    payoutDate: r.payoutDate ? (r.payoutDate instanceof Date ? r.payoutDate.toISOString() : String(r.payoutDate)) : null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
  }));

  return <PayoutsClient initialData={clientRows} />;
}
