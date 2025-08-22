import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { db } from "~/server/db";
import { orders, referrals, payouts } from "~/server/db/schema";
import { sql } from "drizzle-orm";

export default async function AdminHome() {
  // Compute real stats from the database
  // 1) Total Orders
  const totalOrdersRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders);
  const totalOrders = totalOrdersRow[0]?.count ?? 0;

  // 2) Revenue: sum of PAID orders' totalAmount (in cents)
  const revenueRows = await db
    .select({ sum: sql<number>`coalesce(sum(${orders.totalAmount}), 0)` })
    .from(orders)
    .where(sql`${orders.status} in ('PAID','APPROVED','IN_TECHNICAL_REVIEW')`);
  const revenueCents = revenueRows[0]?.sum ?? 0;

  // 3) Active Referrals: total referrals count
  const activeReferralsRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(referrals);
  const activeReferrals = activeReferralsRow[0]?.count ?? 0;

  // 4) Pending Payouts: payouts not marked as PAID
  const pendingPayoutsRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(payouts)
    .where(sql`status <> 'PAID'`);
  const pendingPayouts = pendingPayoutsRow[0]?.count ?? 0;

  const stats = [
    { title: "Total Orders", value: String(totalOrders ?? 0) },
    { title: "Revenue", value: `$${(revenueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { title: "Active Referrals", value: String(activeReferrals ?? 0) },
    { title: "Pending Payouts", value: String(pendingPayouts ?? 0) },
  ];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Use the sidebar to manage Services, Blogs, Coupons, Orders, Referrals and Payouts.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-4">
            <CardHeader>
              <h3 className="text-lg font-bold">{stat.title}</h3>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stat.value}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
